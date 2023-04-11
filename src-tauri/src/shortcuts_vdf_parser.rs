use std::{path::PathBuf, fs};
use std::io::Read;

use serde_json::{Value, Map};

use crate::reader::Reader;

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