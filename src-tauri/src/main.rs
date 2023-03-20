#![cfg_attr(
  all(not(debug_assertions), target_os = "windows"),
  windows_subsystem = "windows"
)]

use chrono::prelude::*;
/**
 * Rogue Legacy Save Editor is a tool for viewing and modifying game saves from Rogue Legacy 1 & 2.
 * Copyright (C) 2023 Travis Lane (Tormak)
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>
 */
use std::fs::{create_dir_all, File, OpenOptions};
use std::io::prelude::*;
use std::path::Path;

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

fn main() {
  tauri::Builder::default()
    .plugin(tauri_plugin_persisted_scope::init())
    .invoke_handler(tauri::generate_handler![clean_out_log, log_to_file])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
