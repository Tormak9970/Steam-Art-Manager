use std::{ path::PathBuf, fs };
use std::io::{Read, Write};

use serde_json::{ Value, Map };

use crate::reader::Reader;
use crate::writer::Writer;

pub fn open_shortcuts_vdf(path: &PathBuf) -> Value {
  let mut file = fs::File::open(path).expect("Path should have existed.");

  let metadata = fs::metadata(path).expect("unable to read metadata");
  let mut buffer = vec![0; metadata.len() as usize];
  file.read(&mut buffer).expect("buffer overflow");
  
  let buf_slice = buffer.as_slice();
  let mut reader = Reader::new(buf_slice);

  return read(&mut reader);
}

fn read(reader: &mut Reader) -> Value {
  reader.seek(1, 0);

  let fake_header = reader.read_string(None);

  if fake_header != "shortcuts".to_owned() {
    panic!("Invalid Shortcuts File! File started with {} instead of \"shortcuts\"", fake_header);
  }

  return read_entry_map(reader);
}

fn read_entry_map(reader: &mut Reader) -> Value {
  let mut props = Map::new();

  let mut field_type = reader.read_uint8(true);

  while field_type != 0x08 {
    let key = reader.read_string(None);
    let value = read_entry_field(reader, field_type);

    props.insert(key, value);

    field_type = reader.read_uint8(true);
  }

  return Value::Object(props);
}

fn read_entry_field(reader: &mut Reader, field_type: u8) -> Value {
  match field_type {
    0x00 => { //? map
      return read_entry_map(reader);
    },
    0x01 => { //? string
      let value = reader.read_string(None);
      return Value::String(value);
    },
    0x02 => { //? number
      let value = reader.read_uint32(true);
      return Value::Number(value.into());
    },
    _ => {
      panic!("Unexpected field type {}!", field_type);
    }
  }
}

pub fn write_shortcuts_vdf(path: &PathBuf, data: Value) -> bool {
  if data.is_object() {
    let shortcuts = data.as_object().expect("Should have been able to convert to an object.");
    
    let mut buffer: Vec<u8> = vec![0; 1000];
    let mut writer: Writer = Writer::new(&mut buffer);
    
    write_entry_map(&mut writer, shortcuts);

    writer.trim();

    let mut file = fs::File::create(path).expect("Should have been able to create file or truncate if existed.");
    let write_res = file.write_all(&buffer[..]);

    if write_res.is_err() {
      let err = write_res.err().unwrap();
      panic!("Error writing shortcuts: {}", err);
    }

    return true;
  } else {
    panic!("Error writing shortcuts: data was not an object!");
  }
}

fn write_entry_map(writer: &mut Writer, map: &Map<String, Value>) {
  for (key, val) in map.into_iter() {
    write_entry_field(writer, key, val);
  }
  
  writer.write_uint8(0x08, true);
}

fn write_entry_field(writer: &mut Writer, key: &String, field: &Value) {
  let key_owned: String = key.to_owned();

  if field.is_number() {
    writer.write_uint8(0x02, true);
    writer.write_string(key_owned, false, true);

    let number: u64 = field.as_u64().expect("Should have been able to convert to a number.");
    writer.write_uint32(number as u32, true);
  } else if field.is_string() {
    writer.write_uint8(0x01, true);
    writer.write_string(key_owned, false, true);

    let string: &str = field.as_str().expect("Should have been able to convert to a string.");
    writer.write_string(string.to_owned(), false, true);
  } else if field.is_object() {
    writer.write_uint8(0x00, true);
    writer.write_string(key_owned, false, true);

    let field_map = field.as_object().expect("Should have been able to convert to an object.");
    write_entry_map(writer, field_map);
  } else {
    panic!("Value was not an object, number or string!");
  }
}