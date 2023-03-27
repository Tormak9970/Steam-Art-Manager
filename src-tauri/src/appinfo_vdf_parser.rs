use std::collections::HashMap;
use std::{path::PathBuf, fs};
use std::io::Read;

use serde::{Serialize, Deserialize};

use crate::reader::Reader;

#[derive(Serialize, Deserialize, Debug, PartialEq)]
pub struct VdfCommon {
  r#type: String,
  name: String,
}

#[derive(Serialize, Deserialize, Debug, PartialEq)]
pub struct VdfEntry {
  name: String,
  id: u32,
  entries: HashMap<String, VdfCommon>
}

#[derive(Serialize, Deserialize, Debug, PartialEq)]
pub struct Vdf {
  entries: Vec<VdfEntry>,
}

pub fn read_vdf(path: &PathBuf) -> Vdf {
  let mut file = fs::File::open(path).expect("Path should have existed.");

  let metadata = fs::metadata(path).expect("unable to read metadata");
  let mut buffer = vec![0; metadata.len() as usize];
  file.read(&mut buffer).expect("buffer overflow");
  
  let buf_slice = buffer.as_slice();
  let mut reader = Reader::new(buf_slice);

  return read(&mut reader);
}

fn read(reader: &mut Reader) -> Vdf {
  reader.seek(1, 0);

  let sig_a = reader.read_uint8(true);
  let sig_b = reader.read_uint8(true);
  if sig_a != 0x44 || sig_b != 0x56 {
    panic!("Invalid File Signature {sig_a} {sig_b}");
  }

  reader.seek(0, 0);

  let skip;
  let magic = reader.read_uint32(true);

  if magic == 0x07564428 {
    skip = 65;
  } else if magic == 0x07564427 {
    skip = 45;
  } else {
    panic!("Magic header is unknown");
  }

  reader.seek(8, 0);

  let entries = read_app_entries(reader, skip);

  return Vdf { entries };
}

fn read_app_entries(reader: &mut Reader, skip: u8) -> Vec<VdfEntry> {
  let mut entries = vec![];
  let mut id = reader.read_uint32(true);

  while id != 0x00000000 {
    let entry = read_app_entry(reader, id, skip);
  
    if entry.entries.contains_key("common") {
      if entry.entries.get("common").unwrap().r#type == "game" || entry.entries.get("common").unwrap().r#type == "Game" {
        entries.push(entry);
      }
    }

    id = reader.read_uint32(true);
  }

  return entries;
}

fn read_app_entry(reader: &mut Reader, id: u32, skip: u8) -> VdfEntry {
  reader.seek(skip.into(), 1); // Skip a bunch of fields we don't care about
  
  let name = reader.read_string(None).to_owned();
  let vdf_common = read_entries(reader, true);
  let mut entries = HashMap::new();

  if vdf_common.is_some() {
    entries.insert("common".to_owned(), vdf_common.unwrap());
  }

  return VdfEntry { name, id, entries };
}

fn read_entries(reader: &mut Reader, should_read_last: bool) -> Option<VdfCommon> {
  let mut name: String = String::from("");
  let mut r#type: String = String::from("");

  let mut data_type = reader.read_uint8(true);
  while data_type != 0x08 {
    let (key, val) = read_entry(reader, data_type);

    if key == "name".to_owned() {
      name = val.unwrap();
    } else if key == "type".to_owned() {
      r#type = val.unwrap();
    } else if key == "common".to_owned() {
      let unwrapped = val.unwrap();
      let vals: Vec<&str> = unwrapped.split("||").collect();
      name = vals[0].to_owned();
      r#type = vals[1].to_owned();
    }

    data_type = reader.read_uint8(true);
  }

  if should_read_last {
    reader.seek(1, 1);
  }

  if name != "".to_owned() && r#type != "".to_owned() {
    return Some(VdfCommon { name, r#type });
  } else {
    return None;
  }
}

fn read_entry(reader: &mut Reader, data_type: u8) -> (String, Option<String>) {
  let key = reader.read_string(None).to_owned();
  
  match data_type {
    0x00 => {
      let entries = read_entries(reader, false);
      if key == "common" && entries.is_some() {
        let vdf_common = entries.unwrap();
        return (key, Some(format!("{}||{}", vdf_common.name, vdf_common.r#type)));
      } else {
        return (key, None);
      }
    },
    0x01 => {
      return (key, Some(reader.read_string(None).to_owned()));
    },
    0x02 => {
      _ = reader.read_uint32(true);
      return (key, None);
    },
    _ => {
      panic!("Unhandled entry type: {}", data_type);
    }
  }
}