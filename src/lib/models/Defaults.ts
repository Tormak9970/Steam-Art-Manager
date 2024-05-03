export const DEFAULT_FILTERS = {
  "Capsule": {
    "styles": {
      "alternate": true,
      "blurred": true,
      "white_logo": true,
      "material": true,
      "no_logo": true,
    },
    "dimensions": {
      "600x900": true,
      "342x482": true,
      "660x930": true,
      "512x512": false,
      "1024x1024": false,
    },
    "mimes": {
      "image/png": true,
      "image/jpeg": true,
      "image/webp": true,
    },
    "types": {
      "static": true,
      "animated": true,
    },
    "oneoftag": {
      "humor": true,
      "nsfw": false,
      "epilepsy": false,
      "untagged": true,
    }
  },
  "Wide Capsule": {
    "styles": {
      "alternate": true,
      "blurred": true,
      "white_logo": true,
      "material": true,
      "no_logo": true,
    },
    "dimensions": {
      "460x215": true,
      "920x430": true,
      "512x512": false,
      "1024x1024": false,
    },
    "mimes": {
      "image/png": true,
      "image/jpeg": true,
      "image/webp": true,
    },
    "types": {
      "static": true,
      "animated": true,
    },
    "oneoftag": {
      "humor": true,
      "nsfw": false,
      "epilepsy": false,
      "untagged": true,
    }
  },
  "Hero": {
    "styles": {
      "alternate": true,
      "blurred": true,
      "material": true,
    },
    "dimensions": {
      "3840x1240": true,
      "1920x620": true,
      "1600x650": true,
    },
    "mimes": {
      "image/png": true,
      "image/jpeg": true,
      "image/webp": true,
    },
    "types": {
      "static": true,
      "animated": true,
    },
    "oneoftag": {
      "humor": true,
      "nsfw": false,
      "epilepsy": false,
      "untagged": true,
    }
  },
  "Logo": {
    "styles": {
      "official": true,
      "white": true,
      "black": true,
      "custom": true,
    },
    "mimes": {
      "image/png": true,
      "image/webp": true,
    },
    "types": {
      "static": true,
      "animated": true,
    },
    "oneoftag": {
      "humor": true,
      "nsfw": false,
      "epilepsy": false,
      "untagged": true,
    }
  },
  "Icon": {
    "styles": {
      "official": true,
      "custom": true,
    },
    "mimes": {
      "image/png": true,
      "image/webp": true,
      "image/vnd.microsoft.icon": true
    },
    "types": {
      "static": true,
      "animated": true,
    },
    "oneoftag": {
      "humor": true,
      "nsfw": false,
      "epilepsy": false,
      "untagged": true,
    }
  }
};

export const DEFAULT_SETTINGS: AppSettings = {
  "version": "",
  "steamInstallPath": "",
  "shownShortcutPrompt": false,
  "steamGridDbApiKey": "",
  "steamApiKeyMap": {},
  "hiddenGameIds": [],
  "manualSteamGames": [],
  "customGameNames": {},
  
  "theme": 0,
  "showHiddenGames": false,

  "debugMode": false,

  "windowSettings": {
    "main": {
      "filters": DEFAULT_FILTERS,
      "panels": {
        "options": 16,
        "games": 42,
        "grids": 42
      },
      "gameViewType": 0,
      "type": "Capsule",
    },
    "cleanGrids": {
      "preset": "clean"
    },
    "manageManualGames": {
      "method": "manual"
    }
  }
};