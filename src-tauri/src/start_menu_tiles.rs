use crate::logger;

use std::fs;
use std::path::{ PathBuf, Path };

use serde_json::{Value, Map};


use tauri::{AppHandle, api::path};

// ! List of start menu shortcuts can be gotten here
// C:\Users\Tormak\AppData\Roaming\Microsoft\Windows\Start Menu\Programs\Steam\

// Gets the app tiles directory.
fn get_app_tiles_dir() -> PathBuf {
  let data_dir: PathBuf = path::data_dir().expect("User's data directory should have existed.");
  let data_dir_str: &str = data_dir.to_str().expect("Should have been able to convert pathbuf to str.");
  println!("{}", data_dir_str);

  let app_tiles_dir: PathBuf = data_dir.join("/Microsoft/Windows/Start Menu/Programs/Steam");

  return app_tiles_dir;
}

fn convert_icon_to_ico(app_handle: &AppHandle, icon_path: String) -> (bool, String) {
  return (false, String::from("not implemented"));
}

fn convert_icons_to_icos(app_handle: &AppHandle, game_icons: Map<String, Value>) -> (bool, Map<String, Value>) {
  return (false, Map::new());
}

fn get_appinfo_from_shortcut(app_handle: &AppHandle, shortcut_path: PathBuf) -> (String, Value) {
  return (String::from("Not implemented"), Value::String(String::from("Not implemented")));
}

#[tauri::command]
/// Gets a map containing all the apps with start menu tiles.
pub fn get_apps_with_tiles(app_handle: AppHandle) -> String {
  logger::log_to_core_file(app_handle.to_owned(), "getting app tiles...", 0);

  let app_tiles_dir: PathBuf = get_app_tiles_dir();

  let mut app_tiles: Map<String, Value> = Map::new();


  logger::log_to_core_file(app_handle.to_owned(), format!("Found {} apps with tiles.", app_tiles.len()).as_str(), 0);

  return serde_json::to_string(&app_tiles).unwrap();
}

#[tauri::command]
/// Writes the new icons to the start menu tiles.
pub fn write_app_tiles(app_handle: AppHandle, steam_path: String, steam_active_user_id: String) -> bool {
  logger::log_to_core_file(app_handle.to_owned(), "Writing app tiles...", 0);

  let app_tiles_dir: PathBuf = get_app_tiles_dir();
  
  return false;
}
