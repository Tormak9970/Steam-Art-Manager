use crate::logger;

use std::collections::HashMap;
use std::fs;
use std::path::PathBuf;

use serde_json::{Value, Map};
use image::ImageReader;


use tauri::{AppHandle, Manager};

#[cfg(target_os = "windows")]
// Gets the app tiles directory. (Windows)
fn get_app_tiles_dir(app_handle: AppHandle) -> PathBuf {
  let data_dir: PathBuf = app_handle.to_owned().path().data_dir().expect("User's data directory should have existed.");
  let app_tiles_dir: PathBuf = data_dir.join("Microsoft/Windows/Start Menu/Programs/Steam");

  return app_tiles_dir;
}

#[cfg(target_os = "linux")]
// Gets the app tiles directory. (Linux)
fn get_app_tiles_dir(app_handle: AppHandle) -> PathBuf {
  let data_dir: PathBuf = app_handle.to_owned().path().data_dir().expect("User's data directory should have existed.");
  let app_tiles_dir: PathBuf = data_dir.join("applications");

  return app_tiles_dir;
}

#[cfg(target_os = "windows")]
// Gets the app info from the shortcut file. (Windows)
fn get_appinfo_from_shortcut(filename_str: &str, shortcut_path: PathBuf) -> Option<(String, String)> {
  if filename_str.ends_with(".url") {
    let mut appid = String::from("Not found");
    let mut tile_path = String::from("Not found");

    let file_contents = fs::read_to_string(shortcut_path).expect("Should have been able to read steam shortcut file.");

    let mut lines = file_contents.lines();
    let mut current_line = lines.next();

    while current_line.is_some() {
      let line = current_line.expect("Current line shouldn't be able to be none here.");

      if line.starts_with("URL=steam://rungameid/") {
        appid = line[22..].to_owned();
      } else if line.starts_with("IconFile=") {
        tile_path = line[9..].to_owned();
      }

      current_line = lines.next();
    }
    
    return Some((appid, tile_path));
  }

  return None;
}

#[cfg(target_os = "linux")]
// Gets the app info from the shortcut file. (Linux)
fn get_appinfo_from_shortcut(filename_str: &str, shortcut_path: PathBuf) -> Option<(String, String)> {
  if filename_str.ends_with(".desktop") {
    let mut appid = String::from("Not found");
    let mut tile_path = String::from("Not found");

    let file_contents = fs::read_to_string(shortcut_path).expect("Should have been able to read steam shortcut file.");

    if file_contents.contains("steam://rungameid") {
      let mut lines = file_contents.lines();
      let mut current_line = lines.next();

      while current_line.is_some() {
        let line = current_line.expect("Current line shouldn't be able to be none here.");

        if line.starts_with("Icon=steam_icon_") {
          appid = line[14..].to_owned();
          tile_path = format!("~/.local/share/icons/hicolor/ICON_SIZE/steam_icon_{}.png", appid);
        }

        current_line = lines.next();
      }
      
      return Some((appid, tile_path));
    } else {
      return None;
    }
  }

  return None;
}

#[tauri::command]
/// Gets a map containing all the apps with start menu tiles.
pub fn get_apps_with_tiles(app_handle: AppHandle) -> String {
  logger::log_to_core_file(app_handle.to_owned(), "Getting app tiles...", 0);

  let app_tiles_dir: PathBuf = get_app_tiles_dir(app_handle.clone());

  let mut app_tiles: Map<String, Value> = Map::new();

  let app_tiles_dir_contents = fs::read_dir(app_tiles_dir).expect("Should have been able to read app tiles directory.");
  
  for dir_entry in app_tiles_dir_contents {
    let entry = dir_entry.expect("Should have been able to get directory entry.");

    if entry.file_type().unwrap().is_file() {
      let full_file_path: PathBuf = entry.path();
      let filename = entry.file_name();
      let filename_str: &str = filename.to_str().unwrap();
      
      let appinfo = get_appinfo_from_shortcut(filename_str, full_file_path);
        
      if appinfo.is_some() {
        let (appid, tile_path) = appinfo.unwrap();
        if appid == String::from("Not found") || tile_path == String::from("Not found") {
          logger::log_to_core_file(app_handle.to_owned(), format!("Failed to get tile info for {}.", filename_str).as_str(), 1);
        } else {
          app_tiles.insert(appid, Value::String(tile_path));
        }
      }
    }
  }

  logger::log_to_core_file(app_handle.to_owned(), format!("Found {} apps with tiles.", app_tiles.len()).as_str(), 0);

  return serde_json::to_string(&app_tiles).expect("Should have been able to serialize map.");
}

#[cfg(target_os = "windows")]
// Writes the app tile to the shortcut file. (Windows)
fn write_app_tile(tile_path: String, icon_path: String) -> bool {
  let tile_dest = PathBuf::from(&tile_path);
  let image_src = PathBuf::from(&icon_path);

  if icon_path.ends_with(".ico") {
    let res = fs::copy(image_src, tile_dest);
    return res.is_ok();
  } else {
    let img = ImageReader::open(image_src).unwrap().decode().expect("Should have been able to decode the image.");
    let res = img.save(tile_dest);
    return res.is_ok();
  }
}

#[cfg(target_os = "linux")]
// Writes the app tile to the shortcut file. (Linux)
fn write_app_tile(tile_path: String, icon_path: String) -> bool {
  let sizes = [ 16, 24, 32, 48, 64, 96, 128, 256 ];

  let image_src = PathBuf::from(&icon_path);
  let img_data = ImageReader::open(image_src).unwrap().decode().expect("Should have been able to decode the image.");

  let mut no_errors = true;

  for size in sizes {
    let size_str = size.to_string();
    let sized_dest_str = tile_path.replace("ICON_SIZE", format!("{}x{}", size_str, size_str).as_str());
    let sized_dest_path = PathBuf::from(sized_dest_str);

    let scaled = img_data.resize(size, size, image::imageops::FilterType::Nearest);
    let res = scaled.save(sized_dest_path);
    no_errors = res.is_ok();

    if !no_errors {
      break;
    }
  }

  return no_errors;
}

#[tauri::command]
/// Writes the new icons to the start menu tiles.
pub fn write_app_tiles(app_handle: AppHandle, new_tiles_str: String, tile_paths_str: String) -> String {
  logger::log_to_core_file(app_handle.to_owned(), "Writing app tiles...", 0);

  let new_tiles: HashMap<String, String> = serde_json::from_str(new_tiles_str.as_str()).unwrap();
  let tile_paths: HashMap<String, String> = serde_json::from_str(tile_paths_str.as_str()).unwrap();

  let mut failed_ids: String = String::from("[");
  
  for (appid, tile_path) in tile_paths {
    let icon_path = new_tiles.get(&appid).expect(format!("new_tiles should have had key {}", appid).as_str());
    let success = write_app_tile(tile_path, icon_path.to_owned());

    if !success {
      failed_ids.push_str(&appid);
      failed_ids.push_str(", ");
    }
  }

  let failed_ids_length = failed_ids.len();
  if failed_ids_length > 1 {
    failed_ids = (&failed_ids[..(failed_ids_length - 2)]).to_owned();
  }

  failed_ids.push(']');

  return failed_ids;
}
