
use crate::logger;

use std::fs;
use std::path::{ PathBuf, Path };
use std::u32;

#[cfg(target_os = "windows")]
use winreg::{ enums::*, RegKey };

use tauri::AppHandle;

#[cfg(target_os = "linux")]
use home::home_dir;

#[cfg(target_os = "windows")]
pub fn get_steam_root_dir() -> PathBuf {
  let hkcu: RegKey = RegKey::predef(HKEY_CURRENT_USER);

  let steam_install_data: RegKey = hkcu.open_subkey("SOFTWARE\\Valve\\Steam").expect("Couldn't get Steam Install Data from the registry");
  let steam_install_path: String = steam_install_data.get_value("SteamPath").expect("Couldn't get SteamPath from the registry");

  return Path::new(&(steam_install_path.replace("\\", "/"))).to_path_buf();
}

#[cfg(target_os = "linux")]
pub fn get_steam_root_dir() -> PathBuf {
  let pc_home_dir = home_dir().expect("Couldn't get user's home dir.");

  if pc_home_dir.join(".var/app/com.valvesoftware.Steam/data/steam").exists() {
    return pc_home_dir.join(".var/app/com.valvesoftware.Steam/data/steam");
  } else {
    return pc_home_dir.join(".steam/steam");
  }
}

#[tauri::command]
pub fn get_grids_directory(app_handle: AppHandle) -> String {
  logger::log_to_file(app_handle.to_owned(), "Getting steam grids folder...", 0);
  
  let steam_root = get_steam_root_dir();
  let steam_active_user_id = get_active_user(app_handle.to_owned());
  let grids_dir = steam_root.join("userdata").join(steam_active_user_id.to_string()).join("config/grid").to_str().expect("Should have been able to convert to a string.").to_owned().replace("\\", "/");

  let dir_create_res = fs::create_dir_all(grids_dir.clone());
  if dir_create_res.is_err() {
    panic!("Should have been able to create the grids dir!");
  }

  return grids_dir;
}

#[tauri::command]
pub fn get_library_cache_directory(app_handle: AppHandle) -> String {
  logger::log_to_file(app_handle.to_owned(), "Getting steam library cache folder...", 0);
  
  let steam_root = get_steam_root_dir();
  return steam_root.join("appcache/librarycache").to_str().expect("Should have been able to convert to a string.").to_owned().replace("\\", "/");
}

#[tauri::command]
pub fn get_appinfo_path(app_handle: AppHandle) -> String {
  logger::log_to_file(app_handle.to_owned(), "Getting steam appinfo.vdf...", 0);
  
  let steam_root = get_steam_root_dir();
  return steam_root.join("appcache/appinfo.vdf").to_str().expect("Should have been able to convert to a string.").to_owned().replace("\\", "/");
}

#[tauri::command]
pub fn get_shortcuts_path(app_handle: AppHandle) -> String {
  logger::log_to_file(app_handle.to_owned(), "Getting steam shortcuts.vdf...", 0); //! runs to here
  
  let steam_root = get_steam_root_dir();
  let steam_active_user_id = get_active_user(app_handle.to_owned());
  return steam_root.join("userdata").join(steam_active_user_id.to_string()).join("config/shortcuts.vdf").to_str().expect("Should have been able to convert to a string.").to_owned().replace("\\", "/");
}

#[tauri::command]
pub fn get_active_user(app_handle: AppHandle) -> u32 {
  logger::log_to_file(app_handle.to_owned(), "Checking config/loginusers.vdf for current user info.", 0);
    
  let steam_root = get_steam_root_dir();
  let loginusers_vdf = steam_root.join("config/loginusers.vdf");
  let contents: String = fs::read_to_string(loginusers_vdf).unwrap();

  let close_braces_matches: Vec<_> = contents.match_indices("}").collect();
  let most_recent_matches: Vec<_> = contents.match_indices("\"MostRecent\"").collect();

  const MOST_RECENT_LEN: usize = 12;
  const VAL_TABS_LEN: usize = 2;
  const START_OFFSET: usize = 11;

  for (vec_index, (index, _)) in most_recent_matches.iter().enumerate() {
    let most_recent_str: String = contents.chars().skip(index + MOST_RECENT_LEN + VAL_TABS_LEN + 1).take(1).collect();
    let most_recent = most_recent_str.parse::<u32>().unwrap() == 1;

    if most_recent {
      let chars: String;

      if vec_index == 0 {
        chars = contents.chars().skip(START_OFFSET + 1).take(contents.len() - START_OFFSET - 2).collect();
      } else {
        let (brace_index, _) = close_braces_matches[vec_index];
        chars = contents.chars().skip(brace_index + 4).take(contents.len() - brace_index - 2).collect();
      }
      
      let next_quote = chars.find("\"").unwrap();
      let user_id_64_str: String = chars.chars().take(next_quote).collect();

      let big_id = user_id_64_str.parse::<u64>().unwrap() - 76561197960265728;
      let id = u32::try_from(big_id).expect("Should have been able to convert subtracted big_id to u32.");

      logger::log_to_file(app_handle.to_owned(), format!("Got current_user_id: {}", id).as_str(), 0);
      return id;
    }
  }
  
  logger::log_to_file(app_handle, "Did not find a most recent user", 2);

  return 0;
}