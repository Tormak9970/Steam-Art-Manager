
use crate::logger;

use std::fs;
use std::path::{ PathBuf, Path };

use serde_json::{Value, Map};

#[cfg(target_os = "windows")]
use winreg::{ enums::*, RegKey };

use tauri::AppHandle;

#[cfg(target_os = "linux")]
use home::home_dir;

#[cfg(target_os = "windows")]
/// Gets the steam root dir for windows systems.
pub fn get_steam_root_dir() -> Result<PathBuf, String> {
  let hkcu: RegKey = RegKey::predef(HKEY_CURRENT_USER);

  let steam_install_data_res = hkcu.open_subkey("SOFTWARE\\Valve\\Steam");

  if steam_install_data_res.is_ok() {
    let steam_install_data: RegKey = steam_install_data_res.ok().expect("Should have been able to get steam install registry result.");
    let steam_install_path_res = steam_install_data.get_value("SteamPath");

    if steam_install_path_res.is_ok() {
      let steam_install_path: String = steam_install_path_res.ok().expect("Should have been able to get steam install from registry.");
      return Ok(Path::new(&(steam_install_path.replace("\\", "/"))).to_path_buf());
    } else {
      return Err(String::from("Couldn't get SteamPath from the registry."));
    }
  } else {
    return Err(String::from("Couldn't get Steam Install Data from the registry."));
  }
}

#[cfg(target_os = "linux")]
/// Gets the steam root dir for linux systems.
pub fn get_steam_root_dir() -> Result<PathBuf, String> {
  let mut pc_home_dir: PathBuf = home_dir().expect("Couldn't get user's home dir.");

  if pc_home_dir.join(".var/app/com.valvesoftware.Steam/data/Steam").exists() {
    pc_home_dir = pc_home_dir.join(".var/app/com.valvesoftware.Steam/data/Steam");
  } else {
    pc_home_dir = pc_home_dir.join(".steam/steam");
  }

  if pc_home_dir.exists() {
    return Ok(pc_home_dir);
  } else {
    return Err(String::from("Steam install path does not exist."));
  }
}

#[tauri::command]
/// Gets the steam grids directory.
pub fn get_grids_directory(app_handle: AppHandle, steam_path: String, steam_active_user_id: String) -> String {
  logger::log_to_core_file(app_handle.to_owned(), "Getting steam grids folder...", 0);
  
  let steam_root: PathBuf = PathBuf::from(steam_path);
  let grids_dir: String = steam_root.join("userdata").join(steam_active_user_id.to_string()).join("config/grid").to_str().expect("Should have been able to convert to a string.").to_owned().replace("\\", "/");

  let dir_create_res = fs::create_dir_all(grids_dir.clone());
  if dir_create_res.is_err() {
    logger::log_to_core_file(app_handle.to_owned(), "Should have been able to create the grids dir!", 2);
    panic!("Should have been able to create the grids dir!");
  }

  return grids_dir;
}

#[tauri::command]
/// Gets the steam library cache directory.
pub fn get_library_cache_directory(app_handle: AppHandle, steam_path: String) -> String {
  logger::log_to_core_file(app_handle.to_owned(), "Getting steam library cache folder...", 0);
  
  let steam_root: PathBuf = PathBuf::from(steam_path);
  let library_cache_path: PathBuf = steam_root.join("appcache/librarycache");
  let library_cache_str: String = library_cache_path.to_str().expect("Should have been able to convert to a string.").to_owned().replace("\\", "/");

  if library_cache_path.exists() {
    return library_cache_str;
  } else {
    let mut return_value: String = String::from("DNE");
    return_value.push_str(&library_cache_str);
    return return_value;
  }
}

#[tauri::command]
/// Gets the steam appinfo.vdf path.
pub fn get_appinfo_path(app_handle: AppHandle, steam_path: String) -> String {
  logger::log_to_core_file(app_handle.to_owned(), "Getting steam appinfo.vdf...", 0);
  
  let steam_root: PathBuf = PathBuf::from(steam_path);
  return steam_root.join("appcache/appinfo.vdf").to_str().expect("Should have been able to convert to a string.").to_owned().replace("\\", "/");
}

#[tauri::command]
/// Gets the steam shortcuts.vdf path.
pub fn get_shortcuts_path(app_handle: AppHandle, steam_path: String, steam_active_user_id: String) -> String {
  logger::log_to_core_file(app_handle.to_owned(), "Getting steam shortcuts.vdf...", 0);
  
  let steam_root: PathBuf = PathBuf::from(steam_path);
  return steam_root.join("userdata").join(steam_active_user_id.to_string()).join("config/shortcuts.vdf").to_str().expect("Should have been able to convert to a string.").to_owned().replace("\\", "/");
}

#[tauri::command]
/// Gets the steam localconfig.vdf path.
pub fn get_localconfig_path(app_handle: AppHandle, steam_path: String, steam_active_user_id: String) -> String {
  logger::log_to_core_file(app_handle.to_owned(), "Getting steam localconfig.vdf...", 0);
  
  let steam_root: PathBuf = PathBuf::from(steam_path);
  return steam_root.join("userdata").join(steam_active_user_id.to_string()).join("config/localconfig.vdf").to_str().expect("Should have been able to convert to a string.").to_owned().replace("\\", "/");
}

/// Reads a steam user's id.
fn read_steam_user_id(user_block: &str) -> String {
  let quote_index = user_block.find("\"").expect("Should have been able to find a quote.");
  let id_str = &user_block[..quote_index];
  return id_str.to_owned();
}

/// Reads a steam user.
fn read_steam_user(user_id: &str, user_block: &str) -> Map<String, Value> {
  let id_32 = user_id.parse::<u64>().unwrap() - 76561197960265728;

  let mut steam_user: Map<String, Value> = Map::new();
  steam_user.insert("id64".to_owned(), Value::String(user_id.to_owned()));
  steam_user.insert("id32".to_owned(), Value::String(id_32.to_string()));

  let prop_start_matches: Vec<(usize, &str)> = user_block.match_indices("\n\t").collect();
  let len = prop_start_matches.len();

  for (vec_index, (index, _)) in prop_start_matches.clone().into_iter().enumerate() {
    if vec_index < len - 1 {
      let next_prop_start = prop_start_matches[vec_index + 1].0;
      let prop_line = &user_block[(index + 4)..(next_prop_start - 1)];

      let segments: Vec<&str> = prop_line.split("\"\t\t\"").collect();
      let key = segments[0].to_owned();
      let value = segments[1].to_owned();

      steam_user.insert(key, Value::String(value));
    }
  }

  return steam_user;
}

/// Reads the steam users.
fn read_steam_users(steam_path: String) -> Map<String, Value> {
  let mut steam_users: Map<String, Value> = Map::new();
    
  let steam_root: PathBuf = PathBuf::from(steam_path);
  let loginusers_vdf: PathBuf = steam_root.join("config/loginusers.vdf");
  let contents: String = fs::read_to_string(loginusers_vdf).unwrap();

  if contents != String::from("") {
    let id_start_matches: Vec<(usize, &str)> = contents.match_indices("\n\t\"").collect();
    let block_end_matches: Vec<(usize, &str)> = contents.match_indices("}").collect();

    for (vec_index, (index, _)) in id_start_matches.iter().enumerate() {
      let close_brace_index: usize = block_end_matches[vec_index].0;
      let user_block: String = contents[(*index + 3)..close_brace_index].to_owned();

      let id: String = read_steam_user_id(&user_block);
      
      let user_map: Map<String, Value> = read_steam_user(&id, &user_block[(id.len() + 4)..]);

      steam_users.insert(id.to_string(), Value::Object(user_map));
    }
  }
  
  return steam_users;
}

#[tauri::command]
/// Gets all steam users that have logged in on this computer.
pub fn get_steam_users(app_handle: AppHandle, steam_path: String) -> String {
  logger::log_to_core_file(app_handle.to_owned(), "Checking config/loginusers.vdf for current user info.", 0);
    
  let steam_users = read_steam_users(steam_path);
  
  logger::log_to_core_file(app_handle.to_owned(), format!("Loaded {} steam users.", steam_users.len()).as_str(), 0);

  return serde_json::to_string(&steam_users).unwrap();
}