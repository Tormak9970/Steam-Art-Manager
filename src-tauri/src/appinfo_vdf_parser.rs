use std::{path::PathBuf, fs};
use std::io::Read;

use serde_json::{Value, Map};

use crate::reader::Reader;

pub fn open_appinfo_vdf(path: &PathBuf) -> Map<String, Value> {
  let mut file = fs::File::open(path).expect("Path should have existed.");

  let metadata = fs::metadata(path).expect("unable to read metadata");
  let mut buffer = vec![0; metadata.len() as usize];
  file.read(&mut buffer).expect("buffer overflow");
  
  let buf_slice = buffer.as_slice();
  let mut reader = Reader::new(buf_slice);

  return read(&mut reader);
}

fn read(reader: &mut Reader) -> Map<String, Value> {
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

  let entries: Vec<Value> = read_app_entries(reader, skip);

  let mut res: Map<String, Value> = Map::new();
  res.insert(String::from("entries"), Value::Array(entries));

  return res;
}

fn read_app_entries(reader: &mut Reader, skip: u8) -> Vec<Value> {
  let mut entries: Vec<Value> = vec![];
  let mut id: u32 = reader.read_uint32(true);

  while id != 0x00000000 {
    let entry: Map<String, Value> = read_app_entry(reader, id, skip);
    let entry_entries_val: &Value = entry.get("entries").expect("Entry should have contained entries.");
    let entry_entries: &Map<String, Value> = entry_entries_val.as_object().expect("Should have been able to convert entries to Map<String, Value>.");
  
    if entry_entries.contains_key("common") {
      let common_val: &Value = entry_entries.get("common").expect("Should have been able to get \"common\".");
      let common = common_val.as_object().expect("Common should have been an object.");
      
      let type_val: &Value = common.get("type").expect("Should have been able to get \"common\".\"type\".");
      let type_str: &str = type_val.as_str().expect("Should have been able to convert type to str");

      if type_str == "Game" {
        entries.push(Value::Object(entry));
      }
    }

    id = reader.read_uint32(true);
  }

  return entries;
}

fn read_app_entry(reader: &mut Reader, id: u32, skip: u8) -> Map<String, Value> {
  let mut props: Map<String, Value> = Map::new();
  reader.seek(skip.into(), 1); // Skip a bunch of fields we don't care about
  
  let name: String = reader.read_string(None).to_owned();
  let entries: Map<String, Value> = read_entries(reader, true);
  
  props.insert(String::from("name"), Value::String(name));
  props.insert(String::from("id"), Value::Number(id.into()));

  // if vdf_common.is_some() {
  //   entries.insert("common".to_owned(), vdf_common.unwrap());
  // }

  props.insert(String::from("entries"), Value::Object(entries));


  return props;
}

fn read_entries(reader: &mut Reader, should_read_last: bool) -> Map<String, Value> {
  let mut props: Map<String, Value> = Map::new();

  let mut data_type = reader.read_uint8(true);
  while data_type != 0x08 {
    let (key, val) = read_entry(reader, data_type);

    props.insert(key, val);

    data_type = reader.read_uint8(true);
  }

  if should_read_last {
    reader.seek(1, 1);
  }

  return props;
}

fn read_entry(reader: &mut Reader, data_type: u8) -> (String, Value) {
  let key: String = reader.read_string(None).to_owned();
  
  match data_type {
    0x00 => {
      let entries: Map<String, Value> = read_entries(reader, false);
      // TODO: will filter this once everything works
      // if key == "common" {
      //   let vdf_common = entries.unwrap();
      //   return (key, Some(format!("{}||{}", vdf_common.name, vdf_common.r#type)));
      // } else {
      //   return (key, None);
      // }
      return (key, Value::Object(entries));
    },
    0x01 => {
      return (key, Value::String(reader.read_string(None).to_owned()));
    },
    0x02 => {
      // TODO: will ignore this once everything works
      return (key, Value::Number(reader.read_uint32(true).into()));
    },
    _ => {
      panic!("Unhandled entry type: {}", data_type);
    }
  }
}