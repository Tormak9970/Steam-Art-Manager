#!/bin/bash

lightRed='\033[1;31m'
green='\033[0;32m'
lightGreen='\033[1;32m'
lightBlue='\033[1;34m'
noColor='\033[0m'

comment="A tool for setting the artwork of your Steam library."

currentVersion="VALUE_TO_SEARCH_FOR"

currentVersionNumber=""
if [[ $currentVersion == v* ]]; then
  #? This is a production release. Starts with "v".
  $currentVersionNumber="${$currentVersion:1}"
else 
  #? This is a debug release. Starts with "debug-".
  $currentVersionNumber="${$currentVersion:6}"
fi

echo -e "${lightBlue}[INFO]${noColor}: Installing Steam Art Manager (SARM) $currentVersion..."
echo ""
echo -e "${green}[TIP]${noColor}: If SARM doesn't install, try closing this window and running it again. Sometimes it takes 3-5 attempts to install, looking into the cause."

if [ -d "$HOME/.sarm" ]; then
  echo -e "${lightGreen}[INFO]${noColor}: SARM Directory Exists."
else
  mkdir $HOME/.sarm
  echo -e "${lightGreen}[INFO]${noColor}: Made SARM Directory."
fi
echo ""

echo -e "${lightBlue}[INFO]${noColor}: Downloading AppImage..."
curl -L https://github.com/Tormak9970/Steam-Art-Manager/releases/download/$currentVersion/steam-art-manager_${currentVersionNumber}_amd64.AppImage --output ~/.sarm/steam-art-manager.AppImage 
chmod 700 ~/.sarm/steam-art-manager.AppImage
echo -e "${lightGreen}[INFO]${noColor}: Downloaded AppImage."
echo ""


echo -e "${lightBlue}[INFO]${noColor}: Downloading Icon..."
curl https://raw.githubusercontent.com/Tormak9970/Steam-Art-Manager/$currentVersion/public/logo.svg --output ~/.sarm/icon.svg
echo -e "${lightGreen}[INFO]${noColor}: Downloaded Icon."
echo ""


echo -e "${lightBlue}[INFO]${noColor}: Making Shortcuts..."

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

echo -e "$shortcutContents" >> ~/.local/share/applications/SARM.desktop
chmod 700 ~/.local/share/applications/SARM.desktop
echo -e "${lightGreen}[INFO]${noColor}: Made Start Menu Shortcut."

echo -e "$shortcutContents" >> ~/Desktop/SARM.desktop
chmod 700 ~/Desktop/SARM.desktop
echo -e "${lightGreen}[INFO]${noColor}: Made Desktop Shortcut."

echo -e "${lightGreen}[INFO]${noColor}: Finished Making Shortcuts."
echo ""


echo -e "${lightGreen}[INFO]${noColor}: Instalation of SARM $currentVersion complete."
echo ""
echo -e "${green}[TIP]${noColor}: Feel free to delete this script. SARM will notify you when new updates are available!"