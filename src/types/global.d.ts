type GameStruct = {
  appid: number;
  name: string;
};

type AppSettings = {
  version: string;
  steamInstallPath: string;
  shownShortcutPrompt: boolean;
  theme: number;
  steamGridDbApiKey: string;
  steamApiKeyMap: { [userId32: string]: string };
  hiddenGameIds: [];
  manualSteamGames: GameStruct[];
  customGameNames: { [appId: string]: string };
};

type LibraryCacheEntry = {
  "Capsule": string;
  "Wide Capsule": string;
  "Hero": string;
  "Logo": string;
  "Icon": string;
};

type ChangedPath = {
  appId: string;
  gridType: string;
  oldPath: string;
  targetPath: string;
  sourcePath: string;
};

type DialogModalType = "INFO" | "WARNING" | "ERROR";

type LogoPinPositions =
  | "BottomLeft"
  | "UpperLeft"
  | "CenterCenter"
  | "UpperCenter"
  | "BottomCenter"
  | "REMOVE";

type LogoPosition = {
  pinnedPosition: LogoPinPositions;
  nWidthPct: number;
  nHeightPct: number;
};

type SteamLogoConfig = {
  nVersion: number;
  logoPosition: LogoPosition;
};

type CleanConflict = {
  fileAName: string;
  fileAPath: string;
  fileBName: string;
  fileBPath: string;
  appid: string;
  gridType: string;
};
