// #![windows_subsystem = "windows"]

mod reader;
mod writer;
mod vdf_structs;
mod logger;
mod steam;
mod zip_controller;
mod appinfo_vdf_parser;
mod shortcuts_vdf_parser;

use std::{path::PathBuf, collections::HashMap, fs};

use appinfo_vdf_parser::open_appinfo_vdf;
use serde_json::{Map, Value};
use shortcuts_vdf_parser::{open_shortcuts_vdf, write_shortcuts_vdf};

use home::home_dir;

use serde;
use steam::get_steam_root_dir;
use tauri::{
  AppHandle,
  api::dialog::blocking::FileDialogBuilder,
  FsScope, Manager
};

type GridImageCache = HashMap<String, HashMap<String, String>>;

#[derive(serde::Serialize, serde::Deserialize, Debug, PartialEq, Clone)]
#[allow(non_snake_case)]
struct ChangedPath {
  appId: String,
  gridType: String,
  oldPath: String,
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
  let format_start_index = path.rfind(".").expect("Path should have had a file extension.");
  let image_type = &path[format_start_index..];
  return get_grid_filename(appid, grid_type, image_type);
}

fn filter_paths(app_handle: &AppHandle, steam_active_user_id: String, current_paths: &GridImageCache, original_paths: &GridImageCache) -> Vec<ChangedPath> {
  let grids_dir = PathBuf::from(steam::get_grids_directory(app_handle.to_owned(), steam_active_user_id));
  let mut res:Vec<ChangedPath> = Vec::new();

  for (appid, grids_map) in current_paths.into_iter() {
    for (grid_type, source_path) in grids_map.into_iter() {
      let grid_path: &String = original_paths.get(appid.as_str()).unwrap().get(grid_type.as_str()).unwrap();
      let grid_path_owned = grid_path.to_owned();
      let source_path_owned = source_path.to_owned();

      if source_path_owned != grid_path_owned {
        let adjusted_path = adjust_path(appid.as_str(), source_path_owned.as_str(), grid_type.as_str()).replace("\\", "/");
        let target_path = String::from(grids_dir.join(adjusted_path).to_str().unwrap()).replace("\\", "/");
        let changed_path = ChangedPath {
          appId: appid.to_owned(),
          gridType: grid_type.to_owned(),
          oldPath: grid_path_owned.replace("\\", "/"),
          targetPath: target_path.to_owned(),
          sourcePath: source_path_owned.replace("\\", "/")
        };

        res.push(changed_path);
      }
    }
  }

  return res;
}

fn check_for_shortcut_changes(changed_paths: Vec<ChangedPath>, shortcut_ids: Vec<String>) -> bool {
  for changed_path in changed_paths.into_iter() {
    let appid = changed_path.appId;
    if shortcut_ids.contains(&appid) {
      return true;
    }
  }

  return false;
}

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
async fn export_grids_to_zip(app_handle: AppHandle, steam_active_user_id: String, platform_id_map: Map<String, Value>, id_name_map: Map<String, Value>) -> bool {
  let file_dialog = FileDialogBuilder::new()
    .set_title("Save Grids Zip")
    .set_file_name("Steam_Grids_Export.zip")
    .add_filter("zip", &["zip"])
    .set_directory(home_dir().expect("Should have been able to get home dir for zip."));

  let file_path = file_dialog.save_file();

  if file_path.is_some() {
    let zip_path = file_path.unwrap();
    logger::log_to_file(app_handle.to_owned(), format!("Got save path: {}", zip_path.to_str().expect("Should have been able to convert path to string.")).as_str(), 0);

    let grids_dir_path = steam::get_grids_directory(app_handle.to_owned(), steam_active_user_id);
    let succeeded = zip_controller::generate_grids_zip(&app_handle, PathBuf::from(grids_dir_path), zip_path, &platform_id_map, &id_name_map);

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
async fn import_grids_from_zip(app_handle: AppHandle, steam_active_user_id: String, name_id_map: Map<String, Value>) -> (bool, Map<String, Value>) {
  let file_dialog = FileDialogBuilder::new()
    .set_title("Pick a Grids Zip")
    .add_filter("zip", &["zip"])
    .set_directory(home_dir().expect("Should have been able to get home dir for zip."));

  let file_path = file_dialog.pick_file();

  if file_path.is_some() {
    let zip_path = file_path.unwrap();
    logger::log_to_file(app_handle.to_owned(), format!("Got file path: {}", zip_path.to_str().expect("Should have been able to convert path to string.")).as_str(), 0);

    let grids_dir_path = steam::get_grids_directory(app_handle.to_owned(), steam_active_user_id);
    let (success, icon_map) = zip_controller::set_grids_from_zip(&app_handle, PathBuf::from(grids_dir_path), zip_path, &name_id_map);

    if success {
      logger::log_to_file(app_handle.to_owned(), "Successfully set the user's grids.", 0);
      return (success, icon_map);
    } else {
      logger::log_to_file(app_handle.to_owned(), "Failed to set the user's grids.", 0);
      return (success, icon_map);
    }
  } else {
    logger::log_to_file(app_handle.to_owned(), "No zip file was selected by user.", 0);
    return (false, Map::new());
  }
}

#[tauri::command]
async fn read_appinfo_vdf(app_handle: AppHandle) -> String {
  let appinfo_path = PathBuf::from(steam::get_appinfo_path(app_handle));
  let appinfo_vdf = open_appinfo_vdf(&appinfo_path);
  return serde_json::to_string(&appinfo_vdf).expect("Should have been able to serialize AppInfo vdf to string.");
}

#[tauri::command]
async fn read_shortcuts_vdf(app_handle: AppHandle, steam_active_user_id: String) -> String {
  let shortcuts_path = PathBuf::from(steam::get_shortcuts_path(app_handle.to_owned(), steam_active_user_id));
    
  if shortcuts_path.as_path().exists() {
    logger::log_to_file(app_handle.to_owned(), "shortcuts.vdf exists, reading...", 0);
    let shortcuts_array = open_shortcuts_vdf(&shortcuts_path);
    return serde_json::to_string(&shortcuts_array).expect("Should have been able to serialize Shortcuts vdf to string.");
  } else {
    logger::log_to_file(app_handle.to_owned(), "shortcuts.vdf does not exist.", 0);
    return "{}".to_owned();
  }
}

#[tauri::command]
async fn save_changes(app_handle: AppHandle, steam_active_user_id: String, current_art: String, original_art: String, shortcuts_str: String, shortcut_ids_str: String) -> String {
  let shortcut_ids: Vec<String> = shortcut_ids_str.split(", ").map(| appid | {
    return appid.to_owned();
  }).collect();
  let current_art_dict: GridImageCache = serde_json::from_str(current_art.as_str()).unwrap();
  let original_art_dict: GridImageCache = serde_json::from_str(original_art.as_str()).unwrap();

  logger::log_to_file(app_handle.to_owned(), "Converting current path entries to grid paths...", 0);
  let paths_to_set: Vec<ChangedPath> = filter_paths(&app_handle, steam_active_user_id, &current_art_dict, &original_art_dict);
  logger::log_to_file(app_handle.to_owned(), "Current path entries converted to grid paths.", 0);

  for changed_path in (&paths_to_set).into_iter() {
    let source = changed_path.sourcePath.to_owned();
    let target = changed_path.targetPath.to_owned();

    if changed_path.oldPath.contains("grid") {
      let remove_res = fs::remove_file(changed_path.oldPath.to_owned());
      if remove_res.is_err() {
        let err = remove_res.err().unwrap();
        return format!("{{ \"error\": \"{}\"}}", err.to_string());
      }
    }

    fs::File::create(target.clone()).unwrap();
    
    let copy_res = fs::copy(source.clone(), target.clone());

    if copy_res.is_ok() {
      logger::log_to_file(app_handle.to_owned(), format!("Copied {} to {}.", source, target).as_str(), 0);
    } else {
      logger::log_to_file(app_handle.to_owned(), format!("Failed to copy {} to {}.", source, target).as_str(), 2);
      let err = copy_res.err().unwrap();
      return format!("{{ \"error\": \"{}\"}}", err.to_string());
    }
  }

  let should_change_shortcuts = check_for_shortcut_changes(paths_to_set.clone(), shortcut_ids);
  println!("Should change shortcuts: {}", should_change_shortcuts);
  
  if should_change_shortcuts {
    logger::log_to_file(app_handle.to_owned(), "Changes to shortcuts detected. Writing shortcuts.vdf...", 0);
    let shortcuts_vdf_path = PathBuf::from("C:/Users/Tormak/Desktop/shortcuts_write_test.vdf");
    let shortcuts_data = serde_json::from_str(shortcuts_str.as_str()).expect("Should have been able to parse json string.");
    write_shortcuts_vdf(&shortcuts_vdf_path, shortcuts_data);
    logger::log_to_file(app_handle.to_owned(), "Changes to shortcuts saved.", 0);
  } else {
    logger::log_to_file(app_handle.to_owned(), "No changes to shortcuts detected. Skipping...", 0);
  }

  let changed_res = serde_json::to_string::<Vec<ChangedPath>>(paths_to_set.as_ref());

  if changed_res.is_ok() {
    return changed_res.unwrap();
  } else {
    let err = changed_res.err().unwrap();
    panic!("{}", err.to_string());
  }
}

fn add_steam_to_scope(app_handle: &AppHandle) {
  let steam_path = get_steam_root_dir();
  let steam_parent_dir = steam_path.parent().unwrap();

  let fs_scope = app_handle.fs_scope();
  let asset_scope = app_handle.asset_protocol_scope();

  let fs_res = FsScope::allow_directory(&fs_scope, steam_parent_dir, true);
  let asset_res = FsScope::allow_directory(&asset_scope, steam_parent_dir, true);

  if fs_res.is_ok() && asset_res.is_ok() {
    logger::log_to_file(app_handle.to_owned(), "Added Steam directory to scope.", 0);
  } else if fs_res.is_err() {
    let err = fs_res.err().unwrap();
    logger::log_to_file(app_handle.to_owned(), format!("Error adding Steam directory to scope. FS Scope Error: {}", err.to_string()).as_str(), 0);
  } else if asset_res.is_err() {
    let err = asset_res.err().unwrap();
    logger::log_to_file(app_handle.to_owned(), format!("Error adding Steam directory to scope. Asset Scope Error: {}", err.to_string()).as_str(), 0);
  } else {
    let fs_err = fs_res.err().unwrap();
    let asset_err = asset_res.err().unwrap();
    logger::log_to_file(app_handle.to_owned(), format!("Error adding Steam directory to scope. FS Scope Error: {}. Asset Scope Error: {}", fs_err.to_string(), asset_err.to_string()).as_str(), 0);
  }
}

fn main() {
  tauri::Builder::default()
    .plugin(tauri_plugin_persisted_scope::init())
    .invoke_handler(tauri::generate_handler![
      logger::clean_out_log,
      logger::log_to_file,
      steam::get_steam_users,
      steam::get_grids_directory,
      steam::get_library_cache_directory,
      steam::get_appinfo_path,
      steam::get_shortcuts_path,
      export_grids_to_zip,
      import_grids_from_zip,
      read_appinfo_vdf,
      read_shortcuts_vdf,
      save_changes
    ])
    .setup(| app | {
      let app_handle = app.handle();
      logger::clean_out_log(app_handle.clone());
      add_steam_to_scope(&app_handle);
      Ok(())
    })
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}