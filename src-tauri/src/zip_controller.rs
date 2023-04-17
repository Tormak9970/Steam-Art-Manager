use crate::logger;

use std::{path::PathBuf, io::{BufReader, self, Write}, fs::{File, read_dir, read}};

use serde_json::{Map, Value};
use tauri::AppHandle;
use zip;

fn get_id_from_grid_name(grid_name: &str) -> (String, String) {
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
    return (name.to_owned(), "widecapsule".to_owned());
  }
}

fn construct_grid_export_name(filename: &str, id: &String, grid_type: &String, platform: &str, shortcuts_name_map: &Map<String, Value>) -> String {
  let dot_index: usize = filename.find(".").expect("File should have had a file extension");
  let file_ext: &str = &filename[dot_index..];

  let mut filename_core: String = id.to_owned();

  if platform == "nonsteam" && shortcuts_name_map.contains_key(id) {
    let shortcut_name_value: &Value = shortcuts_name_map.get(id).expect("Shortcut name map should have contained shortcut id.");
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

#[allow(unused)]
pub fn generate_grids_zip(app_handle: &AppHandle, grids_dir_path: PathBuf, zip_file_path: PathBuf, platform_id_map: &Map<String, Value>, shortcuts_name_map: &Map<String, Value>) -> bool {
  let grids_dir_contents = read_dir(grids_dir_path).unwrap();
  let zip_file: File = File::create(zip_file_path).expect("File's directory should have existed since user picked it.");
  let mut zip_writer: zip::ZipWriter<File> = zip::ZipWriter::new(zip_file);
  
  let entry_options = zip::write::FileOptions::default().compression_method(zip::CompressionMethod::Stored);
  
  for dir_entry in grids_dir_contents {
    let entry = dir_entry.expect("Should have been able to get directory entry.");

    if entry.file_type().unwrap().is_file() {
      let contents: Vec<u8> = read(entry.path()).expect("Should have been able to read file, but couldn't.");
      let filename = entry.file_name();
      let filename_str: &str = filename.to_str().unwrap();
      let mut in_zip_filename: String = String::from(filename_str);
      let (id, grid_type) = get_id_from_grid_name(filename_str);
      
      if platform_id_map.contains_key(&id) {
        let platform_value: &Value = platform_id_map.get(&id).expect("Platform map should have contained game/shortcut id.");
        let platform: &str = platform_value.as_str().expect("Should have been able to convert platform to string.");

        let modified_filename = construct_grid_export_name(filename_str, &id, &grid_type, platform, shortcuts_name_map);
        println!("Modified filename: {}", modified_filename);
        in_zip_filename = modified_filename;
      }

      zip_writer.start_file(in_zip_filename, entry_options);
      zip_writer.write(&contents);
      logger::log_to_file(app_handle.to_owned(), format!("Wrote entry {} to zip.", entry.file_name().to_str().unwrap()).as_str(), 0);
    } else {
      logger::log_to_file(app_handle.to_owned(), format!("Zip entry {} is a directory, skipping...", entry.file_name().to_str().unwrap()).as_str(), 1);
    }
  }

  zip_writer.finish();
  logger::log_to_file(app_handle.to_owned(), "Successfully wrote export zip.", 0);
  return true;
}

pub fn set_grids_from_zip(app_handle: &AppHandle, grids_dir_path: PathBuf, zip_file_path: PathBuf, shortcuts_id_map: &Map<String, Value>) -> bool {
  let zip_file = File::open(zip_file_path).expect("File should have existed since user picked it.");
  let buffer_reader = BufReader::new(zip_file);
  let mut zip_reader = zip::ZipArchive::new(buffer_reader).expect("Should have been able to create reader because file existed.");

  if zip_reader.is_empty() {
    logger::log_to_file(app_handle.to_owned(), "No entries in zip.", 0);
    return false;
  }

  for i in 0..zip_reader.len() {
    let mut zip_file = zip_reader.by_index(i).unwrap();

    if zip_file.is_file() {
      let dest_path = grids_dir_path.join(zip_file.mangled_name());
      
      let mut outfile = File::create(&dest_path).unwrap();
      io::copy(&mut zip_file, &mut outfile).expect("Should have been able to write file.");
      logger::log_to_file(app_handle.to_owned(), format!("Wrote zip entry {}.", zip_file.name()).as_str(), 0);
    } else {
      logger::log_to_file(app_handle.to_owned(), format!("Zip entry {} is a directory, skipping...", zip_file.name()).as_str(), 1);
    }
  }

  return true;
}