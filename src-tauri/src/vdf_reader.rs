use serde_json::{Value, Map};

use crate::reader::Reader;

pub fn read_entry_map(reader: &mut Reader) -> Map<String, Value> {
  let mut props = Map::new();

  let mut field_type = reader.read_uint8(true);

  while field_type != 0x08 {
    let key = reader.read_string(None);
    let value = read_entry_field(reader, field_type);

    props.insert(key, value);

    field_type = reader.read_uint8(true);
  }

  return props;
}

pub fn read_entry_field(reader: &mut Reader, field_type: u8) -> Value {
  match field_type {
    0x00 => { //? map
      return Value::Object(read_entry_map(reader));
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