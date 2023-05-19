#!/bin/bash

comment="A tool for setting the artwork of your Steam library."

currentVersion="VALUE_TO_SEARCH_FOR"

currentVersionNumber=""
if [[ $currentVersion == v* ]]; then
  #? This is a production release. Starts with "v".
  $currentVersionNumber=${$currentVersion:1}
else 
  #? This is a debug release. Starts with "debug-".
  $currentVersionNumber=${$currentVersion:6}
fi

echo "[INFO]: Installing Steam Art Manager (SARM) $currentVersion..."

if [ -d "~/.sarm" ]; then
  echo "[INFO]: SARM Directory Exists."
else
  mkdir ~/.sarm
  echo "[INFO]: Made SARM Directory."
fi

echo "[INFO]: Downloading AppImage..."
curl -L https://github.com/Tormak9970/Steam-Art-Manager/releases/download/$currentVersion/steam-art-manager_${currentVersionNumber}_amd64.AppImage --output ~/.sarm/steam-art-manager.AppImage 
chmod 700 ~/.sarm/steam-art-manager.AppImage
echo "[INFO]: Downloaded AppImage."


echo "[INFO]: Downloading Icon..."
curl https://raw.githubusercontent.com/Tormak9970/Steam-Art-Manager/$currentVersion/public/logo.svg --output ~/.sarm/icon.svg
echo "[INFO]: Downloaded Icon."


echo "[INFO]: Making Shortcuts..."

absSarmPath=$(readlink -f ~/.sarm)
appImagePath="$absSarmPath/steam-art-manager.AppImage"
iconPath="$absSarmPath/icon.svg"

read -r -d '' shortcutContents <<- EOM
  #!/usr/bin/env xdg-open
  [Desktop Entry]
  Comment=$comment
  Name=Steam Art Manager
  Exec=$appImagePath
  Icon=$iconPath
  Terminal=false
  Type=Application
  Categories=Utility
  StartupNotify=false

EOM

echo "$shortcutContents" >> ~/.local/share/applications/SARM.desktop
chmod 700 ~/.local/share/applications/SARM.desktop
echo "[INFO]: Made Start Menu Shortcut."

echo "$shortcutContents" >> ~/Desktop/SARM.desktop
chmod 700 ~/Desktop/SARM.desktop
echo "[INFO]: Made Desktop Shortcut."

echo "[INFO]: Finished Making Shortcuts."


echo "[INFO]: Instalation of SARM $currentVersion complete."