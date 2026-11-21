use rayon::prelude::*;
use serde_json::{Map, Value};
use std::{
    fs,
    panic::{catch_unwind, AssertUnwindSafe},
    path::{Path, PathBuf},
};

use super::vdf_reader::read_entry_map;
use crate::reader::Reader;

const SHARD_MAGIC: u32 = 0x0756_442a;
const STRING_TABLE_MAGIC: u32 = 0x0756_4429;
const HEADER_LEN: usize = 44;
const SHA1_LEN: usize = 20;
const LITTLE_ENDIAN: bool = true;

const OFFSET_MAGIC: usize = 0;
const OFFSET_APP_COUNT: usize = 16;
const OFFSET_INDEX_LEN: usize = 20;
const OFFSET_KEY_COUNT: usize = 24;
const OFFSET_KEY_TABLE_LEN: usize = 28;

fn parse_shard(shard_buffer: &[u8], filter_only_games: bool) -> Result<Vec<Value>, String> {
    if shard_buffer.len() < HEADER_LEN {
        return Err("file shorter than header".into());
    }

    let mut header = Reader::new(shard_buffer);
    let mut header_u32 = |offset: usize| {
        header.seek(offset, 0);
        header.read_uint32(LITTLE_ENDIAN)
    };

    let magic = header_u32(OFFSET_MAGIC);
    if magic != SHARD_MAGIC {
        return Err(format!("bad magic 0x{magic:08x}"));
    }

    let app_count = header_u32(OFFSET_APP_COUNT) as usize;
    let index_len = header_u32(OFFSET_INDEX_LEN) as usize;
    let key_count = header_u32(OFFSET_KEY_COUNT) as usize;
    let key_table_len = header_u32(OFFSET_KEY_TABLE_LEN) as usize;

    let keys_start = HEADER_LEN.checked_add(index_len);
    let payload_start = keys_start.and_then(|k| k.checked_add(key_table_len));
    let (keys_start, payload_start) = match (keys_start, payload_start) {
        (Some(key), Some(payload))
            if payload <= shard_buffer.len() && (app_count == 0 || index_len / app_count >= 16) =>
        {
            (key, payload)
        }
        _ => {
            return Err(format!(
                "header layout looks wrong (apps={app_count}, index_len={index_len}, key_table_len={key_table_len}, file_len={})",
                shard_buffer.len()
            ))
        }
    };

    let root = Reader::new(shard_buffer);
    let mut index = root.slice(HEADER_LEN, index_len);
    let mut key_table = root.slice(keys_start, key_table_len);
    let payload = root.slice(payload_start, shard_buffer.len() - payload_start);

    let mut keys: Vec<String> = (0..key_count)
        .map(|_| key_table.read_string(None))
        .collect();

    let strings: Option<&mut Vec<String>> = Some(&mut keys);

    let mut entries = Vec::with_capacity(app_count);
    let mut pos = 0usize;

    for _ in 0..app_count {
        if (pos + 16) as u64 > index.get_length() {
            return Err(format!("index truncated at byte {pos}"));
        }

        index.seek(pos, 0);

        let appid = index.read_uint32(LITTLE_ENDIAN);
        let offset = index.read_uint32(LITTLE_ENDIAN) as usize;
        let len = index.read_uint32(LITTLE_ENDIAN) as usize;
        let body_len = index.read_uint32(LITTLE_ENDIAN) as usize;

        pos += 16 + body_len;
        if pos as u64 > index.get_length() {
            return Err(format!("app {appid}: record runs past end of index"));
        }

        let in_bounds = offset
            .checked_add(len)
            .map_or(false, |end| end as u64 <= payload.get_length());
        if !in_bounds || len < SHA1_LEN {
            return Err(format!(
                "app {appid}: bad payload range (offset={offset}, len={len})"
            ));
        }

        let mut reader = payload.slice(offset, len);
        reader.seek(SHA1_LEN, 1);

        let mut entry = read_entry_map(&mut reader, Some(STRING_TABLE_MAGIC), &strings);

        if let Some(Value::Object(inner)) = entry.get("appinfo").cloned() {
            entry = inner;
        }

        entry.entry("appid").or_insert(Value::from(appid));

        let is_game = entry
            .get("common")
            .and_then(|c| c.get("type"))
            .and_then(|t| t.as_str())
            .map_or(false, |t| t.eq_ignore_ascii_case("game"));

        if filter_only_games && !is_game {
            continue;
        }

        entries.push(Value::Object(entry));
    }

    if pos != index_len {
        return Err(format!(
            "index length mismatch: walked {pos} of {index_len} bytes"
        ));
    }

    Ok(entries)
}

/// Reads every appinfo_XX.vdf in `appcache/appinfo/`, the new Beta format as of 11.21.2026.
pub fn read_appinfo_shards(
    path: &Path,
    filter: Option<bool>,
) -> Result<Map<String, Value>, String> {
    let filter_only_games = filter.unwrap_or(true);

    let mut paths: Vec<PathBuf> = fs::read_dir(path)
        .map_err(|e| format!("{}: {e}", path.display()))?
        .filter_map(|e| e.ok().map(|e| e.path()))
        .filter(|p| {
            p.file_name()
                .and_then(|n| n.to_str())
                .map_or(false, |n| n.starts_with("appinfo_") && n.ends_with(".vdf"))
        })
        .collect();

    paths.sort();

    let shards: Vec<Vec<Value>> = paths
        .par_iter()
        .map(|path| {
            let shard_buffer = fs::read(path).map_err(|e| format!("{}: {e}", path.display()))?;

            let parsed = catch_unwind(AssertUnwindSafe(|| {
                parse_shard(&shard_buffer, filter_only_games)
            }))
            .map_err(|_| {
                format!(
                    "{}: parser panicked (unexpected data layout)",
                    path.display()
                )
            })?;

            return parsed.map_err(|e| format!("{}: {e}", path.display()));
        })
        .collect::<Result<Vec<Vec<Value>>, String>>()?;

    let mut res = Map::new();
    res.insert(
        "entries".to_string(),
        Value::Array(shards.into_iter().flatten().collect()),
    );

    return Ok(res);
}
