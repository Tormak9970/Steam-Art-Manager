#![cfg_attr(
  all(not(debug_assertions), target_os = "windows"),
  windows_subsystem = "windows"
)]

mod reader;
mod vdf_structs;
mod logger;
mod steam;
mod zip_controller;
mod appinfo_vdf_parser;

use std::path::PathBuf;

use appinfo_vdf_parser::read_vdf;
use home::home_dir;

use tauri::{AppHandle, api::dialog::blocking::FileDialogBuilder};

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
async fn export_grids_to_zip(app_handle: AppHandle) -> bool {
  let file_dialog = FileDialogBuilder::new()
    .set_title("Save Grids Zip")
    .set_file_name("Steam_Grids_Export.zip")
    .add_filter("zip", &["zip"])
    .set_directory(home_dir().expect("Should have been able to get home dir for zip."));

  let file_path = file_dialog.save_file();

  if file_path.is_some() {
    let zip_path = file_path.unwrap();
    logger::log_to_file(app_handle.to_owned(), format!("Got save path: {}", zip_path.to_str().expect("Should have been able to convert path to string.")).as_str(), 0);

    let grids_dir_path = steam::get_grids_directory(app_handle.to_owned());
    let succeeded = zip_controller::generate_grids_zip(&app_handle, PathBuf::from(grids_dir_path), zip_path);

    if succeeded {
      logger::log_to_file(app_handle.to_owned(), "Successfully saved the user's grids.", 0);
      return true;
    } else {
      logger::log_to_file(app_handle.to_owned(), "Failed to save the user's grids.", 0);
      return false;
    }
  } else {
    logger::log_to_file(app_handle.to_owned(), "No save location was chosen.", 0);
    return false;
  }
}

#[tauri::command]
async fn import_grids_from_zip(app_handle: AppHandle) -> bool {
  let file_dialog = FileDialogBuilder::new()
    .set_title("Pick a Grids Zip")
    .add_filter("zip", &["zip"])
    .set_directory(home_dir().expect("Should have been able to get home dir for zip."));

  let file_path = file_dialog.pick_file();

  if file_path.is_some() {
    let zip_path = file_path.unwrap();
    logger::log_to_file(app_handle.to_owned(), format!("Got file path: {}", zip_path.to_str().expect("Should have been able to convert path to string.")).as_str(), 0);

    let grids_dir_path = steam::get_grids_directory(app_handle.to_owned());
    let succeeded = zip_controller::set_grids_from_zip(&app_handle, PathBuf::from(grids_dir_path), zip_path);

    if succeeded {
      logger::log_to_file(app_handle.to_owned(), "Successfully set the user's grids.", 0);
      return true;
    } else {
      logger::log_to_file(app_handle.to_owned(), "Failed to set the user's grids.", 0);
      return false;
    }
  } else {
    logger::log_to_file(app_handle.to_owned(), "No zip file was selected by user.", 0);
    return false;
  }
}

#[tauri::command]
async fn read_appinfo_vdf(app_handle: AppHandle) -> String {
  let appinfo_path = PathBuf::from(steam::get_appinfo_path(app_handle));
  let appinfo_vdf = read_vdf(&appinfo_path);
  return serde_json::to_string(&appinfo_vdf).expect("Should have been able to serialize AppInfo vdf to string.");
}

fn main() {
  tauri::Builder::default()
    .plugin(tauri_plugin_persisted_scope::init())
    .invoke_handler(tauri::generate_handler![
      logger::clean_out_log,
      logger::log_to_file,
      steam::get_active_user,
      steam::get_steam_apps,
      steam::get_grids_directory,
      steam::get_library_cache_directory,
      steam::get_appinfo_path,
      export_grids_to_zip,
      import_grids_from_zip,
      read_appinfo_vdf
    ])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}