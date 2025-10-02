#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod utils;
mod handle_changes;
mod steam;
mod zip_controller;
mod start_menu_tiles;
mod grids_cache_loader;
mod clean_grids;
mod types;

use tauri_plugin_dialog::DialogExt;
use tauri_plugin_fs::FsExt;
use tauri_plugin_http::reqwest::Client;

use std::{path::PathBuf, fs::{self, File}, io::Write, time::Duration, panic::{self, Location}, process::exit};

use serde;
use steam::get_steam_root_dir;
use panic_message::get_panic_info_message;
use tauri::{self, AppHandle, Manager};
use tauri::Emitter;

use utils::logger;

#[derive(Clone, serde::Serialize)]
struct Payload {
  args: Vec<String>,
  cwd: String,
}

#[tauri::command]
/// Downloads a file from a url.
async fn download_grid(app_handle: AppHandle, grid_url: String, dest_path: String, timeout: u64) -> String {
  logger::log_to_core_file(app_handle.to_owned(), format!("Downloading grid from {} to {}", grid_url, dest_path).as_str(), 0);
  
  let http_client_res = Client::builder().timeout(Duration::from_secs(timeout)).build();
  let http_client: Client = http_client_res.expect("Should have been able to successfully make the reqwest client.");

  let response_res = http_client.get(grid_url.clone()).send().await;
  
  if response_res.is_ok() {
    let response = response_res.ok().expect("Should have been able to get response from ok result.");
    let response_bytes = response.bytes().await.expect("Should have been able to await getting response bytes.");

    let mut dest_file: File = File::create(&dest_path).expect("Dest path should have existed.");
    let write_res = dest_file.write_all(&response_bytes);

    if write_res.is_ok() {
      logger::log_to_core_file(app_handle.to_owned(), format!("Download of {} finished.", grid_url.clone()).as_str(), 0);
      return String::from("success");
    } else {
      let err = write_res.err().expect("Request failed, error should have existed.");
      logger::log_to_core_file(app_handle.to_owned(), format!("Download of {} failed with {}.", grid_url.clone(), err.to_string()).as_str(), 0);
      return String::from("failed");
    }
  } else {
    let err = response_res.err().expect("Request failed, error should have existed.");
    logger::log_to_core_file(app_handle.to_owned(), format!("Download of {} failed with {}.", grid_url.clone(), err.to_string()).as_str(), 0);
    return String::from("failed");
  }
}

#[tauri::command]
/// Downloads a file from a url.
async fn copy_grid_to_selected(app_handle: AppHandle, source_path: String, dest_path: String) -> bool {
  let path_dest = PathBuf::from(dest_path);
  let _ = fs::create_dir_all(path_dest.parent().expect("Dest Path should have a parent directory."));
  let copy_res = fs::copy(source_path.clone(), path_dest);
  
  if copy_res.is_err() {
    let err = copy_res.err().expect("Request failed, error should have existed.");
    logger::log_to_core_file(app_handle.to_owned(), format!("Cache of {} failed with {}.", source_path, err.to_string()).as_str(), 0);
    return false;
  }

  return true;
}


#[tauri::command]
// Validates the steam install path
async fn validate_steam_path(app_handle: AppHandle, target_path: String) -> bool {
  let steam_path: PathBuf = PathBuf::from(&target_path);

  let steam_path_str: String = steam_path.to_str().expect("Should have been able to convert pathbuf to string").to_owned();

  add_path_to_scope(app_handle, steam_path_str).await;

  if steam_path.exists() {
    let contents_res = fs::read_dir(steam_path);
    let mut contents = contents_res.ok().expect("Should have been able to read the provided directory.");

    return contents.any(| entry_res | {
      if entry_res.is_ok() {
        let entry = entry_res.ok().expect("Entry should have been ok");

        return entry.file_name().eq_ignore_ascii_case("steam.exe") || entry.file_name().eq_ignore_ascii_case("steam.sh");
      }

      return false;
    });
  }

  return false;
}

#[tauri::command]
/// Adds the provided path to Tauri FS and Asset scope.
async fn add_path_to_scope(app_handle: AppHandle, target_path: String) -> bool {
  let path_as_buf: PathBuf = PathBuf::from(&target_path);

  if !path_as_buf.as_path().exists() {
    logger::log_to_core_file(app_handle.clone(), format!("Error adding {} to scope. Path does not exist.", &target_path).as_str(), 2);
    return false;
  }

  let fs_scope = app_handle.fs_scope();
  let asset_scope = app_handle.asset_protocol_scope();

  fs_scope.allow_directory(&path_as_buf, true);
  let asset_res = asset_scope.allow_directory(&path_as_buf, true);

  if asset_res.is_ok() {
    logger::log_to_core_file(app_handle.clone(), format!("Added {} to scope.", &target_path).as_str(), 0);
    return true;
  }

  let err = asset_res.err().unwrap();
  logger::log_to_core_file(app_handle.clone(), format!("Error adding {} to scope. Asset Scope Error: {}", &target_path, err.to_string()).as_str(), 2);
  return false;
}

#[tauri::command]
/// Adds the user's steam directory to Tauri FS and Asset scope.
async fn add_steam_to_scope(app_handle: AppHandle) -> String {
  let steam_path_res = get_steam_root_dir();

  if steam_path_res.is_ok() {
    let steam_path: PathBuf = steam_path_res.ok().expect("Should have been able to get steam path from result.");
    let steam_path_str: String = steam_path.as_path().display().to_string();
    let was_added: bool = add_path_to_scope(app_handle, steam_path_str.to_owned()).await;

    if was_added {
      if &steam_path_str == "c:/program files (x86)/steam" {
        return String::from("C:/Program Files (x86)/Steam");
      } else {
        return steam_path_str;
      }
    } else {
      return String::from("");
    }
  } else {
    let err_message = steam_path_res.err().expect("Should have been able to get Steam install path error.");
    logger::log_to_core_file(app_handle.to_owned(), &err_message, 2);

    return String::from("DNE");
  }
}

#[tauri::command]
/// Toggles the dev tools for the current window.
async fn toggle_dev_tools(app_handle: AppHandle, enable: bool) {
  let window = app_handle.get_webview_window("main").expect("Should have been able to get the main window.");
  
  if enable {
    window.open_devtools();
  } else {
    window.close_devtools();
  }
}

/// This app's main function.
fn main() {
  tauri::Builder::default()
    .invoke_handler(tauri::generate_handler![
      logger::clean_out_log,
      logger::log_to_core_file,
      logger::log_to_batch_apply_file,
      steam::get_steam_users,
      steam::get_grids_directory,
      steam::get_library_cache_directory,
      steam::get_appinfo_path,
      steam::get_shortcuts_path,
      steam::get_localconfig_path,
      steam::get_sourcemod_path,
      steam::get_goldsrc_path,
      start_menu_tiles::get_apps_with_tiles,
      start_menu_tiles::write_app_tiles,
      grids_cache_loader::get_cache_data,
      add_path_to_scope,
      toggle_dev_tools,
      add_steam_to_scope,
      zip_controller::export_grids_to_zip,
      zip_controller::import_grids_from_zip,
      steam::read_appinfo_vdf,
      steam::read_shortcuts_vdf,
      steam::read_localconfig_vdf,
      handle_changes::save_changes,
      handle_changes::write_shortcuts,
      download_grid,
      copy_grid_to_selected,
      clean_grids::clean_grids,
      validate_steam_path
    ])
    .plugin(tauri_plugin_fs::init())
    .plugin(tauri_plugin_http::init())
    .plugin(tauri_plugin_dialog::init())
    .plugin(tauri_plugin_process::init())
    .plugin(tauri_plugin_shell::init())
    .plugin(tauri_plugin_updater::Builder::new().build())
    .plugin(tauri_plugin_single_instance::init(|app, argv, cwd| {
      println!("{}, {argv:?}, {cwd}", app.package_info().name);

      app.emit("single-instance", Payload { args: argv, cwd }).unwrap();
    }))
    .setup(| app | {
      let app_handle = app.handle().clone();
      let log_file_path = Box::new(String::from(logger::get_core_log_path(&app_handle).into_os_string().to_str().expect("Should have been able to convert osString to str.")));
      
      logger::clean_out_log(app_handle.clone());

      panic::set_hook(Box::new(move | panic_info | {
        let path_str = (*log_file_path).to_owned();
        let log_file_path_buf: PathBuf = PathBuf::from(path_str);

        let location_res: Option<&Location> = panic_info.location();
        // let message_res = panic_info.message();
        // let message_res: Option<&Arguments> = None;

        let message_res = get_panic_info_message(panic_info);

        let mut log_message: String = String::from("Panic occured but no additional info was provided!");

        if location_res.is_some() && message_res.is_some() {
          let location = location_res.expect("Should have been able to get panic location");
          let message = message_res.expect("Should have been able to get panic message");
          log_message = format!("PANIC: File '{}' at line {}: {}", location.file(), location.line(), message).to_string();
        } else if location_res.is_some() {
          let location = location_res.expect("Should have been able to get panic location");
          log_message = format!("PANIC: File '{}' at line {}: No provided message", location.file(), location.line()).to_string();
        } else if message_res.is_some() {
          let message = message_res.expect("Should have been able to get panic message");
          log_message = format!("PANIC: File 'UNKOWN' at line UNKOWN: {}", message).to_string();
        }

        logger::log_to_file(&log_file_path_buf, &log_message, 2);
        logger::log_to_file(&log_file_path_buf, "Please open an issue at https://github.com/Tormak9970/Steam-Art-Manager/issues", 2);

        let dialog = app_handle.dialog()
          .message("Check your log file for more information, and please open an issue at https://github.com/Tormak9970/Steam-Art-Manager/issues")
          .title("Panic!")
          .ok_button_label("Ok");

        let hit_ok = dialog.blocking_show();

        if hit_ok {
          exit(1);
        }
      }));

      Ok(())
    })
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}