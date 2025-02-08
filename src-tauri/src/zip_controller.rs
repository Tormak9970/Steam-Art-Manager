use crate::{logger, steam};

use std::{path::PathBuf, io::{BufReader, self, Write}, fs::{File, read_dir, read}};

use serde_json::{Map, Value};
use tauri::AppHandle;
use tauri_plugin_dialog::DialogExt;
use zip::{self, write::SimpleFileOptions};

use home::home_dir;

/// Gets the id for a grid from its name.
pub fn get_id_from_grid_name(grid_name: &str) -> (String, String) {
  let dot_index: usize = grid_name.find(".").expect("File should have had a file extension");
  let underscore_index_res = grid_name.find("_");
  let name: &str = &grid_name[0..dot_index];

  if underscore_index_res.is_some() {
    let underscore_index = underscore_index_res.expect("Should have been able to get underscore index.");
    let id: &str = &name[0..underscore_index];
    let grid_type: &str = &name[(underscore_index+1)..];

    return (id.to_owned(), grid_type.to_owned());
  } else if name.ends_with("p") {
    let id = &name[0..(name.len() - 1)];
    return (id.to_owned(), "capsule".to_owned());
  } else {
    if &grid_name[(dot_index+1)..] == "json" {
      return (name.to_owned(), "logoposition".to_owned());
    } else {
      return (name.to_owned(), "widecapsule".to_owned());
    }
  }
}

/// Constructs the export names for grids.
fn construct_grid_export_name(filename: &str, id: &String, grid_type: &String, platform: &str, id_name_map: &Map<String, Value>) -> String {
  let dot_index: usize = filename.find(".").expect("File should have had a file extension");
  let file_ext: &str = &filename[dot_index..];

  let mut filename_core: String = id.to_owned();

  if platform == "nonsteam" && id_name_map.contains_key(id) {
    let shortcut_name_value: &Value = id_name_map.get(id).expect("Shortcut name map should have contained shortcut id.");
    let shortcut_name: &str = shortcut_name_value.as_str().expect("Should have been able to convert shortcut name value to str.");

    filename_core = shortcut_name.to_owned();
  }

  let mut output_filename: String = String::from(platform);
  output_filename.push_str("__");
  output_filename.push_str(&filename_core);
  output_filename.push_str("__");
  output_filename.push_str(&grid_type);
  output_filename.push_str(file_ext);

  return output_filename;
}

/// Pulls the necessary information from a grid's export name.
fn deconstruct_grid_export_name(filename: &str) -> (String, String, String, String) {
  let dot_index: usize = filename.find(".").expect("File should have had a file extension");
  let file_ext: &str = &filename[dot_index..];

  let parts: Vec<&str> = filename.split("__").collect();
  let grid_type: &str = &parts[2][..(parts[2].len() - file_ext.len())];

  return (parts[0].to_owned(), parts[1].to_owned(), grid_type.to_owned(), file_ext.to_owned());
}

/// Get the proper name for a grid when importing.
fn get_import_grid_name(app_handle: &AppHandle, filename: &str, name_id_map: &Map<String, Value>) -> (String, String, String) {
  if filename.contains("__") {
    let (platform, filename_core, grid_type, file_ext) = deconstruct_grid_export_name(filename);

    let mut file_core: &str = &filename_core;
    let file_grid_type: &str;

    match grid_type.as_str() {
      "capsule" => {
        file_grid_type = "p";
      },
      "widecapsule" => {
        file_grid_type = "";
      },
      "hero" => {
        file_grid_type = "_hero";
      },
      "logo" => {
        file_grid_type = "_logo";
      },
      "icon" => {
        file_grid_type = "_icon";
      },
      "logoposition" => {
        file_grid_type = "";
      },
      _ => {
        logger::log_to_core_file(app_handle.to_owned(), format!("Unexpected grid type: {}", grid_type).as_str(), 2);
        panic!("Unexpected grid type: {}", grid_type);
      }
    }

    if platform == "nonsteam" && name_id_map.contains_key(file_core){
      let shortcut_id_value: &Value = name_id_map.get(file_core).expect("Should have been able to get shortcut id from name map");
      file_core = shortcut_id_value.as_str().expect("Should have been able to convert shortcut name to id.");
    }

    let mut output_filename: String = String::from(file_core);
    output_filename.push_str(file_grid_type);
    output_filename.push_str(&file_ext);

    return (platform.to_owned(), String::from(file_core), output_filename);
  } else {
    let dot_index: usize = filename.find(".").expect("File should have had a file extension");
    let appid: &str = &filename[..dot_index];
    return (String::from(""), appid.to_owned(), filename.to_owned());
  }
}


/// Generates a Grids zip file export.
fn generate_grids_zip(app_handle: &AppHandle, grids_dir_path: PathBuf, zip_file_path: PathBuf, platform_id_map: &Map<String, Value>, id_name_map: &Map<String, Value>) -> bool {
  let grids_dir_contents = read_dir(grids_dir_path).unwrap();
  let zip_file: File = File::create(zip_file_path).expect("File's directory should have existed since user picked it.");
  let mut zip_writer: zip::ZipWriter<File> = zip::ZipWriter::new(zip_file);
  let _ = zip_writer.set_flush_on_finish_file(true);
  
  let entry_options = SimpleFileOptions::default().compression_method(zip::CompressionMethod::Stored);
  
  for dir_entry in grids_dir_contents {
    let entry = dir_entry.expect("Should have been able to get directory entry.");

    if !entry.file_type().unwrap().is_file() {
      logger::log_to_core_file(app_handle.to_owned(), format!("Grid entry {} is a directory, skipping...", entry.file_name().to_str().unwrap()).as_str(), 1);
      continue;
    }

    let contents: Vec<u8> = read(entry.path()).expect("Should have been able to read file, but couldn't.");
    let filename = entry.file_name();
    let filename_str: &str = filename.to_str().unwrap();
    let (id, grid_type) = get_id_from_grid_name(filename_str);
    
    if !platform_id_map.contains_key(&id) {
      logger::log_to_core_file(app_handle.to_owned(), format!("Grid entry {} is not in appids list, skipping...", entry.file_name().to_str().unwrap()).as_str(), 1);
      continue;
    }

    let platform_value: &Value = platform_id_map.get(&id).expect("Platform map should have contained game/shortcut id.");
    let platform: &str = platform_value.as_str().expect("Should have been able to convert platform to string.");

    let modified_filename = construct_grid_export_name(filename_str, &id, &grid_type, platform, id_name_map);
    let in_zip_filename = modified_filename;
    
    let _ = zip_writer.start_file(in_zip_filename, entry_options);
    let _ = zip_writer.write(&contents);

    logger::log_to_core_file(app_handle.to_owned(), format!("Wrote entry {} to zip.", entry.file_name().to_str().unwrap()).as_str(), 0);
  }

  let _ = zip_writer.finish();

  logger::log_to_core_file(app_handle.to_owned(), "Successfully wrote export zip.", 0);

  return true;
}

/// Sets the users grids from a Grids zip file.
fn set_grids_from_zip(app_handle: &AppHandle, grids_dir_path: PathBuf, zip_file_path: PathBuf, name_id_map: &Map<String, Value>) -> (bool, Map<String, Value>) {
  let mut icon_map: Map<String, Value> = Map::new();

  let zip_file = File::open(zip_file_path).expect("File should have existed since user picked it.");
  let buffer_reader = BufReader::new(zip_file);
  let mut zip_reader = zip::ZipArchive::new(buffer_reader).expect("Should have been able to create reader because file existed.");

  if zip_reader.is_empty() {
    logger::log_to_core_file(app_handle.to_owned(), "No entries in zip.", 0);
    return (false, icon_map);
  }

  for i in 0..zip_reader.len() {
    let mut zip_file = zip_reader.by_index(i).unwrap();

    if zip_file.is_file() {
      let mangled_name: PathBuf = zip_file.mangled_name();
      let (platform, appid, adjusted_file_name) = get_import_grid_name(app_handle, mangled_name.to_str().expect("Should have been able to convert pathbuf to string."), name_id_map);
      
      let dest_path = grids_dir_path.join(PathBuf::from(&adjusted_file_name));

      if platform == "nonsteam" && adjusted_file_name.contains("icon") {
        let dest_path_str: &str = dest_path.to_str().expect("Should have been able to convert dest path to string.");
        icon_map.insert(appid, Value::String(dest_path_str.to_owned()));
      }
      
      let mut outfile = File::create(&dest_path).unwrap();
      io::copy(&mut zip_file, &mut outfile).expect("Should have been able to write file.");
      logger::log_to_core_file(app_handle.to_owned(), format!("Wrote zip entry {}.", zip_file.name()).as_str(), 0);
    } else {
      logger::log_to_core_file(app_handle.to_owned(), format!("Zip entry {} is a directory, skipping...", zip_file.name()).as_str(), 1);
    }
  }

  return (true, icon_map);
}


#[tauri::command]
/// Exports the users grids to a Grids zip file.
pub async fn export_grids_to_zip(app_handle: AppHandle, steam_path: String, steam_active_user_id: String, platform_id_map: Map<String, Value>, id_name_map: Map<String, Value>) -> bool {
  let file_dialog = app_handle.dialog().file()
    .set_title("Save Grids Zip")
    .set_file_name("Steam_Grids_Export.zip")
    .add_filter("zip", &["zip"])
    .set_directory(home_dir().expect("Should have been able to get home dir for zip."));

  let file_path = file_dialog.blocking_save_file();

  if file_path.is_some() {
    let zip_path = file_path.unwrap();
    logger::log_to_core_file(app_handle.to_owned(), format!("Got save path: {}", zip_path.to_str().expect("Should have been able to convert path to string.")).as_str(), 0);

    let grids_dir_path = steam::get_grids_directory(app_handle.to_owned(), steam_path, steam_active_user_id);
    let succeeded = generate_grids_zip(&app_handle, PathBuf::from(grids_dir_path), zip_path, &platform_id_map, &id_name_map);

    if succeeded {
      logger::log_to_core_file(app_handle.to_owned(), "Successfully saved the user's grids.", 0);
      return true;
    }
    
    logger::log_to_core_file(app_handle.to_owned(), "Failed to save the user's grids.", 0);
    return false;
  }
  
  logger::log_to_core_file(app_handle.to_owned(), "No save location was chosen.", 0);
  return false;
}

#[tauri::command]
/// Sets the users grids from a Grids zip file.
pub async fn import_grids_from_zip(app_handle: AppHandle, steam_path: String, steam_active_user_id: String, name_id_map: Map<String, Value>) -> (bool, Map<String, Value>) {
  let file_dialog = app_handle.dialog().file()
    .set_title("Pick a Grids Zip")
    .add_filter("zip", &["zip"])
    .set_directory(home_dir().expect("Should have been able to get home dir for zip."));

  let file_path = file_dialog.blocking_pick_file();

  if file_path.is_some() {
    let zip_path = file_path.unwrap().path;
    logger::log_to_core_file(app_handle.to_owned(), format!("Got file path: {}", zip_path.to_str().expect("Should have been able to convert path to string.")).as_str(), 0);

    let grids_dir_path = steam::get_grids_directory(app_handle.to_owned(), steam_path, steam_active_user_id);
    let (success, icon_map) = set_grids_from_zip(&app_handle, PathBuf::from(grids_dir_path), zip_path, &name_id_map);

    if success {
      logger::log_to_core_file(app_handle.to_owned(), "Successfully set the user's grids.", 0);
      return (success, icon_map);
    }
    
    logger::log_to_core_file(app_handle.to_owned(), "Failed to set the user's grids.", 0);
    return (success, icon_map);
  }
  
  logger::log_to_core_file(app_handle.to_owned(), "No zip file was selected by user.", 0);
  return (false, Map::new());
}
