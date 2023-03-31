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

use serde;
use tauri::{AppHandle, api::dialog::blocking::FileDialogBuilder};

type GridImageCache = HashMap<String, HashMap<String, String>>;

#[derive(serde::Serialize, serde::Deserialize, Debug, PartialEq)]
#[allow(non_snake_case)]
struct ChangedPath {
  appId: String,
  gridType: String,
  targetPath: String,
  sourcePath: String
}

fn get_grid_filename(appid: &str, grid_type: &str, image_type: &str) -> String {
  match grid_type {
    "Capsule" => return format!("{}p{}", appid, image_type),
    "Wide Capsule" => return format!("{}{}", appid, image_type),
    "Hero" => return format!("{}_hero{}", appid, image_type),
    "Logo" => return format!("{}_logo{}", appid, image_type),
    "Icon" => return format!("{}_icon{}", appid, image_type),
    _ => panic!("Unexpected grid type {}", grid_type)
  }
}

fn adjust_path(appid: &str, path: &str, grid_type: &str) -> String {
  let format_start_index = path.rfind(".").expect("Path should have had a file extension.") + 1;
  let image_type = &path[format_start_index..];
  return get_grid_filename(appid, grid_type, image_type);
}

fn filter_paths(app_handle: &AppHandle, current_paths: &GridImageCache, original_paths: &GridImageCache) -> Vec<ChangedPath> {
  let grids_dir = PathBuf::from(steam::get_grids_directory(app_handle.to_owned()));
  let mut res:Vec<ChangedPath> = Vec::new();

  for (appid, grids_map) in current_paths.into_iter() {
    for (grid_type, source_path) in grids_map.into_iter() {
      let grid_path: &String = original_paths.get(appid.as_str()).unwrap().get(grid_type.as_str()).unwrap();
      let grid_path_owned = grid_path.to_owned();
      let source_path_owned = source_path.to_owned();

      if appid.as_str().to_owned() == "752590" {
        println!("Source: {} Target: {}.", source_path_owned, grid_path_owned);
      }

      if source_path_owned != grid_path_owned {
        // println!("Source: {} Target: {}.", source_path_owned, grid_path_owned);
        let adjusted_path = adjust_path(appid.as_str(), source_path_owned.as_str(), grid_type.as_str());
        let target_path = grids_dir.join(adjusted_path);
        let changed_path = ChangedPath {
          appId: appid.to_owned(),
          gridType: grid_type.to_owned(),
          targetPath: String::from(target_path.to_str().unwrap()),
          sourcePath: source_path_owned
        };

        res.push(changed_path);
      }
    }
  }

  return res;
}

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
async fn save_changes(app_handle: AppHandle, current_art: String, original_art: String) -> String {
  let current_art_dict: GridImageCache = serde_json::from_str(current_art.as_str()).unwrap();
  let original_art_dict: GridImageCache = serde_json::from_str(original_art.as_str()).unwrap();

  logger::log_to_file(app_handle.to_owned(), "Converting current path entries to grid paths...", 0);
  let paths_to_set: Vec<ChangedPath> = filter_paths(&app_handle, &current_art_dict, &original_art_dict);
  logger::log_to_file(app_handle.to_owned(), "Current path entries converted to grid paths.", 0);

  for changed_path in (&paths_to_set).into_iter() {
    let source = changed_path.sourcePath.to_owned();
    let target = changed_path.targetPath.to_owned();
    let copy_res = fs::copy(target.clone(), source.clone());
    if copy_res.is_ok() {
      logger::log_to_file(app_handle.to_owned(), format!("Copied {} to {}.", source, target).as_str(), 0);
    } else {
      logger::log_to_file(app_handle.to_owned(), format!("Failed to copy {} to {}.", source, target).as_str(), 2);
      return format!("{{ \"error\": \"Failed to copy {} to {}\"}}", source, target);
    }
  }

  let changed_res = serde_json::to_string::<Vec<ChangedPath>>(paths_to_set.as_ref());

  if changed_res.is_ok() {
    return changed_res.unwrap();
  } else {
    let err = changed_res.err().unwrap();
    panic!("{}", err.to_string());
  }
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