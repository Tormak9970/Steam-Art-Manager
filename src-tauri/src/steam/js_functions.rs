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

// Application = 2, 4
pub const GET_STEAM_APPS_JS: &str = r#"
JSON.stringify(
  appStore.allApps.map(a => ({
    appid: a.id,
    name: a.displayName,
    type: a.app_type === 1 ? 'Game' : a.app_type === 8 ? 'Demo' : a.app_type === 8192 ? 'Soundtrack' : a.app_type === 2048 ? 'Movie' : a.app_type === 1073741824 ? 'Non-Steam' : 'Application',
    installed: a.installed,
    hiddenInSteam: a.visible_in_game_list,
    playtime: a.minutes_playtime_forever,
    lastPlayed: a.rt_last_time_played,
    releaseDate: a.rt_steam_release_date,
    purchaseDate: a.rt_purchased_time,
    isFamilySharing: a.owner_account_id !== undefined,
    storeCategories: a.store_category,
    storeTags: a.store_tag,
    steamReviewScore: a.review_percentage_without_bombs,
    steamDeckCompatCategory: a.steam_deck_compat_category,
    steamFrameCompatCategory: a.steam_frame_compat_category,
    steamMachineCompatCategory: a.steam_machine_compat_category,
    steamOSCompatCategory: a.steam_os_compat_category,
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
