use std::path::{ PathBuf, Path };
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
  return app_log_dir.join("steam-art-manager.log");
}

#[tauri::command]
pub fn log_to_file(app_handle: AppHandle, message: &str, level: u8) {
  let log_path: PathBuf = get_log_path(&app_handle);
  let mut log_file: File = OpenOptions::new()
    .create(true)
    .write(true)
    .append(true)
    .open(&log_path)
    .unwrap();

  let level_name: &str = if level == 0 { "INFO" } else if level == 1 { "WARNING" } else { "ERROR" };

  let now: DateTime<Local> = Local::now();
  let hour: u32 = now.hour();
  let min: u32 = now.minute();
  let sec: u32 = now.second();

  if let Err(e) = writeln!(log_file, "[Steam Art Manager] [{hour}:{min}:{sec}] [{level_name}]: {message}") {
    eprintln!("Couldn't write to file: {}", e);
  }
}

#[tauri::command]
pub fn clean_out_log(app_handle: AppHandle) {
  let log_path: PathBuf = get_log_path(&app_handle);
  let parent: &str = Path::new(&log_path)
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

  log_to_file(app_handle, "Initialized logging file", 0);
}