#![cfg_attr(
  all(not(debug_assertions), target_os = "windows"),
  windows_subsystem = "windows"
)]

use std::io::*;

use std::i64;
use std::fs::{create_dir_all, File, OpenOptions};
use std::path::Path;

use chrono::prelude::*;

use winreg::enums::*;
use winreg::RegKey;

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn log_to_file(message: String, level: u8, log_path: String) {
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
fn clean_out_log(log_path: String) {
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

  log_to_file(String::from("Initialized logging file"), 0, log_path);
}

#[tauri::command]
fn get_active_user() -> i64 {
  let hkcu: RegKey = RegKey::predef(HKEY_CURRENT_USER);

  let steam_active_process: RegKey = hkcu.open_subkey("SOFTWARE\\Valve\\Steam\\ActiveProcess").expect("Couldn't getActiveProcess from the registry");
  let active_user_dword: String = steam_active_process.get_value("ActiveUser").expect("Couldn't get ActiveUser from the registry");

  let active_user_id = i64::from_str_radix(&active_user_dword[..], 16);
  
  if active_user_id.is_ok() {
    return active_user_id.unwrap();
  } else {
    eprintln!("Couldn't convert active_user hex to int: {}", active_user_id.unwrap_err());
    return 0;
  }
}

#[tauri::command]
fn get_steam_games() -> String {
  let hkcu = RegKey::predef(HKEY_CURRENT_USER);
  let steam_apps_reg = hkcu.open_subkey("SOFTWARE\\Valve\\Steam\\Apps").expect("Couldn't Apps from the registry");

  let mut steam_apps: String = "".to_owned();

  for (field, value) in steam_apps_reg.enum_values().map(|x| x.unwrap()) {
    println!("{} = {:?}", field, value);

    let mut app: String = "".to_owned();
    app.push_str("appId:\"");
    app.push_str(&field);
    app.push_str("\",");

    let app_reg: RegKey = steam_apps_reg.open_subkey(field).expect("Couldn't get app from registry");
    let mut app_name = "";

    let app_name_reg: Result<String> = app_reg.get_value("Name");

    if app_name_reg.is_ok() {
      app_name = app_name_reg.as_ref().unwrap();
    }
    
    app.push_str("name:\"");
    app.push_str(app_name);
    app.push_str("\",");

    let mut updated_app = "".to_owned();
    updated_app.push_str("{");
    updated_app.push_str(&app[..(app.len() - 1)]);
    updated_app.push_str("},");

    steam_apps.push_str(&updated_app);
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