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

use std::{path::PathBuf, collections::HashMap, fs};

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

#[tauri::command]
async fn save_changes(app_handle: AppHandle, current_art: String, original_art: String) -> bool {
  let current_art_dict: HashMap<String, HashMap<String, String>> = serde_json::from_str(current_art.as_str()).unwrap();
  let original_art_dict: HashMap<String, HashMap<String, String>> = serde_json::from_str(original_art.as_str()).unwrap();

  for (key, value) in current_art_dict.into_iter() {
    for (sub_key, sub_value) in value.into_iter() {
      let original_value: &String = original_art_dict.get(key.as_str()).unwrap().get(sub_key.as_str()).unwrap();
      let original_val = original_value.to_owned();
      let sub_val = sub_value.to_owned();
      if original_val != sub_val {
        let copy_res = fs::copy(sub_value, original_value);
        if copy_res.is_ok() {
          logger::log_to_file(app_handle.to_owned(), format!("Copied {} to {}.", sub_val, original_val).as_str(), 0);
        } else {
          logger::log_to_file(app_handle.to_owned(), format!("Failed to copy {} to {}.", sub_val, original_val).as_str(), 2);
          return false;
        }
      }
    }
  }

  return true;
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
      read_appinfo_vdf,
      save_changes
    ])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}