use futures_util::{SinkExt, StreamExt};
use serde::Deserialize;
use serde_json::{Value, json};
use std::{fs, path::Path};
use tauri::AppHandle;
use tauri_plugin_http::reqwest;
use tokio_tungstenite::{connect_async, tungstenite::Message};

use crate::utils::logger;

/// Check is Steam's CEF Debugger is enabled
pub fn check_cef_debugging(app_handle: &AppHandle, steam_path: &Path) -> bool {
    let exists_res = fs::exists(steam_path.join(".cef-enable-remote-debugging"));

    if exists_res.is_err() {
        let err = exists_res.err().unwrap();
        let message = format!(
            "Failed to check if CEF Debug is enabled. Error: {}",
            err.to_string()
        );

        logger::log_core(app_handle, &message, 1);

        return false;
    }

    return exists_res.unwrap();
}

#[tauri::command]
/// IPC wrapper for checking if CEF Debug is enabled.
pub fn check_cef_debugging_frontend(app_handle: AppHandle, steam_path: &Path) -> bool {
    return check_cef_debugging(&app_handle, steam_path);
}

#[derive(Deserialize)]
struct CEFTarget {
    title: String,
    #[serde(rename = "webSocketDebuggerUrl")]
    ws_url: Option<String>,
}

/// Gets the Websocket URL for the SharedJSContext window of the Steam CEF. Probably need to poll this to check back a couple of times
pub async fn find_shared_js_context(app_handle: &AppHandle) -> Option<String> {
    let targets_request_res = reqwest::get("http://localhost:8080/json").await;
    if targets_request_res.is_err() {
        let err = targets_request_res.err().unwrap();
        let message = format!(
            "Failed to connect to CEF Debugger. Error: {}",
            err.to_string()
        );

        logger::log_core(app_handle, &message, 1);
        return None;
    }
    let targets_response = targets_request_res.unwrap();

    let targets_text_res = targets_response.text().await;
    if targets_text_res.is_err() {
        let err = targets_text_res.err().unwrap();
        let message = format!(
            "Failed to convert CEF targets to text. Error: {}",
            err.to_string()
        );

        logger::log_core(app_handle, &message, 1);
        return None;
    }
    let targets_text = targets_text_res.unwrap();

    let targets: Vec<CEFTarget> =
        serde_json::from_str(&targets_text).expect("Failed to parse CEF Targets to JSON.");

    let shared_js_ws_url = targets
        .into_iter()
        .find(|t| t.title == "SharedJSContext")
        .and_then(|t| t.ws_url);

    return shared_js_ws_url;
}

#[tauri::command]
/// IPC wrapper for disabling CEF Debugging.
pub async fn find_shared_js_context_frontend(app_handle: AppHandle) -> Option<String> {
    let ws_url_res = find_shared_js_context(&app_handle).await;
    return ws_url_res;
}

/// Injects the provided javascript into the Steam Client
pub async fn inject_js(ws_url: &str, expr: &str) -> Option<String> {
    let (mut ws, _) = connect_async(ws_url)
        .await
        .ok()
        .expect("Unable to connect to the provided websocket.");

    let req = json!({
        "id": 1,
        "method": "Runtime.evaluate",
        "params": { "expression": expr, "returnByValue": true }
    });

    ws.send(Message::Text(req.to_string().into()))
        .await
        .ok()
        .expect("Failed to send websocket message.");

    while let Some(Ok(Message::Text(txt))) = ws.next().await {
        let message_response: Value = serde_json::from_str(&txt)
            .ok()
            .expect("Failed to parse websocket response.");

        if message_response["id"] == 1 {
            return message_response["result"]["result"]["value"]
                .as_str()
                .map(String::from);
        }
    }

    return None;
}

pub const GET_STEAM_COLLECTIONS_JS: &str = r#"
JSON.stringify(
  collectionStore.userCollections.map(c => ({
    id: c.id,
    name: c.displayName,
    apps: c.allApps.map(a => a.appid),
  }))
)"#;

pub const GET_STEAM_TAGS_JS: &str = r#"
JSON.stringify(
  appStore.m_mapStoreTagLocalization
)"#;

pub const GET_STEAM_APPS_JS: &str = r#"
JSON.stringify(
  appStore.allApps.map(a => ({
    appid: a.id,
    name: a.displayName,
    installed: a.installed,
    visible_in_game_list: a.visible_in_game_list,
    playtime: a.minutes_playtime_forever,
    last_played: a.rt_last_time_played,
    release_date: a.rt_steam_release_date,
    purchase_date: a.rt_purchased_time,
    store_category: a.store_category,
    store_tag: a.store_tag,
    steam_review_score: a.review_percentage_without_bombs,
    steam_deck_compat_category: a.steam_deck_compat_category,
    steam_frame_compat_category: a.steam_frame_compat_category,
    steam_machine_compat_category: a.steam_machine_compat_category,
    steam_os_compat_category: a.steam_os_compat_category,
  }))
)"#;

pub const GET_STEAM_INSTALL_FOLDERS_JS: &str = r#"
JSON.stringify(
  installFolderStore.AllInstallFolders.map(f => {
      return {
          displayName: f.strUserLabel || f.strDriveName,
          drive: f.strDriveName,
          bIsMounted: f.bIsMounted,
          strFolderPath: f.strFolderPath,
          apps: f.vecApps.map(a => a.nAppID),
      }
  })
)"#;

// TODO: Also get users from CEF
