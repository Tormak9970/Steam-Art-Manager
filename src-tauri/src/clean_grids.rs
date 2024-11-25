use std::{collections::HashMap, fs, path::PathBuf};

use tauri::AppHandle;

use crate::{steam, utils::logger, zip_controller};


#[derive(Clone, serde::Serialize)]
#[allow(non_snake_case)]
struct CleanConflicts {
  fileAName: String,
  fileAPath: String,
  fileBName: String,
  fileBPath: String,
  appid: String,
  gridType: String
}

#[tauri::command]
/// Downloads a file from a url.
pub async fn clean_grids(app_handle: AppHandle, steam_path: String, steam_active_user_id: String, preset: String, all_appids: String, selected_game_ids: String) -> String {
  logger::log_to_core_file(app_handle.to_owned(), format!("Starting {} grid cleaning.", preset).as_str(), 0);
  
  let appids_arr: Vec<String> = serde_json::from_str(all_appids.as_str()).expect("Should have been able to deserialize appids array.");
  
  let grids_dir_path: String = steam::get_grids_directory(app_handle.to_owned(), steam_path, steam_active_user_id);
  let grids_dir_contents = fs::read_dir(grids_dir_path).unwrap();

  let mut found_apps: HashMap<String, (String, String)> = HashMap::new();
  let mut conflicts: Vec<CleanConflicts> = Vec::new();
  
  
  if preset == String::from("clean") {
    for dir_entry in grids_dir_contents {
      let entry = dir_entry.expect("Should have been able to get directory entry.");
  
      if !entry.file_type().unwrap().is_file() {
        continue;
      }

      let full_file_path: PathBuf = entry.path();
      let full_file_path_str: &str = full_file_path.to_str().unwrap();
      let filename = entry.file_name();
      let filename_str: &str = filename.to_str().unwrap();
      
      let (id, grid_type) = zip_controller::get_id_from_grid_name(filename_str);
      let id_type_str: String = format!("{}_{}", id, grid_type);

      if !appids_arr.contains(&id) {
        let remove_res = fs::remove_file(full_file_path);
        if remove_res.is_err() {
          let err = remove_res.err().unwrap();
          return format!("{{ \"error\": \"{}\"}}", err.to_string());
        }

        logger::log_to_core_file(app_handle.to_owned(), format!("Deleted {}.", filename_str).as_str(), 0);
        continue;
      }

      if found_apps.contains_key(&id_type_str) {
        // ? There's a conflict
        let (other_filename, other_full_path) = found_apps.get(&id_type_str).expect("Map should have contained the id_type_str.");

        conflicts.push(CleanConflicts { fileAPath: other_full_path.to_owned(), fileAName: other_filename.to_owned(), fileBPath: String::from(full_file_path_str), fileBName: String::from(filename_str), appid: id.clone(), gridType: grid_type.clone() });
        
        logger::log_to_core_file(app_handle.to_owned(), format!("Detected conflict between {} and {}.", filename_str, other_filename).as_str(), 0);
      } else {
        found_apps.insert(id_type_str, (String::from(filename_str), String::from(full_file_path_str)));
      }
    }
  } else {
    let game_ids_arr: Vec<String> = serde_json::from_str(selected_game_ids.as_str()).expect("Should have been able to deserialize selected appids array.");

    for dir_entry in grids_dir_contents {
      let entry = dir_entry.expect("Should have been able to get directory entry.");
  
      if !entry.file_type().unwrap().is_file() {
        continue;
      }

      let full_file_path: PathBuf = entry.path();
      let filename = entry.file_name();
      let filename_str: &str = filename.to_str().unwrap();
      
      let (id, _) = zip_controller::get_id_from_grid_name(filename_str);

      if game_ids_arr.contains(&id) {
        let remove_res = fs::remove_file(full_file_path);
        if remove_res.is_err() {
          let err = remove_res.err().unwrap();
          return format!("{{ \"error\": \"{}\"}}", err.to_string());
        }

        logger::log_to_core_file(app_handle.to_owned(), format!("Deleted {}.", filename_str).as_str(), 0);
      }
    }
  }


  logger::log_to_core_file(app_handle.to_owned(), format!("{} grid cleaning complete.", preset).as_str(), 0);

  return serde_json::to_string(&conflicts).expect("Should have been able to serialize conflict array.");
}
