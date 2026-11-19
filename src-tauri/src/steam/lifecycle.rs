use std::{
    path::Path,
    time::{Duration, Instant},
};
use sysinfo::System;
use tauri::AppHandle;
use tokio::time::sleep;

use crate::utils::logger;

use std::process::{Command, Stdio};

#[cfg(target_os = "linux")]
/// Opens a steam:// URL.
fn open_steam_url(url: &str) -> std::io::Result<()> {
    let mut cmd = Command::new("xdg-open");
    cmd.arg(url)
        .stdin(Stdio::null())
        .stdout(Stdio::null())
        .stderr(Stdio::null());

    if std::env::var_os("APPIMAGE").is_some() {
        for var in [
            "LD_LIBRARY_PATH",
            "LD_PRELOAD",
            "GIO_EXTRA_MODULES",
            "GDK_PIXBUF_MODULE_FILE",
            "GST_PLUGIN_PATH",
        ] {
            cmd.env_remove(var);
        }
    }

    let mut child = cmd.spawn()?;
    std::thread::spawn(move || {
        let _ = child.wait();
    });

    return Ok(());
}

#[cfg(not(target_os = "linux"))]
/// Opens a steam:// URL.
fn open_steam_url(url: &str) -> std::io::Result<()> {
    return open::that_detached(url);
}

#[cfg(target_os = "linux")]
fn is_flatpak_steam(root: &Path) -> bool {
    return root
        .components()
        .any(|c| c.as_os_str() == "com.valvesoftware.Steam");
}

fn start_steam_silent(steam_path: &Path) -> std::io::Result<()> {
    #[cfg(target_os = "linux")]
    let mut cmd = if is_flatpak_root(&steam_path) {
        let mut c = Command::new("flatpak");
        c.args(["run", "com.valvesoftware.Steam", "-silent"]);

        if std::env::var_os("APPIMAGE").is_some() {
            for var in [
                "LD_LIBRARY_PATH",
                "LD_PRELOAD",
                "GIO_EXTRA_MODULES",
                "GDK_PIXBUF_MODULE_FILE",
                "GST_PLUGIN_PATH",
            ] {
                c.env_remove(var);
            }
        }

        return c;
    } else {
        let mut c = Command::new(steam_path.join("steam.sh"));
        c.arg("-silent");

        return c;
    };

    #[cfg(target_os = "windows")]
    let mut cmd = Command::new(steam_path.join("steam.exe"));

    cmd.arg("-silent");
    cmd.arg("-cef-enable-remote-debugging");

    cmd.stdin(Stdio::null())
        .stdout(Stdio::null())
        .stderr(Stdio::null());

    let mut child = cmd.spawn()?;
    std::thread::spawn(move || {
        let _ = child.wait();
    });

    return Ok(());
}

/// Checks if Steam is running.
fn check_steam_running(sys: &mut System) -> bool {
    sys.refresh_processes();

    return sys.processes().values().any(|p| {
        let n = p.name().to_ascii_lowercase();
        n == "steam" || n == "steam.exe"
    });
}

#[tauri::command]
/// IPC wrapper for checking if Steam is Running.
pub fn check_steam_running_frontend(_app_handle: AppHandle) -> bool {
    let mut sys = System::new();
    return check_steam_running(&mut sys);
}

/// Starts Steam and waits for it to start.
async fn await_steam_start(steam_path: &Path) -> Result<(), Box<dyn std::error::Error>> {
    let mut sys = System::new();

    if !check_steam_running(&mut sys) {
        let start_res = start_steam_silent(steam_path);

        if start_res.is_err() {
            let msg = start_res.err().unwrap().to_string();
            return Err(msg.into());
        }
    }

    // Wait up to 60s
    let deadline = Instant::now() + Duration::from_secs(60);
    while !check_steam_running(&mut sys) {
        if Instant::now() > deadline {
            return Err("Steam didn't start in time".into());
        }

        sleep(Duration::from_millis(500)).await;
    }

    return Ok(());
}

#[tauri::command]
/// IPC wrapper for starting Steam.
pub async fn await_steam_start_frontend(
    app_handle: AppHandle,
    steam_path: &Path,
) -> Result<bool, ()> {
    let steam_start_res = await_steam_start(steam_path).await;

    if steam_start_res.is_err() {
        let err = steam_start_res.err().unwrap();
        let message = format!("Failed to start Steam. Error: {}", err.to_string());

        logger::log_core(&app_handle, &message, 1);

        return Ok(false);
    }

    return Ok(true);
}

/// Restarts Steam and waits for it to restart.
async fn await_restart_steam(steam_path: &Path) -> Result<(), Box<dyn std::error::Error>> {
    let mut sys = System::new();

    open_steam_url("steam://exit")?;

    // Wait up to 60s
    let deadline = Instant::now() + Duration::from_secs(60);
    while check_steam_running(&mut sys) {
        if Instant::now() > deadline {
            return Err("Steam didn't exit in time".into());
        }

        sleep(Duration::from_millis(500)).await;
    }

    let start_res = await_steam_start(steam_path).await;
    if start_res.is_err() {
        let msg = start_res.err().unwrap().to_string();
        return Err(msg.into());
    }

    return Ok(());
}

#[tauri::command]
/// IPC wrapper for restarting Steam.
pub async fn await_steam_restart_frontend(
    app_handle: AppHandle,
    steam_path: &Path,
) -> Result<bool, ()> {
    let steam_restart_res = await_restart_steam(steam_path).await;

    if steam_restart_res.is_err() {
        let err = steam_restart_res.err().unwrap();
        let message = format!("Failed to restart Steam. Error: {}", err.to_string());

        logger::log_core(&app_handle, &message, 1);

        return Ok(false);
    }

    return Ok(true);
}
