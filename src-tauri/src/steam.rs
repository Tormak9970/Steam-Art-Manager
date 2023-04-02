
use crate::logger;

use std::fs;
use std::path::{ PathBuf, Path };
use std::u32;

#[cfg(target_os = "windows")]
use winreg::{ enums::*, RegKey };

use tauri::AppHandle;

#[cfg(target_os = "linux")]
use home::home_dir;
#[cfg(target_os = "linux")]
use crate::vdf_structs;

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
  let mut steam_dir = home_dir.clone();

  if pc_home_dir.join(".var/app/com.valvesoftware.Steam/data/steam").exists() {
    steam_dir = steam_dir.join(".var/app/com.valvesoftware.Steam/data/steam");
  } else {
    steam_dir = steam_dir.join(".steam/steam");
  }

  return steam_dir;
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
#[cfg(target_os = "windows")]
pub fn get_active_user(app_handle: AppHandle) -> u32 {
  logger::log_to_file(app_handle.to_owned(), "Checking registry for current user.", 0);
  let hkcu: RegKey = RegKey::predef(HKEY_CURRENT_USER);

  let steam_active_process: RegKey = hkcu.open_subkey("SOFTWARE\\Valve\\Steam\\ActiveProcess").expect("Couldn't getActiveProcess from the registry");
  let active_user_dword: u32 = steam_active_process.get_value("ActiveUser").expect("Couldn't get ActiveUser from the registry");

  logger::log_to_file(app_handle, format!("Got current_user_id: {}", active_user_dword).as_str(), 0);

  return active_user_dword;
}

#[tauri::command]
#[cfg(target_os = "linux")]
pub fn get_active_user(app_handle: AppHandle) -> u32 {
  logger::log_to_file(app_handle.to_owned(), "Checking config/loginusers.vdf for current user info.", 0);
    
  let steam_root = get_steam_root_dir();
  let loginusers_vdf = steam_root.join("config/loginusers.vdf");
  let contents = fs::read_to_string(loginusers_vdf).unwrap();

  let users = vdf_serde::from_str::<vdf_structs::LoginUsers>(&contents).unwrap().users;

  for (key, value) in users.into_iter() {
    if value.MostRecent == "1" {
      let big_id = key.parse::<u64>().unwrap() - 76561197960265728;
      let id = u32::try_from(big_id).expect("Should have been able to convert subtracted big_id to u32.");

      logger::log_to_file(app_handle.to_owned(), format!("Got current_user_id: {}", id).as_str(), 0);
      return id;
    }
  }
  
  logger::log_to_file(app_handle, "Did not find a most recent user", 2);

  return 0;
}

// ! This isn't needed anymore but leaving it because in the event something changes its still quite useful.
// #[tauri::command]
// #[cfg(target_os = "windows")]
// pub fn get_steam_apps(app_handle: AppHandle) -> String {
//   let mut steam_apps: String = "".to_owned();

//   logger::log_to_file(app_handle.to_owned(), "Checking registry for steam games.", 0);

//   let hkcu = RegKey::predef(HKEY_CURRENT_USER);
//   let steam_apps_reg = hkcu.open_subkey("SOFTWARE\\Valve\\Steam\\Apps").expect("Couldn't Apps from the registry");

//   for field in steam_apps_reg.enum_keys().map(|x| x.unwrap()) {
//     let mut app: String = "".to_owned();
//     app.push_str("\"appId\":");
//     app.push_str(&field);
//     app.push_str(",");

//     let app_reg: RegKey = steam_apps_reg.open_subkey(field).expect("Couldn't get app from registry");
//     let mut app_name = "";

//     let app_name_reg: Result<String> = app_reg.get_value("Name");

//     if app_name_reg.is_ok() {
//       app_name = app_name_reg.as_ref().unwrap();
//     }
    
//     app.push_str("\"name\":\"");
//     app.push_str(app_name);
//     app.push_str("\",");
//     let mut updated_app = "".to_owned();
//     updated_app.push_str("{");
//     updated_app.push_str(&app[..(app.len() - 1)]);
//     updated_app.push_str("},");

//     steam_apps.push_str(&updated_app);
//   }

//   let mut updated_apps = "".to_owned();
//   updated_apps.push_str(&"[");
//   updated_apps.push_str(&steam_apps[..(steam_apps.len() - 1)]);
//   updated_apps.push_str(&"]");
    
//   return updated_apps;
// }

// #[tauri::command]
// #[cfg(target_os = "linux")]
// pub fn get_steam_apps(app_handle: AppHandle) -> String {
//   let mut steam_apps: String = "".to_owned();

//   logger::log_to_file(app_handle.to_owned(), "Checking registry.vdf for steam games.", 0);

//   let steam_root = get_steam_root_dir();
//   let registry_vdf = steam_root.parent().expect("Parent should have existed").join("registry.vdf");
//   let contents = fs::read_to_string(registry_vdf).unwrap();

//   let steam_apps_res = vdf_serde::from_str::<vdf_structs::Registry>(&contents).unwrap().HKCU.Software.Valve.Steam.apps;

//   for (key, value) in steam_apps_res.into_iter() {
//     let mut app: String = "".to_owned();
//     app.push_str("\"appId\":");
//     app.push_str(&key);
//     app.push_str(",");

//     let mut app_name = "";

//     if value.contains_key("name") {
//       app_name = value.get("name").unwrap().as_ref();
//     }
    
//     app.push_str("\"name\":\"");
//     app.push_str(app_name);
//     app.push_str("\",");
//     let mut updated_app = "".to_owned();
//     updated_app.push_str("{");
//     updated_app.push_str(&app[..(app.len() - 1)]);
//     updated_app.push_str("},");

//     steam_apps.push_str(&updated_app);
//   }

//   let mut updated_apps = "".to_owned();
//   updated_apps.push_str(&"[");
//   updated_apps.push_str(&steam_apps[..(steam_apps.len() - 1)]);
//   updated_apps.push_str(&"]");
    
//   return updated_apps;
// }
