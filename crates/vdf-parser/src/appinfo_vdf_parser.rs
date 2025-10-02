use std::i64;
use std::{path::PathBuf, fs};
use std::io::Read;

use serde_json::{Value, Map};
use rayon::iter::{IntoParallelRefIterator, ParallelIterator};

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
  let mut strings: Vec<String> = vec![];

  if magic == 0x07564429 {
    let string_table_offset = reader.read_int64(true);
    let data_offset = reader.get_offset();
    
    reader.seek(string_table_offset.try_into().expect("String table offset couldn't be converted to usize"), 0);

    let string_count = reader.read_uint32(true);
    
    for _i in 0..string_count {
      let string = reader.read_string(None);

      strings.push(string);
    }
    
    reader.seek(data_offset, 0);
    
    entries = read_app_sections(reader, string_table_offset, Some(magic), &Some(&mut strings));
  } else if magic == 0x07564428 {
    entries = read_app_sections(reader, i64::MAX, None, &None);
  } else {
    panic!("Magic header is unknown. Expected 0x07564428 or 0x07564429 but got {magic}");
  }

  let mut res: Map<String, Value> = Map::new();
  res.insert(String::from("entries"), Value::Array(entries));

  return res;
}

struct AppInfoChunk {
  pub offset: usize,
  pub length: usize,
}

/// Reads the appinfo.vdf app sections to a JSON array.
fn read_app_sections(reader: &mut Reader, string_table_offset: i64, magic: Option<u32>, strings: &Option<&mut Vec<String>>) -> Vec<Value> {
  let mut id: u32 = reader.read_uint32(true);

  let eof: usize = (string_table_offset - 4).try_into().unwrap();

  let mut chunks: Vec<AppInfoChunk> = vec![];

  while id != 0x00000000 && reader.get_offset() < eof {
    let chunk_size = reader.read_uint32(true);
    let offset = reader.get_offset();

    let chunk_length: usize = chunk_size.try_into().unwrap();
    
    chunks.push(AppInfoChunk { offset, length: chunk_length });

    reader.seek(offset + chunk_length, 0);
    id = reader.read_uint32(true);
  }

  let entries: Vec<Value> = chunks.par_iter().filter_map(| chunk | {
    let mut chunk_reader = reader.slice(chunk.offset, chunk.length);

    // let _state = chunk_reader.read_uint32(true);
    // let _last_updated = chunk_reader.read_uint32(true);
    // let _access_token = chunk_reader.read_uint64(true);
    // chunk_reader.seek(20, 1);
    // let _version_number = chunk_reader.read_uint32(true);
    // chunk_reader.seek(20, 1);
    chunk_reader.seek(60, 1);

    let mut entry: Map<String, Value> = read_entry_map(&mut chunk_reader, magic, strings);

    if entry.contains_key("appinfo") {
      let appinfo_val: &Value = entry.get("appinfo").expect("Should have been able to get \"appinfo\".");
      let appinfo = appinfo_val.as_object().expect("appinfo should have been an object.");
      
      entry = appinfo.clone();
    }

    if entry.contains_key("common") {
      let common_val: &Value = entry.get("common").expect("Should have been able to get \"common\".");
      let common = common_val.as_object().expect("Common should have been an object.");
      
      let type_val: &Value = common.get("type").expect("Should have been able to get \"common\".\"type\".");
      let type_str: &str = type_val.as_str().expect("Should have been able to convert type to str");

      if type_str == "Game" || type_str == "game" {
        return Some(Value::Object(entry));
      }
    }

    return None;
  }).collect();

  return entries;
}