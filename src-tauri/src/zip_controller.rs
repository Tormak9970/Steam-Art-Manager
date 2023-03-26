use crate::logger;

use std::{path::PathBuf, io::{BufReader, self, Write}, fs::{File, read_dir, read}};

use tauri::AppHandle;
use zip;

pub fn generate_grids_zip(app_handle: &AppHandle, grids_dir_path: PathBuf, zip_file_path: PathBuf) -> bool {
  let grids_dir_contents = read_dir(grids_dir_path).unwrap();
  let zip_file = File::create(zip_file_path).expect("File's directory should have existed since user picked it.");
  let mut zip_writer = zip::ZipWriter::new(zip_file);
  
  let entry_options = zip::write::FileOptions::default().compression_method(zip::CompressionMethod::Stored);
  
  for dir_entry in grids_dir_contents {
    let entry = dir_entry.expect("Should have been able to get directory entry.");

    if entry.file_type().unwrap().is_file() {
      let name = entry.file_name().to_str().unwrap();
      let contents = read(entry.path()).expect("Should have been able to read file, but couldn't.");

      zip_writer.start_file(name, entry_options);
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

pub fn set_grids_from_zip(app_handle: &AppHandle, grids_dir_path: PathBuf, zip_file_path: PathBuf) -> bool {
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