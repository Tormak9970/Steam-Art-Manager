use std::{path::PathBuf, collections::HashMap, fs};

use crate::parsers::shortcuts_vdf_parser::write_shortcuts_vdf;
use serde_json::{Map, Value};

use serde;
use crate::steam;
use tauri::{self, AppHandle};

use crate::logger;

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

/// Checks if an appid belongs to a shortcut
fn is_appid_shortcut(appid: &str, shortcut_icons: &Map<String, Value>) -> bool {
  return shortcut_icons.contains_key(appid);
}

/// Gets a grid's file name based on its type.
fn get_grid_filename(app_handle: &AppHandle, appid: &str, grid_type: &str, image_type: &str) -> String {
  match grid_type {
    "Capsule" => return format!("{}p{}", appid, image_type),
    "Wide Capsule" => return format!("{}{}", appid, image_type),
    "Hero" => return format!("{}_hero{}", appid, image_type),
    "Logo" => return format!("{}_logo{}", appid, image_type),
    "Icon" => return format!("{}_icon.jpg", appid),
    _ => {
      logger::log_to_core_file(app_handle.to_owned(), format!("Unexpected grid type {}", grid_type).as_str(), 2);
      panic!("Unexpected grid type {}", grid_type);
    }
  }
}

/// Adjusts the path of a grid based on its type.
fn adjust_path(app_handle: &AppHandle, appid: &str, path: &str, grid_type: &str) -> String {
  let format_start_index = path.rfind(".").expect("Path should have had a file extension.");
  let image_type = &path[format_start_index..];
  return get_grid_filename(app_handle, appid, grid_type, image_type);
}

/// Filters the grid paths based on which have change.
fn filter_paths(app_handle: &AppHandle, steam_path: String, steam_active_user_id: String, current_paths: &GridImageCache, original_paths: &GridImageCache, shortcut_icons: &Map<String, Value>) -> Vec<ChangedPath> {
  let grids_dir = PathBuf::from(steam::get_grids_directory(app_handle.to_owned(), steam_path.to_owned(), steam_active_user_id));
  let lib_cache_dir = PathBuf::from(steam::get_library_cache_directory(app_handle.to_owned(), steam_path.to_owned()));
  let mut res:Vec<ChangedPath> = Vec::new();

  for (appid, grids_map) in current_paths.into_iter() {
    for (grid_type, source_path) in grids_map.into_iter() {
      let mut grid_path: &String = &String::from("");

      if original_paths.get(appid.as_str()).is_some() && original_paths.get(appid.as_str()).unwrap().get(grid_type.as_str()).is_some() {
        grid_path = original_paths.get(appid.as_str()).unwrap().get(grid_type.as_str()).unwrap();
      }

      let grid_path_owned = grid_path.to_owned();
      let source_path_owned = source_path.to_owned();

      if source_path_owned != grid_path_owned {
        let target_path;

        if source_path != "REMOVE" {
          let adjusted_path = adjust_path(app_handle, appid.as_str(), source_path_owned.as_str(), grid_type.as_str()).replace("\\", "/");
          if grid_type == "Icon" && !is_appid_shortcut(&appid, shortcut_icons) {
            target_path = String::from(lib_cache_dir.join(adjusted_path).to_str().unwrap()).replace("\\", "/");
          } else {
            target_path = String::from(grids_dir.join(adjusted_path).to_str().unwrap()).replace("\\", "/");
          }
        } else {
          target_path = String::from("REMOVE");
        }

        let mut changed_path = ChangedPath {
          appId: appid.to_owned(),
          gridType: grid_type.to_owned(),
          oldPath: grid_path_owned.replace("\\", "/"),
          targetPath: target_path.to_owned(),
          sourcePath: source_path_owned.replace("\\", "/")
        };

        if changed_path.targetPath.ends_with(".webp") {
          let target: String = changed_path.targetPath;
          let mut jpg_target: String = target[..target.len() - 5].to_owned();
          jpg_target.push_str(".jpg");

          changed_path.targetPath = String::from(jpg_target.to_owned());
        }

        res.push(changed_path);
      }
    }
  }

  return res;
}

/// Checks for shortcut grid changes.
fn check_for_shortcut_changes(shortcut_icons: &Map<String, Value>, original_shortcut_icons: &Map<String, Value>) -> bool {
  for (shortcut_id, icon) in shortcut_icons.to_owned().into_iter() {
    let icon: &str = icon.as_str().expect("Should have been able to convert icon to &str.");
    let original_icon: &str = original_shortcut_icons.get(&shortcut_id).expect("Original hortcut should have had an icon.").as_str().expect("Should have been able to convert original icon to &str.");

    if icon != original_icon {
      return true;
    }
  }

  return false;
}



#[tauri::command]
/// Applies the changes the user has made.
pub async fn save_changes(app_handle: AppHandle, steam_path: String, steam_active_user_id: String, current_art: String, original_art: String, shortcuts_str: String, shortcut_icons: Map<String, Value>, original_shortcut_icons: Map<String, Value>, changed_logo_positions: Map<String, Value>) -> String {
  let current_art_dict: GridImageCache = serde_json::from_str(current_art.as_str()).unwrap();
  let original_art_dict: GridImageCache = serde_json::from_str(original_art.as_str()).unwrap();

  logger::log_to_core_file(app_handle.to_owned(), "Converting current path entries to grid paths...", 0);
  let paths_to_set: Vec<ChangedPath> = filter_paths(&app_handle, steam_path.to_owned(), steam_active_user_id.clone(), &current_art_dict, &original_art_dict, &shortcut_icons);
  let paths_id_map: HashMap<String, ChangedPath> = paths_to_set.clone().iter().map(| entry | (format!("{}_{}", entry.appId.to_owned(), entry.gridType.to_owned()).to_string(), entry.to_owned())).collect();
  logger::log_to_core_file(app_handle.to_owned(), "Current path entries converted to grid paths.", 0);

  for changed_path in (&paths_to_set).into_iter() {
    let source = changed_path.sourcePath.to_owned();
    let target = changed_path.targetPath.to_owned();

    if target == String::from("REMOVE") {
      if changed_path.oldPath.contains("grid") {
        let remove_res = fs::remove_file(changed_path.oldPath.to_owned());
        if remove_res.is_err() {
          let err = remove_res.err().unwrap();
          return format!("{{ \"error\": \"{}\"}}", err.to_string());
        }

        logger::log_to_core_file(app_handle.to_owned(), format!("Removed grid {}.", changed_path.oldPath.to_owned()).as_str(), 0);
      }
    } else {
      if changed_path.oldPath.contains("grid") {
        let remove_res = fs::remove_file(changed_path.oldPath.to_owned());
        if remove_res.is_err() {
          let err = remove_res.err().unwrap();
          return format!("{{ \"error\": \"{}\"}}", err.to_string());
        }
      }
  
      fs::File::create(target.clone()).unwrap();
      
      let copy_res = fs::copy(source.clone(), target.clone());
  
      if copy_res.is_err() {
        logger::log_to_core_file(app_handle.to_owned(), format!("Failed to copy {} to {}.", source, target).as_str(), 2);
        let err = copy_res.err().unwrap();
        return format!("{{ \"error\": \"{}\"}}", err.to_string());
      }

      logger::log_to_core_file(app_handle.to_owned(), format!("Copied {} to {}.", source, target).as_str(), 0);
    }
  }

  let grids_directory: PathBuf = PathBuf::from(steam::get_grids_directory(app_handle.to_owned(), steam_path.to_owned(), steam_active_user_id.clone()));
  for (appid, steam_logo_str_val) in changed_logo_positions.into_iter() {
    let steam_logo_str: &str = steam_logo_str_val.as_str().expect("Should have been able to convert steamLogo pos into str.");
    let logo_config_path: PathBuf = grids_directory.join(format!("{}.json", appid));

    if steam_logo_str == "REMOVE" {
      let remove_res = fs::remove_file(logo_config_path);
      if remove_res.is_err() {
        let err = remove_res.err().unwrap();
        return format!("{{ \"error\": \"{}\"}}", err.to_string());
      }

      logger::log_to_core_file(app_handle.to_owned(), format!("Removed logo position config for {}.", appid).as_str(), 0);
    } else {
      let write_res = fs::write(&logo_config_path, steam_logo_str);
  
      if write_res.is_err() {
        logger::log_to_core_file(app_handle.to_owned(), format!("Failed to write logo pos to config for {}.", appid).as_str(), 2);
        let err = write_res.err().unwrap();
        return format!("{{ \"error\": \"{}\"}}", err.to_string());
      }
      
      logger::log_to_core_file(app_handle.to_owned(), format!("Wrote logo pos to config for {}.", appid).as_str(), 0);
    }
  }

  let should_change_shortcuts: bool = check_for_shortcut_changes(&shortcut_icons, &original_shortcut_icons);
  
  if should_change_shortcuts {
    logger::log_to_core_file(app_handle.to_owned(), "Changes to shortcuts detected. Writing shortcuts.vdf...", 0);
    let mut shortcuts_data: Value = serde_json::from_str(shortcuts_str.as_str()).expect("Should have been able to parse json string.");

    let shortcuts_obj_map: &mut Value = shortcuts_data.get_mut("shortcuts").expect("key: shortcuts should have existed.");
    let shortcuts_map: &mut Map<String, Value> = shortcuts_obj_map.as_object_mut().expect("Should have been able to convert shortcuts to map");

    for (_, shortcut) in shortcuts_map.into_iter() {
      let shortcut_map: &mut Map<String, Value> = shortcut.as_object_mut().expect("should have been able to convert shortcut to map.");
      let shortcut_appid_val: &Value = shortcut_map.get("appid").expect("shortcut should have had an appid");
      let shortcut_appid_num: i64 = shortcut_appid_val.as_i64().expect("should have been able to convert shortcut appid to str.");
      let shortcut_appid: String = shortcut_appid_num.to_string();

      let path_key: String = format!("{}_icon", shortcut_appid.to_owned()).to_string();

      if paths_id_map.contains_key(&path_key) {
        let changed_path: &ChangedPath = paths_id_map.get(&path_key).expect("entry should have existed.");
        shortcut_map.insert(String::from("icon"), Value::String(changed_path.targetPath.to_owned()));
      }
    }

    let mut modified_shortcuts_data: Map<String, Value> = Map::new();
    modified_shortcuts_data.insert(String::from("shortcuts"), shortcuts_obj_map.to_owned());
    shortcuts_data = Value::Object(modified_shortcuts_data);

    let shortcuts_vdf_path: PathBuf = PathBuf::from(steam::get_shortcuts_path(app_handle.to_owned(), steam_path.to_owned(), steam_active_user_id));
    write_shortcuts_vdf(&shortcuts_vdf_path, shortcuts_data);
    logger::log_to_core_file(app_handle.to_owned(), "Changes to shortcuts saved.", 0);
  } else {
    logger::log_to_core_file(app_handle.to_owned(), "No changes to shortcuts detected. Skipping...", 0);
  }

  let changed_res = serde_json::to_string::<Vec<ChangedPath>>(paths_to_set.as_ref());

  if changed_res.is_err() {
    let err = changed_res.err().unwrap();
    logger::log_to_core_file(app_handle, format!("{}", err.to_string()).as_str(), 2);
    return String::from("[]");
  }
  
  return changed_res.unwrap();
}

#[tauri::command]
/// Writes the user's shortcuts.vdf file.
pub async fn write_shortcuts(app_handle: AppHandle, steam_path: String, steam_active_user_id: String, shortcuts_str: String) -> bool {
  logger::log_to_core_file(app_handle.to_owned(), "Writing shortcuts.vdf...", 0);
  let shortcuts_vdf_path: PathBuf = PathBuf::from(steam::get_shortcuts_path(app_handle.to_owned(), steam_path, steam_active_user_id));
  let shortcuts_data: Value = serde_json::from_str(shortcuts_str.as_str()).expect("Should have been able to parse json string.");

  let success: bool = write_shortcuts_vdf(&shortcuts_vdf_path, shortcuts_data);

  if success {
    logger::log_to_core_file(app_handle.to_owned(), "Changes to shortcuts saved.", 0);
    return true;
  } else {
    logger::log_to_core_file(app_handle.to_owned(), "Changes to shortcuts failed.", 0);
    return false;
  }
}
