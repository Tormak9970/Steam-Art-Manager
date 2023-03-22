#![cfg_attr(
  all(not(debug_assertions), target_os = "windows"),
  windows_subsystem = "windows"
)]

use std::collections::HashMap;
use std::{ io::*, env, fs };
use std::path::{ PathBuf, Path };
use std::u32;
use std::fs::{create_dir_all, File, OpenOptions};

use chrono::prelude::*;

use home::home_dir;
use winreg::enums::*;
use winreg::RegKey;

use tauri::AppHandle;

use serde::{Serialize, Deserialize};

#[derive(Serialize, Deserialize, Debug, PartialEq)]
struct User {
  AccountName: String,
  PersonaName: String,
  RememberPassword: String,
  WantsOfflineMode: String,
  SkipOfflineModeWarning: String,
  AllowAutoLogin: String,
  MostRecent: String,
  TimeStamp: String
}

#[derive(Serialize, Deserialize, Debug, PartialEq)]
struct LoginUsers {
  users: HashMap<String, User>
}

fn get_log_path(app_handle: &AppHandle) -> PathBuf {
  let app_log_dir = app_handle.to_owned().path_resolver().app_log_dir().expect("Tried to resolve app log dir and failed.");
  return app_log_dir.join("steam-art-manager.log");
}

fn get_steam_root_dir() -> PathBuf {
  let home_dir = home_dir().expect("Couldn't get user's home dir.");
  let mut steam_dir = home_dir.clone();

  if home_dir.join("/.var/app/com.valvesoftware.Steam/data/Steam").exists() {
    steam_dir = steam_dir.join("/.var/app/com.valvesoftware.Steam/data/Steam");
  } else {
    steam_dir = steam_dir.join("/.steam/steam");
  }

  return steam_dir;
}

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn log_to_file(app_handle: AppHandle, message: String, level: u8) {
  let log_path = get_log_path(&app_handle);
  let mut log_file: File = OpenOptions::new()
    .create(true)
    .write(true)
    .append(true)
    .open(&log_path)
    .unwrap();

  let level_name = if level == 0 { "INFO" } else if level == 1 { "WARNING" } else { "ERROR" };

  let now: DateTime<Local> = Local::now();
  let hour: u32 = now.hour();
  let min: u32 = now.minute();
  let sec: u32 = now.second();

  if let Err(e) = writeln!(log_file, "[Steam Art Manager] [{hour}:{min}:{sec}] [{level_name}]: {message}") {
    eprintln!("Couldn't write to file: {}", e);
  }
}

#[tauri::command]
fn clean_out_log(app_handle: AppHandle) {
  let log_path = get_log_path(&app_handle);
  let parent = Path::new(&log_path)
    .parent()
    .unwrap()
    .as_os_str()
    .to_str()
    .unwrap();
  create_dir_all(parent).expect("Failed to make directory");

  let log_file: File = OpenOptions::new()
    .create(true)
    .truncate(true)
    .write(true)
    .open(&log_path)
    .unwrap();

  drop(log_file);

  log_to_file(app_handle, String::from("Initialized logging file"), 0);
}

#[tauri::command]
fn get_active_user(app_handle: AppHandle) -> u32 {
  let platform = env::consts::OS;

  if platform == "windows" {
    log_to_file(app_handle.to_owned(), "Checking registry for current user.".to_owned(), 0);
    let hkcu: RegKey = RegKey::predef(HKEY_CURRENT_USER);

    let steam_active_process: RegKey = hkcu.open_subkey("SOFTWARE\\Valve\\Steam\\ActiveProcess").expect("Couldn't getActiveProcess from the registry");
    let active_user_dword: u32 = steam_active_process.get_value("ActiveUser").expect("Couldn't get ActiveUser from the registry");

    log_to_file(app_handle, format!("Got current_user_id: {}", active_user_dword), 0);

    return active_user_dword;
  } else if platform == "linux" {
    log_to_file(app_handle.to_owned(), "Checking /config/loginusers.vdf for current user info.".to_owned(), 0);
    
    let steam_root = get_steam_root_dir();
    let loginusers_vdf = steam_root.join("/config/loginusers.vdf");
    let contents = fs::read_to_string(loginusers_vdf).unwrap();

    let users = vdf_serde::from_str::<LoginUsers>(&contents).unwrap().users;

    for (key, value) in users.into_iter() {
      if value.MostRecent == "1" {
        let big_id = key.parse::<u64>().unwrap() - 76561197960265728;
        let id = u32::try_from(big_id).expect("Should have been able to convert subtracted big_id to u32.");

        log_to_file(app_handle.to_owned(), format!("Got current_user_id: {}", id), 0);
        return id;
      }
    }
    
    log_to_file(app_handle, "Did not find a most recent user".to_owned(), 2);

    return 0;
  } else {
    panic!("Steam Art Manager can only be run on linux or windows!");
  }
}

#[tauri::command]
fn get_steam_games(app_handle: AppHandle) -> String {
  let mut steam_apps: String = "".to_owned();
  let platform = env::consts::OS;

  if platform == "windows" {
    log_to_file(app_handle.to_owned(), "Checking registry for steam games.".to_owned(), 0);

    let hkcu = RegKey::predef(HKEY_CURRENT_USER);
    let steam_apps_reg = hkcu.open_subkey("SOFTWARE\\Valve\\Steam\\Apps").expect("Couldn't Apps from the registry");

    for field in steam_apps_reg.enum_keys().map(|x| x.unwrap()) {
      let mut app: String = "".to_owned();
      app.push_str("\"appId\":");
      app.push_str(&field);
      app.push_str(",");

      let app_reg: RegKey = steam_apps_reg.open_subkey(field).expect("Couldn't get app from registry");
      let mut app_name = "";

      let app_name_reg: Result<String> = app_reg.get_value("Name");

      if app_name_reg.is_ok() {
        app_name = app_name_reg.as_ref().unwrap();
      }
      
      app.push_str("\"name\":\"");
      app.push_str(app_name);
      app.push_str("\",");
      let mut updated_app = "".to_owned();
      updated_app.push_str("{");
      updated_app.push_str(&app[..(app.len() - 1)]);
      updated_app.push_str("},");

      steam_apps.push_str(&updated_app);
    }
  } else if platform == "linux" {
    log_to_file(app_handle.to_owned(), "Checking registry.vdf for steam games.".to_owned(), 0);

    let steam_root = get_steam_root_dir();

    // let steam_apps_reg = hkcu.open_subkey("SOFTWARE\\Valve\\Steam\\Apps").expect("Couldn't Apps from the registry");

    // for field in steam_apps_reg.enum_keys().map(|x| x.unwrap()) {
    //   let mut app: String = "".to_owned();
    //   app.push_str("\"appId\":");
    //   app.push_str(&field);
    //   app.push_str(",");

    //   let app_reg: RegKey = steam_apps_reg.open_subkey(field).expect("Couldn't get app from registry");
    //   let mut app_name = "";

    //   let app_name_reg: Result<String> = app_reg.get_value("Name");

    //   if app_name_reg.is_ok() {
    //     app_name = app_name_reg.as_ref().unwrap();
    //   }
      
    //   app.push_str("\"name\":\"");
    //   app.push_str(app_name);
    //   app.push_str("\",");
    //   let mut updated_app = "".to_owned();
    //   updated_app.push_str("{");
    //   updated_app.push_str(&app[..(app.len() - 1)]);
    //   updated_app.push_str("},");

    //   steam_apps.push_str(&updated_app);
    // }
  } else {
    panic!("Steam Art Manager can only be run on linux or windows!");
  }

  let mut updated_apps = "".to_owned();
  updated_apps.push_str(&"[");
  updated_apps.push_str(&steam_apps[..(steam_apps.len() - 1)]);
  updated_apps.push_str(&"]");
    
  return updated_apps;
}

fn main() {
  tauri::Builder::default()
    .plugin(tauri_plugin_persisted_scope::init())
    .invoke_handler(tauri::generate_handler![clean_out_log, log_to_file, get_active_user, get_steam_games])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}