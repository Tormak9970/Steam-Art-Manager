// Application = 2, 4, anything else
pub const GET_STEAM_APPS_JS: &str = r#"
(async () => {
  const CONCURRENCY = 600;
  const TIMEOUT_MS = 1500;

  const getAssets = appid => new Promise(res => {
    let reg = null;
    let done = false;
    const finish = val => {
      if (done) return;
      done = true;
      clearTimeout(t);
      setTimeout(() => reg?.unregister?.(), 0);
      res(val);
    };
    const t = setTimeout(() => finish(null), TIMEOUT_MS);
    try {
      reg = SteamClient.Apps.RegisterForAppDetails(appid, d => finish(d?.libraryAssets ?? null));
    } catch (e) {
      finish(null);
    }
  });

  const apps = appStore.allApps.filter(a => a.app_type !== 8192);

  // Worker pool: always CONCURRENCY requests in flight, so one dead app only blocks one slot
  const assets = new Map();
  const queue = apps.map(a => a.appid);
  const worker = async () => {
    while (queue.length) {
      const appid = queue.pop();
      assets.set(appid, await getAssets(appid));
    }
  };
  await Promise.all(Array.from({ length: CONCURRENCY }, worker));

  const out = apps.map(a => {
    const r = assets.get(a.appid);
    return {
      appid: a.appid,
      name: a.display_name,
      type: a.app_type === 1 ? 'Game' : a.app_type === 8 ? 'Demo' : a.app_type === 8192 ? 'Soundtrack' : a.app_type === 2048 ? 'Movie' : a.app_type === 1073741824 ? 'Non-Steam' : 'Application',
      gridInfo: {
        icon: "",
        capsule: a.library_capsule_filename ?? "",
        wideCapsule: a.header_filename ?? "",
        logo: r?.strLogoImage ?? "",
        hero: r?.strHeroImage ?? "",
      },
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
    };
  });
  return JSON.stringify(out);
})()"#;

pub const GET_STEAM_FILTER_DATA_JS: &str = r#"
JSON.stringify({
  installFolders: installFolderStore.AllInstallFolders.map(f => {
    return {
      displayName: f.strUserLabel || f.strDriveName,
      drive: f.strDriveName,
      bIsMounted: f.bIsMounted,
      strFolderPath: f.strFolderPath,
      apps: f.vecApps.map(a => a.nAppID),
    }
  }),
  tags: appStore.m_mapStoreTagLocalization,
  collections: collectionStore.userCollections.map(c => ({
    id: c.id,
    name: c.displayName,
    apps: c.allApps.map(a => a.appid),
  }))
})"#;

// TODO: Also get users from CEF
