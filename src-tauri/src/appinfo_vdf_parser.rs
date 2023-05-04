use std::{path::PathBuf, fs};
use std::io::Read;

use serde_json::{Value, Map};

use crate::reader::Reader;
use crate::vdf_reader::read_entry_map;

/// Opens the appinfo.vdf file and returns the values as JSON.
pub fn open_appinfo_vdf(path: &PathBuf) -> Map<String, Value> {
  let mut file = fs::File::open(path).expect("Path should have existed.");

  let metadata = fs::metadata(path).expect("unable to read metadata");
  let mut buffer = vec![0; metadata.len() as usize];
  file.read(&mut buffer).expect("buffer overflow");
  
  let buf_slice = buffer.as_slice();
  let mut reader = Reader::new(buf_slice);

  return read(&mut reader);
}

/// Reads the appinfo.vdf file and returns the values as JSON.
fn read(reader: &mut Reader) -> Map<String, Value> {
  let magic = reader.read_uint32(true);
  let _universe = reader.read_uint32(true); //always 1

  let entries: Vec<Value>;

  if magic == 0x07564428 {
    entries = read_app_sections(reader, 64);
  } else if magic == 0x07564427 {
    entries = read_app_sections(reader, 44);
  } else {
    panic!("Magic header is unknown. Expected 0x07564428 or 0x07564427 but got {magic}");
  }

  let mut res: Map<String, Value> = Map::new();
  res.insert(String::from("entries"), Value::Array(entries));

  return res;
}

/// Reads the appinfo.vdf app sections to a JSON array.
fn read_app_sections(reader: &mut Reader, skip: u8) -> Vec<Value> {
  let mut entries: Vec<Value> = vec![];
  let mut id: u32 = reader.read_uint32(true);

  while id != 0x00000000 {
    reader.seek(skip.into(), 1); // Skip a bunch of fields we don't care about

    let _null_prefix = reader.read_uint8(true);
    let name: String = reader.read_string(None).to_owned();

    let mut entry: Map<String, Value> = read_entry_map(reader);
    entry.insert(String::from("name"), Value::String(name));
    entry.insert(String::from("id"), Value::Number(id.into()));
  
    if entry.contains_key("common") {
      let common_val: &Value = entry.get("common").expect("Should have been able to get \"common\".");
      let common = common_val.as_object().expect("Common should have been an object.");
      
      let type_val: &Value = common.get("type").expect("Should have been able to get \"common\".\"type\".");
      let type_str: &str = type_val.as_str().expect("Should have been able to convert type to str");

      if type_str == "Game" || type_str == "game" {
        entries.push(Value::Object(entry));
      }
    }

    reader.seek(1, 1);
    id = reader.read_uint32(true);
  }

  return entries;
}