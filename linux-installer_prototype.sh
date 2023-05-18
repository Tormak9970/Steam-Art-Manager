#!/bin/bash

currentVersion="2.3.0"
comment="A tool for setting the artwork of your Steam library."

echo "[INFO]: Installing Steam Art Manager (SARM) v$currentVersion..."

mkdir ~/.sarm


echo "[INFO]: Downloading AppImage..."
curl -o ~/.sarm/steam-art-manager.AppImage https://github.com/Tormak9970/Steam-Art-Manager/releases/download/v$currentVersion/steam-art-manager\_$currentVersion\_amd64.AppImage
echo "[INFO]: Downloaded AppImage."


echo "[INFO]: Downloading Icon..."
curl -o ~/.sarm/icon.svg https://raw.githubusercontent.com/Tormak9970/Steam-Art-Manager/v$currentVersion/public/logo.svg
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

# TODO: make start menu shortcut
echo "$shortcutContents" >> ~/.local/share/applications/SARM.desktop
echo "[INFO]: Made Start Menu Shortcut."

# TODO: make desktop shortcut
echo "$shortcutContents" >> ~/Desktop/SARM.desktop
echo "[INFO]: Made Desktop Shortcut."

echo "[INFO]: Finished Making Shortcuts."


echo "[INFO]: Instalation of SARM v$currentVersion complete."