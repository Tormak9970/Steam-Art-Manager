use serde::{Serialize, Deserialize};
use phf::phf_map;

#[derive(Serialize, Deserialize, Debug, PartialEq)]
#[allow(non_snake_case)]
pub struct GridInfo {
  pub icon: String,
  pub capsule: String,
  pub wideCapsule: String,
  pub hero: String,
  pub logo: String,
}

#[derive(Serialize, Deserialize, Debug, PartialEq)]
#[allow(non_snake_case)]
pub struct GameStruct {
  pub appid: u64,
  pub name: String,
}

pub static GRID_CACHE_TYPES: phf::Map<&'static str, &'static str> = phf_map! {
  "capsule" => "Capsule",
  "wide_capsule" => "Wide Capsule",
  "hero" => "Hero",
  "logo" => "Logo",
  "icon" => "Icon",
};

pub static LIBRARY_CACHE_TYPES: phf::Map<&'static str, &'static str> = phf_map! {
  "library_600x900" => "Capsule",
  // ! "header" is depreciated
  "header" => "Wide Capsule",
  "library_header" => "Wide Capsule",
  "library_hero" => "Hero",
  "logo" => "Logo",
  "icon" => "Icon",
};
