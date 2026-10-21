use super::file_paths::{
    get_appinfo_path, get_libraryfolders_path, get_localconfig_path, get_shortcuts_path,
};
use crate::logger;
use new_vdf_parser::appinfo_vdf_parser::open_appinfo_vdf;
use new_vdf_parser::shortcuts_vdf_parser::open_shortcuts_vdf;
use steam_vdf_parser::parse_text;

use std::fs;
use std::path::PathBuf;

use keyvalues_parser::{Vdf, parse};
use serde_json::{Map, Value};

use tauri::AppHandle;

/// Reads a steam user's id.
fn read_steam_user_id(user_block: &str) -> String {
    let quote_index = user_block
        .find("\"")
        .expect("Should have been able to find a quote.");
    let id_str = &user_block[..quote_index];
    return id_str.to_owned();
}

/// Reads a steam user.
fn read_steam_user(user_id: &str, user_block: &str) -> Map<String, Value> {
    let id_32 = user_id.parse::<u64>().unwrap() - 76561197960265728;

    let mut steam_user: Map<String, Value> = Map::new();
    steam_user.insert("id64".to_owned(), Value::String(user_id.to_owned()));
    steam_user.insert("id32".to_owned(), Value::String(id_32.to_string()));

    let prop_start_matches: Vec<(usize, &str)> = user_block.match_indices("\n\t").collect();
    let len = prop_start_matches.len();

    for (vec_index, (index, _)) in prop_start_matches.clone().into_iter().enumerate() {
        if vec_index < len - 1 {
            let next_prop_start = prop_start_matches[vec_index + 1].0;
            let prop_line = &user_block[(index + 4)..(next_prop_start - 1)];

            let segments: Vec<&str> = prop_line.split("\"\t\t\"").collect();
            let key = segments[0].to_owned();
            let value = segments[1].to_owned();

            steam_user.insert(key, Value::String(value));
        }
    }

    return steam_user;
}

/// Reads the steam users.
fn read_steam_users(steam_path: String) -> Map<String, Value> {
    let mut steam_users: Map<String, Value> = Map::new();

    let steam_root: PathBuf = PathBuf::from(steam_path);

    let loginusers_vdf: PathBuf = steam_root.join("config/loginusers.vdf");
    let contents: String = fs::read_to_string(loginusers_vdf).unwrap();

    let id_start_matches: Vec<(usize, &str)> = contents.match_indices("\n\t\"").collect();
    let block_end_matches: Vec<(usize, &str)> = contents.match_indices("}").collect();

    for (vec_index, (index, _)) in id_start_matches.iter().enumerate() {
        let close_brace_index: usize = block_end_matches[vec_index].0;
        let user_block: String = contents[(*index + 3)..close_brace_index].to_owned();

        let id: String = read_steam_user_id(&user_block);

        let user_map: Map<String, Value> = read_steam_user(&id, &user_block[(id.len() + 4)..]);

        steam_users.insert(id.to_string(), Value::Object(user_map));
    }

    return steam_users;
}

#[tauri::command]
/// Gets all steam users that have logged in on this computer.
pub fn get_steam_users(app_handle: AppHandle, steam_path: String) -> String {
    logger::log_core(
        &app_handle,
        "Checking config/loginusers.vdf for current user info.",
        0,
    );

    let steam_users = read_steam_users(steam_path);

    logger::log_core(
        &app_handle,
        format!("Loaded {} steam users.", steam_users.len()).as_str(),
        0,
    );

    return serde_json::to_string(&steam_users).unwrap();
}

#[tauri::command]
/// Reads the user's appinfo.vdf file.
pub async fn read_appinfo_vdf(app_handle: AppHandle, steam_path: String) -> String {
    let appinfo_path: PathBuf = PathBuf::from(get_appinfo_path(&app_handle, steam_path));
    let appinfo_vdf: Map<String, Value> = open_appinfo_vdf(&appinfo_path, Some(false));
    return serde_json::to_string(&appinfo_vdf)
        .expect("Should have been able to serialize AppInfo vdf to string.");
}

#[tauri::command]
/// Reads the user's shortcuts.vdf file.
pub async fn read_shortcuts_vdf(
    app_handle: AppHandle,
    steam_path: String,
    steam_active_user_id: String,
) -> String {
    let shortcuts_path = PathBuf::from(get_shortcuts_path(
        &app_handle,
        steam_path,
        steam_active_user_id,
    ));

    if shortcuts_path.as_path().exists() {
        logger::log_core(&app_handle, "shortcuts.vdf exists, reading...", 0);
        let shortcuts_array = open_shortcuts_vdf(&shortcuts_path);
        return serde_json::to_string(&shortcuts_array)
            .expect("Should have been able to serialize Shortcuts vdf to string.");
    } else {
        logger::log_core(&app_handle, "shortcuts.vdf does not exist.", 0);
        return "{}".to_owned();
    }
}

fn get_apps_dict_from_vdf(vdf: steam_vdf_parser::Vdf<'_>) -> Option<steam_vdf_parser::Obj<'_>> {
    let mut software_dict_res = vdf.get_obj(&["Software"]);
    if software_dict_res.is_none() {
        software_dict_res = vdf.get_obj(&["software"]);
        if software_dict_res.is_none() {
            return None;
        }
    }

    let software_dict = software_dict_res.expect("Software key was some, should have been fine.");

    let mut valve_dict_res = software_dict.get("Valve");
    if valve_dict_res.is_none() {
        valve_dict_res = software_dict.get("valve");
        if valve_dict_res.is_none() {
            return None;
        }
    }

    let valve_dict = valve_dict_res.expect("Valve key was some, should have been fine.");

    let mut steam_dict_res = valve_dict.get("Steam");
    if steam_dict_res.is_none() {
        steam_dict_res = valve_dict.get("steam");
        if steam_dict_res.is_none() {
            return None;
        }
    }

    let steam_dict = steam_dict_res.expect("Steam key was some, should have been fine.");

    let mut apps_dict_res = steam_dict.get("Apps");
    if apps_dict_res.is_none() {
        apps_dict_res = steam_dict.get("apps");
        if apps_dict_res.is_none() {
            return None;
        }
    }

    let apps_dict = apps_dict_res.expect("Apps key was some, should have been fine.");
    let owned = apps_dict
        .as_obj()
        .expect("Should have been able to get apps as obj.");

    return Some(owned.clone());
}

#[tauri::command]
/// Reads the user's localconfig.vdf file.
pub async fn read_localconfig_vdf(
    app_handle: AppHandle,
    steam_path: String,
    steam_active_user_id: String,
) -> String {
    let localconfig_path = PathBuf::from(get_localconfig_path(
        &app_handle,
        steam_path,
        steam_active_user_id,
    ));

    if localconfig_path.as_path().exists() {
        logger::log_core(&app_handle, "localconfig.vdf exists, reading...", 0);
        let localconfig_contents: String = fs::read_to_string(localconfig_path)
            .expect("localconfig.vdf should have existed.")
            .parse()
            .expect("File should have been a text file.");

        let mut data: Map<String, Value> = Map::new();

        let vdf =
            parse_text(&localconfig_contents).expect("localconfig VDF should have been parsable.");

        // Path-based access
        let apps_dict = get_apps_dict_from_vdf(vdf).expect("localconfig VDF should have had apps");

        for (key, value) in apps_dict.iter() {
            let mut map_value = Map::new();

            let last_played_res = value.get_str(&["LastPlayed"]);
            if last_played_res.is_some() {
                let last_played = last_played_res.unwrap();
                map_value.insert(
                    String::from("lastPlayed"),
                    Value::String(last_played.to_owned()),
                );
            }

            let playtime_res = value.get_str(&["Playtime"]);
            if playtime_res.is_some() {
                let playtime = playtime_res.unwrap();
                map_value.insert(String::from("playtime"), Value::String(playtime.to_owned()));
            }

            data.insert(String::from(key.clone()), Value::Object(map_value));
        }

        return serde_json::to_string(&data)
            .expect("Should have been able to serialize localconfig vdf to string.");
    } else {
        logger::log_core(&app_handle, "localconfig.vdf does not exist.", 0);
        return "{}".to_owned();
    }
}

#[tauri::command]
/// Reads the user's localconfig.vdf file.
pub async fn get_installed_appids(app_handle: AppHandle, steam_path: String) -> String {
    let libraryfolders_path = PathBuf::from(get_libraryfolders_path(&app_handle, steam_path));

    if libraryfolders_path.as_path().exists() {
        logger::log_core(&app_handle, "libraryfolders.vdf exists, reading...", 0);
        let libraryfolders_contents: String = fs::read_to_string(libraryfolders_path)
            .expect("libraryfolders.vdf should have existed.")
            .parse()
            .expect("File should have been a text file.");

        let mut appids: Vec<String> = Vec::new();

        let vdf = parse(&libraryfolders_contents)
            .map(Vdf::from)
            .expect("libraryfolders.vdf should have been parsable.");

        let root = vdf
            .value
            .get_obj()
            .expect("should have been able to get library folders obj.");

        for (_, library_value) in root.clone().0 {
            let library = match library_value[0].get_obj() {
                Some(v) => v,
                None => continue,
            };

            if let Some(apps) = library.get("apps") {
                let apps_list = apps[0]
                    .get_obj()
                    .expect("Should have been able to convert library apps to obj.");

                for (app_id, _) in apps_list.clone().0 {
                    appids.push(app_id.into_owned());
                }
            }
        }

        return serde_json::to_string(&appids)
            .expect("Should have been able to serialize libraryfolders vdf to string.");
    } else {
        logger::log_core(&app_handle, "libraryfolders.vdf does not exist.", 0);
        return "{}".to_owned();
    }
}
