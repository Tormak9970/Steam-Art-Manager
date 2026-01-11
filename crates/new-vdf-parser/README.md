# vdf-parser

A Rust library for parsing Steam's VDF (Valve Data Format) files, including appinfo.vdf and shortcuts.vdf. This crate provides parsers and utilities for working with Steam's file formats, which are used to store application information and shortcuts in the Steam client.

## Features

- Parse appinfo.vdf files
- Parse shortcuts.vdf files  
- Read and write VDF data structures
- Binary VDF parsing

## Usage

Add this to your `Cargo.toml`:

```toml
[dependencies]
new-vdf-parser = "0.1.0"
```

## Examples

### Reading appinfo.vdf

You can see an in-context example in [SARM](https://github.com/Tormak9970/Steam-Art-Manager/blob/3512093891980c0eb55a10cc005d6124c873fbd7/src-tauri/src/steam.rs#L250)

```rust
use new_vdf_parser::appinfo_vdf_parser::open_appinfo_vdf;
use std::path::{PathBuf, Path};
use serde_json::{Value, Map};

/// Gets the steam appinfo.vdf path.
pub fn get_appinfo_path(steam_path: String) -> String {
  let steam_root: PathBuf = PathBuf::from(steam_path);
  let joined_path: PathBuf = steam_root.join("appcache/appinfo.vdf");
  return joined_path.to_str().expect("Should have been able to convert to a string.").to_owned().replace("\\", "/");
}

let steam_path: String = "your/steam/path".toString();
let appinfo_path: PathBuf = PathBuf::from(get_appinfo_path(app_handle.to_owned(), steam_path));
let appinfo_vdf: Map<String, Value> = open_appinfo_vdf(&appinfo_path);

let pretty_str: String = serde_json::to_string(&appinfo_vdf).expect("Should have been able to serialize AppInfo vdf to string.");

println!("AppInfo: {}", pretty_str);
```

<!-- ### Writing appinfo.vdf

You can see an in-context example in [SARM](https://github.com/Tormak9970/Steam-Art-Manager/blob/3512093891980c0eb55a10cc005d6124c873fbd7/src-tauri/src/steam.rs#L250)

```rust
use new_vdf_parser::appinfo_vdf_parser::open_appinfo_vdf;
use std::path::{PathBuf, Path};
use serde_json::{Value, Map};

let steam_path: str = "your/steam/path";

/// Gets the steam appinfo.vdf path.
pub fn get_appinfo_path(steam_path: String) -> String {
  let steam_root: PathBuf = PathBuf::from(steam_path);
  let joined_path: PathBuf = steam_root.join("appcache/appinfo.vdf");
  return joined_path.to_str().expect("Should have been able to convert to a string.").to_owned().replace("\\", "/");
}

let appinfo_path: PathBuf = PathBuf::from(get_appinfo_path(app_handle.to_owned(), steam_path));
let appinfo_vdf: Map<String, Value> = open_appinfo_vdf(&appinfo_path);

let pretty_str: String = serde_json::to_string(&appinfo_vdf).expect("Should have been able to serialize AppInfo vdf to string.");

println!("{}", pretty_str);
``` -->


### Reading shortcuts.vdf

You can see an in-context example in [SARM](https://github.com/Tormak9970/Steam-Art-Manager/blob/3512093891980c0eb55a10cc005d6124c873fbd7/src-tauri/src/steam.rs#L258)

```rust
use new_vdf_parser::appinfo_vdf_parser::open_shortcuts_vdf;
use std::path::{PathBuf, Path};
use serde_json::{Value, Map};

/// Gets the steam shortcuts.vdf path.
pub fn get_shortcuts_path(steam_path: String, steam_active_user_id: String) -> String {
  let steam_root: PathBuf = PathBuf::from(steam_path);
  let joined_path: PathBuf = steam_root.join("userdata").join(steam_active_user_id.to_string()).join("config/shortcuts.vdf");

  return joined_path.to_str().expect("Should have been able to convert to a string.").to_owned().replace("\\", "/");
}


let steam_path: String = "your/steam/path".toString();
let steam_active_user_id: String = "your_steam_id".toString();
let shortcuts_path = PathBuf::from(get_shortcuts_path(app_handle.to_owned(), steam_path, steam_active_user_id));

// Not all users will have a shortcuts.vdf file on their machine.
if shortcuts_path.as_path().exists() {
  let shortcuts_array = open_shortcuts_vdf(&shortcuts_path);
  let pretty_str: String = serde_json::to_string(&shortcuts_array).expect("Should have been able to serialize Shortcuts vdf to string.");

  println!("Shortcuts: {}", pretty_str);
}
```

### Writing shortcuts.vdf

You can see an in-context example in [SARM](https://github.com/Tormak9970/Steam-Art-Manager/blob/3512093891980c0eb55a10cc005d6124c873fbd7/src-tauri/src/handle_changes.rs#L171)

```rust
use new_vdf_parser::appinfo_vdf_parser::open_appinfo_vdf;
use std::path::{PathBuf, Path};
use serde_json::{Value, Map};

let shortcuts_str: String = "..."; // This is a JSON string of the data to write to the shortcuts.vdf file
/// Example:
/// {
///   "shortcuts": {
///     "0":{
///       "AllowDesktopConfig": 1,
///       "AllowOverlay": 1,
///       "AppName":"Firefox",
///       "Devkit": 0,
///       "DevkitGameID": "",
///       "DevkitOverrideAppID": 0,
///       "Exe": "\"C:\\Program Files\\Mozilla Firefox\\firefox.exe\"",
///       "FlatpakAppID": "",
///       "IsHidden": 0,
///       "LastPlayTime": 0,
///       "LaunchOptions": "",
///       "OpenVR": 0,
///       "ShortcutPath": "",
///       "StartDir": "C:\\Program Files\\Mozilla Firefox\\",
///       "appid": 3071491651,
///       "icon": "",
///       "sortas": "",
///       "tags": {}
///     },
///   }
/// }
let steam_path: str = "your/steam/path";
let shortcuts_vdf_path: PathBuf = PathBuf::from(steam::get_shortcuts_path(app_handle.to_owned(), steam_path.to_owned(), steam_active_user_id));

let shortcuts_data: Value = serde_json::from_str(shortcuts_str.as_str()).expect("Should have been able to parse json string.");
write_shortcuts_vdf(&shortcuts_vdf_path, shortcuts_data);
```

## License

This project is licensed under the GNU Lesser General Public License v2.1 - see the [LICENSE](LICENSE) file for details.

## Copyright

Copyright (C) Travis Lane (Tormak9970)