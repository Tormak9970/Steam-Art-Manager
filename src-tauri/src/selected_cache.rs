use std::{collections::HashMap, fs::read_dir, path::PathBuf};

use tauri::AppHandle;

use crate::utils::logger;

fn load_type_grids(app_handle: AppHandle, type_dir: PathBuf) -> Vec<String> {
  let type_dir_name = type_dir.to_str().unwrap().to_string();
  let mut grids: Vec<String> = Vec::new();

  let entries_res = read_dir(&type_dir);
  if entries_res.is_err() {
    let err = entries_res.err().unwrap();
    logger::log_to_core_file(app_handle.clone(), format!("Loading selected cache for app {} failed with {}.", type_dir_name, err.to_string()).as_str(), 2);
    return grids;
  }

  for dir_entry_res in entries_res.unwrap() {
    if dir_entry_res.is_err() {
      continue;
    }
    let dir_entry = dir_entry_res.unwrap();

    let file_metadata_res = dir_entry.metadata();
    if file_metadata_res.is_err() {
      let err = file_metadata_res.err().unwrap();
      logger::log_to_core_file(app_handle.clone(), format!("Failed to read metadata of directory \"{}\": {}", type_dir_name, err.to_string()).as_str(), 2);
      continue;
    }
    let file_metadata = file_metadata_res.unwrap();

    if file_metadata.is_file() {
      grids.push(dir_entry.path().to_str().unwrap().to_string());
    }
  }

  return grids;
}

fn load_app_grids(app_handle: AppHandle, app_dir: PathBuf) -> HashMap<String, Vec<String>> {
  let app_dir_name = app_dir.to_str().unwrap().to_owned();
  let mut map: HashMap<String, Vec<String>> = HashMap::new();

  let entries_res = read_dir(&app_dir);
  if entries_res.is_err() {
    let err = entries_res.err().unwrap();
    logger::log_to_core_file(app_handle.clone(), format!("Loading selected cache for app {} failed with {}.", app_dir_name, err.to_string()).as_str(), 2);
    return map;
  }

  for dir_entry_res in entries_res.unwrap() {
    if dir_entry_res.is_err() {
      continue;
    }
    let dir_entry = dir_entry_res.unwrap();
    let dir_name_os = dir_entry.file_name();
    let dir_name = dir_name_os.to_str().unwrap().to_owned();

    let dir_metadata_res = dir_entry.metadata();
    if dir_metadata_res.is_err() {
      let err = dir_metadata_res.err().unwrap();
      logger::log_to_core_file(app_handle.clone(), format!("Failed to read metadata of directory \"{}\": {}", app_dir_name, err.to_string()).as_str(), 2);
      continue;
    }
    let dir_metadata = dir_metadata_res.unwrap();

    if dir_metadata.is_dir() {
      let type_grids = load_type_grids(app_handle.clone(), dir_entry.path());
      map.insert(dir_name, type_grids);
    }
  }

  return map;
}

#[tauri::command]
// Loads the selected cache from the file system
pub async fn load_selected_cache(app_handle: AppHandle, cache_dir: String) -> HashMap<String, HashMap<String, Vec<String>>> {
  let mut map: HashMap<String, HashMap<String, Vec<String>>> = HashMap::new();

  let entries_res = read_dir(&cache_dir);
  if entries_res.is_err() {
    let err = entries_res.err().unwrap();
    logger::log_to_core_file(app_handle.clone(), format!("Loading selected cache {} failed with {}.", cache_dir, err.to_string()).as_str(), 2);
    return map;
  }

  for dir_entry_res in entries_res.unwrap() {
    if dir_entry_res.is_err() {
      continue;
    }
    let dir_entry = dir_entry_res.unwrap();
    let dir_name_os = dir_entry.file_name();
    let dir_name = dir_name_os.to_str().unwrap().to_owned();

    let dir_metadata_res = dir_entry.metadata();
    if dir_metadata_res.is_err() {
      let err = dir_metadata_res.err().unwrap();
      logger::log_to_core_file(app_handle.clone(), format!("Failed to read metadata of directory \"{}\": {}", cache_dir, err.to_string()).as_str(), 2);
      continue;
    }
    let dir_metadata = dir_metadata_res.unwrap();

    if dir_metadata.is_dir() {
      let app_grids = load_app_grids(app_handle.clone(), dir_entry.path());
      map.insert(dir_name, app_grids);
    }
  }

  return map;
}
