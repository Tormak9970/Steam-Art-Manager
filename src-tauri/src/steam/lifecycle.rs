use std::time::{Duration, Instant};
use sysinfo::System;
use tauri::AppHandle;
use tokio::time::sleep;

#[cfg(target_os = "linux")]
use std::process::{Command, Stdio};

use crate::utils::logger;

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
async fn await_steam_start() -> Result<(), Box<dyn std::error::Error>> {
    let mut sys = System::new();

    if !check_steam_running(&mut sys) {
        open_steam_url("steam://open/main")?;
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
pub async fn await_steam_start_frontend(app_handle: AppHandle) -> bool {
    let steam_start_res = await_steam_start().await;

    if steam_start_res.is_err() {
        let err = steam_start_res.err().unwrap();
        let message = format!("Failed to start Steam. Error: {}", err.to_string());

        logger::log_core(&app_handle, &message, 1);

        return false;
    }

    return true;
}

/// Restarts Steam and waits for it to restart.
async fn await_restart_steam() -> Result<(), Box<dyn std::error::Error>> {
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

    open_steam_url("steam://open/main")?;
    return Ok(());
}

#[tauri::command]
/// IPC wrapper for restarting Steam.
pub async fn await_steam_restart_frontend(app_handle: AppHandle) -> bool {
    let steam_restart_res = await_restart_steam().await;

    if steam_restart_res.is_err() {
        let err = steam_restart_res.err().unwrap();
        let message = format!("Failed to restart Steam. Error: {}", err.to_string());

        logger::log_core(&app_handle, &message, 1);

        return false;
    }

    return true;
}
