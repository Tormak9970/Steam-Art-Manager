use std::path::PathBuf;
use std::io::*;
use std::fs::{
  create_dir_all,
  File,
  OpenOptions
};

use tauri::{AppHandle, Manager};
use chrono::prelude::*;

/// Gets the log file path for this app.
pub fn get_core_log_path(app_handle: &AppHandle) -> PathBuf {
  let app_log_dir: PathBuf = app_handle.to_owned().path().app_log_dir().expect("Tried to resolve app log dir and failed.");

  if !app_log_dir.exists() {
    create_dir_all(&app_log_dir).expect("Failed to make directory");
  }

  return app_log_dir.join("core.log");
}

/// Gets the log file path for this app.
pub fn get_batch_apply_log_path(app_handle: &AppHandle) -> PathBuf {
  let app_log_dir: PathBuf = app_handle.to_owned().path().app_log_dir().expect("Tried to resolve app log dir and failed.");

  if !app_log_dir.exists() {
    create_dir_all(&app_log_dir).expect("Failed to make directory");
  }

  return app_log_dir.join("batch-apply.log");
}

/// General function to log a message to the provided file.
pub fn log_to_file(log_path: &PathBuf, message: &str, level: u8) {
  let log_file_res = OpenOptions::new()
    .create(true)
    .write(true)
    .append(true)
    .open(log_path);

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
/// Logs a message to file with level 0 (info), 1 (warn), or 2 (err) to core.log.
pub fn log_to_core_file(app_handle: AppHandle, message: &str, level: u8) {
  let log_path: PathBuf = get_core_log_path(&app_handle);
  log_to_file(&log_path, message, level);
}

#[tauri::command]
/// Logs a message to file with level 0 (info), 1 (warn), or 2 (err) to batch-apply.log.
pub fn log_to_batch_apply_file(app_handle: AppHandle, message: &str, level: u8) {
  let log_path: PathBuf = get_batch_apply_log_path(&app_handle);
  log_to_file(&log_path, message, level);
}

#[tauri::command]
/// Cleans the log file for a new launch of the app.
pub fn clean_out_log(app_handle: AppHandle) {
  let core_log_path: PathBuf = get_core_log_path(&app_handle);
  File::create(&core_log_path).expect("Core log path should have existed.");

  let batch_apply_log_path: PathBuf = get_core_log_path(&app_handle);
  File::create(&batch_apply_log_path).expect("Batch Apply log path should have existed.");

  log_to_core_file(app_handle, "Initialized logging file", 0);
}