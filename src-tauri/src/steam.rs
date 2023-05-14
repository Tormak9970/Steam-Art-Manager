
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
pub fn get_steam_root_dir() -> PathBuf {
  let hkcu: RegKey = RegKey::predef(HKEY_CURRENT_USER);

  let steam_install_data: RegKey = hkcu.open_subkey("SOFTWARE\\Valve\\Steam").expect("Couldn't get Steam Install Data from the registry");
  let steam_install_path: String = steam_install_data.get_value("SteamPath").expect("Couldn't get SteamPath from the registry");

  return Path::new(&(steam_install_path.replace("\\", "/"))).to_path_buf();
}

#[cfg(target_os = "linux")]
/// Gets the steam root dir for linux systems.
pub fn get_steam_root_dir() -> PathBuf {
  let pc_home_dir = home_dir().expect("Couldn't get user's home dir.");

  if pc_home_dir.join(".var/app/com.valvesoftware.Steam/data/steam").exists() {
    return pc_home_dir.join(".var/app/com.valvesoftware.Steam/data/steam");
  } else {
    return pc_home_dir.join(".steam/steam");
  }
}

#[tauri::command]
/// Gets the steam grids directory.
pub fn get_grids_directory(app_handle: AppHandle, steam_active_user_id: String) -> String {
  logger::log_to_file(app_handle.to_owned(), "Getting steam grids folder...", 0);
  
  let steam_root = get_steam_root_dir();
  let grids_dir = steam_root.join("userdata").join(steam_active_user_id.to_string()).join("config/grid").to_str().expect("Should have been able to convert to a string.").to_owned().replace("\\", "/");

  let dir_create_res = fs::create_dir_all(grids_dir.clone());
  if dir_create_res.is_err() {
    logger::log_to_file(app_handle.to_owned(), "Should have been able to create the grids dir!", 2);
    panic!("Should have been able to create the grids dir!");
  }

  return grids_dir;
}

#[tauri::command]
/// Gets the steam library cache directory.
pub fn get_library_cache_directory(app_handle: AppHandle) -> String {
  logger::log_to_file(app_handle.to_owned(), "Getting steam library cache folder...", 0);
  
  let steam_root = get_steam_root_dir();
  return steam_root.join("appcache/librarycache").to_str().expect("Should have been able to convert to a string.").to_owned().replace("\\", "/");
}

#[tauri::command]
/// Gets the steam appinfo.vdf path.
pub fn get_appinfo_path(app_handle: AppHandle) -> String {
  logger::log_to_file(app_handle.to_owned(), "Getting steam appinfo.vdf...", 0);
  
  let steam_root = get_steam_root_dir();
  return steam_root.join("appcache/appinfo.vdf").to_str().expect("Should have been able to convert to a string.").to_owned().replace("\\", "/");
}

#[tauri::command]
/// Gets the steam shortcuts.vdf path.
pub fn get_shortcuts_path(app_handle: AppHandle, steam_active_user_id: String) -> String {
  logger::log_to_file(app_handle.to_owned(), "Getting steam shortcuts.vdf...", 0);
  
  let steam_root = get_steam_root_dir();
  return steam_root.join("userdata").join(steam_active_user_id.to_string()).join("config/shortcuts.vdf").to_str().expect("Should have been able to convert to a string.").to_owned().replace("\\", "/");
}

#[tauri::command]
/// Gets the steam localconfig.vdf path.
pub fn get_localconfig_path(app_handle: AppHandle, steam_active_user_id: String) -> String {
  logger::log_to_file(app_handle.to_owned(), "Getting steam localconfig.vdf...", 0);
  
  let steam_root = get_steam_root_dir();
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
fn read_steam_users() -> Map<String, Value> {
  let mut steam_users: Map<String, Value> = Map::new();
    
  let steam_root: PathBuf = get_steam_root_dir();
  let loginusers_vdf: PathBuf = steam_root.join("config/loginusers.vdf");
  let contents: String = fs::read_to_string(loginusers_vdf).unwrap();

  let id_start_matches: Vec<(usize, &str)> = contents.match_indices("\n\t\"").collect();
  let block_end_matches: Vec<(usize, &str)> = contents.match_indices("}").collect();

  for (vec_index, (index, _)) in id_start_matches.iter().enumerate() {
    let close_brace_index: usize = block_end_matches[vec_index].0;
    let user_block: String = contents[(*index + 3)..close_brace_index].to_owned();

    let id: String = read_steam_user_id(&user_block);
    
    let user_map: Map<String, Value> = read_steam_user(&id, &user_block[(id.len() + 4)..]);

    steam_users.insert(id.to_string(), Value::Object(user_map));
  }

  return steam_users;
}

#[tauri::command]
/// Gets all steam users that have logged in on this computer.
pub fn get_steam_users(app_handle: AppHandle) -> String {
  logger::log_to_file(app_handle.to_owned(), "Checking config/loginusers.vdf for current user info.", 0);
    
  let steam_users = read_steam_users();
  
  logger::log_to_file(app_handle.to_owned(), format!("Loaded {} steam users.", steam_users.len()).as_str(), 0);

  return serde_json::to_string(&steam_users).unwrap();
}