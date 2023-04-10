type AppSettings = {
  version: string;
  steamGridDbApiKey: string;
  steamApiKey: string;
  hiddenGameIds: []
};

type SteamRegistryApp = {
  appid: string,
  name: string
}

type SteamGame = {
  appid: number,
  name: string,
}

type LibraryCacheEntry = {
  "Capsule": string,
  "Wide Capsule": string,
  "Hero": string,
  "Logo": string,
  "Icon": string,
}

type ChangedPath = {
  appId: string,
  gridType: string,
  oldPath: string,
  targetPath: string,
  sourcePath: string
}