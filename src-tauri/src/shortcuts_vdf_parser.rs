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

pub fn open_shortcuts_vdf(path: &PathBuf) -> Vdf {
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