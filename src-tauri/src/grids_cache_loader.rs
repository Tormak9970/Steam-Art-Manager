use crate::steam;
use crate::logger;
use crate::types::GridInfo;
use crate::types::GRID_CACHE_TYPES;
use crate::types::LIBRARY_CACHE_TYPES;

use std::collections::HashMap;
use std::fs;
use std::fs::DirEntry;
use std::path::PathBuf;

use serde_json::{Value, Map};
use tauri::AppHandle;

/// Gets the id and grid_type from a grid's filename.
fn get_info_from_gridname(grid_name: String) -> (String, String) {
  let dot_index = grid_name.find(".").unwrap();
  let underscore_index = grid_name.find("_");
  let name = (&grid_name[0..dot_index]).to_owned();

  if underscore_index.is_some() {
    let index = underscore_index.unwrap();
    let id = (&name[0..index]).to_owned();
    let grid_type = (&name[(index + 1)..]).to_owned();

    return (id, grid_type);
  } else if name.ends_with("p") {
    let id = (&name[0..name.len() - 1]).to_owned();
    return (id, "capsule".to_owned());
  } else {
    return (name, "wide_capsule".to_owned());
  }
}

/// Adds a grid_cache file to the cache.
fn add_grid_file_to_cache(entry: DirEntry, filename: &str, shortcut_ids: &Vec<String>, cache_data: &mut Map<String, Value>) {
  if filename.ends_with(".json")  {
    return;
  }

  let (app_id, grid_type) = get_info_from_gridname(filename.to_owned());

  let grid_type_key = GRID_CACHE_TYPES.get(&grid_type);
  if grid_type_key.is_some() && (!grid_type.eq_ignore_ascii_case("icon") || shortcut_ids.contains(&app_id)) {
    let type_key = grid_type_key.unwrap().to_owned();
    let mut cache_entry = Map::new();
    
    let file_path = entry.path();
    let path_str = file_path.to_str().unwrap().to_owned();

    if cache_data.contains_key(&app_id) {
      let entry = cache_data.get_mut(&app_id).unwrap();
      cache_entry = entry.as_object().unwrap().to_owned();
    }

    cache_entry.insert(type_key.to_owned(), Value::String(path_str));

    cache_data.insert(app_id, Value::Object(cache_entry));
  }
}

/// Filters the user's grids dir.
async fn filter_grids_dir(app_handle: &AppHandle, steam_path: String, steam_active_user_id: String, shortcut_ids: &Vec<String>) -> Map<String, Value> {
  let mut cache_data: Map<String, Value> = Map::new();

  let grids_dir = steam::get_grids_directory(app_handle.clone(), steam_path, steam_active_user_id);

  let contents_res = fs::read_dir(grids_dir);
  if contents_res.is_err() {
    let err = contents_res.err().unwrap();
    let message = format!("Error reading grids directory. error: {}", err.to_string());

    logger::log_to_core_file(app_handle.to_owned(), &message, 2);

    return cache_data;
  }

  let contents = contents_res.unwrap();

  for entry_res in contents {
    let entry = entry_res.unwrap();

    let file_type = entry.file_type().expect("Couldn't get grid cache dir entry's file type.");
    let filename = entry.file_name().to_str().unwrap().to_string();

    if file_type.is_dir() {
      continue;
    }

    add_grid_file_to_cache(
      entry,
      &filename,
      shortcut_ids,
      &mut cache_data
    );
  }

  return cache_data;
}


/// Adds a librarycache file to the cache.
fn add_library_file_to_cache(file_path: PathBuf, app_id: &str, grid_type: &str, grid_cache_data: &mut Map<String, Value>, unfiltered_cache: &mut Map<String, Value>) {
  let grid_type_key = LIBRARY_CACHE_TYPES.get(&grid_type);
  if grid_type_key.is_some() {
    let type_key = grid_type_key.unwrap().to_owned();
    let mut library_cache_entry = Map::new();
    let mut grid_cache_entry = Map::new();
    
    let path_str = file_path.to_str().expect("Couldn't convert logo_config path to str").to_owned();

    if unfiltered_cache.contains_key(app_id) {
      let entry = unfiltered_cache.get_mut(app_id).unwrap();
      library_cache_entry = entry.as_object().unwrap().to_owned();
    }
    if grid_cache_data.contains_key(app_id) {
      let entry = grid_cache_data.get_mut(app_id).unwrap();
      grid_cache_entry = entry.as_object().unwrap().to_owned();
    }

    library_cache_entry.insert(type_key.to_owned(), Value::String(path_str.clone()));
    if !grid_cache_entry.contains_key(type_key) {
      grid_cache_entry.insert(type_key.to_owned(), Value::String(path_str));
    }

    unfiltered_cache.insert(app_id.to_string(), Value::Object(library_cache_entry));
    grid_cache_data.insert(app_id.to_string(), Value::Object(grid_cache_entry));
  }
}

/// Adds a librarycache folder to the cache.
fn add_library_folder_to_cache(parent_path: PathBuf, entry: DirEntry, dirname: &str, grid_info: &GridInfo, grid_cache_data: &mut Map<String, Value>, unfiltered_cache: &mut Map<String, Value>) {
  let app_id = dirname;

  let dir_path = parent_path.join(entry.path());

  if grid_info.capsule != "".to_string() {
    add_library_file_to_cache(
      dir_path.join(&grid_info.capsule),
      &app_id,
      "library_600x900",
      grid_cache_data,
      unfiltered_cache
    );
  }
  
  if grid_info.wideCapsule != "".to_string() {
    add_library_file_to_cache(
      dir_path.join(&grid_info.wideCapsule),
      &app_id,
      "library_header",
      grid_cache_data,
      unfiltered_cache
    );
  }
  
  if grid_info.hero != "".to_string() {
    add_library_file_to_cache(
      dir_path.join(&grid_info.hero),
      &app_id,
      "library_hero",
      grid_cache_data,
      unfiltered_cache
    );
  }
  
  if grid_info.logo != "".to_string() {
    add_library_file_to_cache(
      dir_path.join(&grid_info.logo),
      &app_id,
      "logo",
      grid_cache_data,
      unfiltered_cache
    );
  }
  
  if grid_info.icon != "".to_string() {
    add_library_file_to_cache(
      dir_path.join(&grid_info.icon),
      &app_id,
      "icon",
      grid_cache_data,
      unfiltered_cache
    );
  }
}

/// Filters the user's library cache dir.
async fn filter_library_dir(app_handle: &AppHandle, steam_path: String, steam_apps: &HashMap<String, Option<GridInfo>>, grid_cache_data: &mut Map<String, Value>) -> Map<String, Value> {
  let mut unfiltered_cache: Map<String, Value> = Map::new();

  let library_dir = steam::get_library_cache_directory(app_handle.clone(), steam_path);

  let contents_res = fs::read_dir(&library_dir);
  if contents_res.is_err() {
    let err = contents_res.err().unwrap();
    let message = format!("Error reading library directory. error: {}", err.to_string());

    logger::log_to_core_file(app_handle.to_owned(), &message, 2);

    return unfiltered_cache;
  }

  let contents = contents_res.unwrap();

  for entry_res in contents {
    let entry = entry_res.unwrap();

    let file_type = entry.file_type().expect("Couldn't get library cache dir entry's file type.");
    let filename = entry.file_name().to_str().unwrap().to_string();

    if file_type.is_dir() && steam_apps.contains_key(&filename) {
      let grid_info = steam_apps.get(&filename).unwrap();

      if grid_info.is_some() {
        let info = grid_info.as_ref().unwrap();

        add_library_folder_to_cache(
          PathBuf::from(&library_dir),
          entry,
          &filename,
          info,
          grid_cache_data,
          &mut unfiltered_cache
        );
      }
    }
  }

  return unfiltered_cache;
}

#[tauri::command]
/// Gets the cache data for the user's grids.
pub async fn get_cache_data(app_handle: AppHandle, steam_path: String, steam_active_user_id: String, shortcut_ids: Vec<String>, steam_apps: HashMap<String, Option<GridInfo>>) -> (Map<String, Value>, Map<String, Value>) {
  logger::log_to_core_file(app_handle.to_owned(), "Loading Grids Cache...", 0);

  let mut grid_cache_data = filter_grids_dir(&app_handle, steam_path.clone(), steam_active_user_id, &shortcut_ids).await;

  let unfiltered_cache = filter_library_dir(&app_handle, steam_path, &steam_apps, &mut grid_cache_data).await;

  grid_cache_data.retain(| app_id, entry | {
    let num_keys = entry.as_object().unwrap().keys().len();
    return num_keys >= 2 || shortcut_ids.contains(app_id);
  });
  
  logger::log_to_core_file(app_handle.to_owned(), format!("Loaded grids for {} apps.", grid_cache_data.len()).as_str(), 0);

  return (unfiltered_cache, grid_cache_data);
}