use std::path::PathBuf;
use std::io::*;
use std::fs::{
  create_dir_all,
  File,
  OpenOptions
};

use tauri::AppHandle;
use chrono::prelude::*;

pub fn get_log_path(app_handle: &AppHandle) -> PathBuf {
  let app_log_dir: PathBuf = app_handle.to_owned().path_resolver().app_log_dir().expect("Tried to resolve app log dir and failed.");

  if !app_log_dir.exists() {
    create_dir_all(&app_log_dir).expect("Failed to make directory");
  }

  return app_log_dir.join("steam-art-manager.log");
}

#[tauri::command]
pub fn log_to_file(app_handle: AppHandle, message: &str, level: u8) {
  let log_path: PathBuf = get_log_path(&app_handle);

  let log_file_res = OpenOptions::new()
    .create(true)
    .write(true)
    .append(true)
    .open(&log_path);

  if log_file_res.is_ok() {
    let mut log_file = log_file_res.unwrap();

    let level_name: &str = if level == 0 { "INFO" } else if level == 1 { "WARNING" } else { "ERROR" };
  
    let now: DateTime<Local> = Local::now();
    let hour: u32 = now.hour();
    let min: u32 = now.minute();
    let sec: u32 = now.second();
  
    if let Err(e) = writeln!(log_file, "[Steam Art Manager] [{hour}:{min}:{sec}] [{level_name}]: {message}") {
      eprintln!("Couldn't write to file: {}", e);
    }
  } else {
    panic!("Error opening log file! Log file path: {}", log_path.display());
  }
}

#[tauri::command]
pub fn clean_out_log(app_handle: AppHandle) {
  let log_path: PathBuf = get_log_path(&app_handle);

  File::create(&log_path).expect("Log path should have existed.");

  log_to_file(app_handle, "Initialized logging file", 0);
}