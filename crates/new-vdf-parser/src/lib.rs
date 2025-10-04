pub mod reader;
pub mod writer;
pub mod appinfo_vdf_parser;
pub mod shortcuts_vdf_parser;
mod vdf_reader;

pub use appinfo_vdf_parser::open_appinfo_vdf;
pub use shortcuts_vdf_parser::{open_shortcuts_vdf, write_shortcuts_vdf};