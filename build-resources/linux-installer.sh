#!/bin/bash
# Author: Tormak

lightRed='\033[1;31m'
green='\033[0;32m'
lightGreen='\033[1;32m'
lightBlue='\033[1;34m'
noColor='\033[0m'

comment="A tool for setting the artwork of your Steam library."
uninstallComment="Uninstalls all files related to SARM."

currentVersion="VALUE_TO_SEARCH_FOR"

currentVersionNumber=""
if [[ $currentVersion == v* ]]; then
  #? This is a production release. Starts with "v".
  $currentVersionNumber="${$currentVersion:1}"
else 
  #? This is a debug release. Starts with "debug-".
  $currentVersionNumber="${$currentVersion:6}"
fi

# Show starting message.
echo -e "${lightBlue}[INFO]${noColor}: Installing Steam Art Manager (SARM) $currentVersion..."
echo ""
echo -e "${green}[TIP]${noColor}: If SARM doesn't install, try closing this window and running it again. Sometimes it takes 3-5 attempts to install, looking into the cause."

# Check for a Github.com connection
echo "${lightBlue}[INFO]${noColor}: Checking connection to GitHub.com..."
case "$(curl -s --max-time 2 -I http://github.com | sed 's/^[^ ]*  *\([0-9]\).*/\1/; 1q')" in
  [23])
    echo "${lightGreen}[INFO]${noColor}: Able to reach Github.com"
    ;;
  5)
    echo "${lightRed}[ERROR]${noColor}: The web proxy won't let requests through."
    read -p "Press any key to quit the installer"
    exit 1
    ;;
  *)
    echo "${lightRed}[ERROR]${noColor}: The network is down or very slow."
    read -p "Press any key to quit the installer"
    exit 1
    ;;
esac

# Check if the .sarm directory already exists.
if [ -d "$HOME/.sarm" ]; then
  echo -e "${lightGreen}[INFO]${noColor}: SARM Directory Exists."
else
  mkdir $HOME/.sarm
  echo -e "${lightGreen}[INFO]${noColor}: Made SARM Directory."
fi
echo ""

# Download the latest appimage from GitHub.
echo -e "${lightBlue}[INFO]${noColor}: Downloading AppImage..."
curl -L https://github.com/Tormak9970/Steam-Art-Manager/releases/download/$currentVersion/steam-art-manager_${currentVersionNumber}_amd64.AppImage --output ~/.sarm/steam-art-manager.AppImage 
chmod 700 ~/.sarm/steam-art-manager.AppImage
echo -e "${lightGreen}[INFO]${noColor}: Downloaded AppImage."
echo ""

# Download the uninstall script from GitHub.
echo -e "${lightBlue}[INFO]${noColor}: Downloading Uninstall Script..."
curl -L https://github.com/Tormak9970/Steam-Art-Manager/$currentVersion/build-resources/linux-uninstaller.sh --output ~/.sarm/linux-uninstaller.sh
chmod 700 ~/.sarm/linux-uninstaller.sh
echo -e "${lightGreen}[INFO]${noColor}: Downloaded Uninstall Script."
echo ""

# Download the icon from GitHub.
echo -e "${lightBlue}[INFO]${noColor}: Downloading Icon..."
curl https://raw.githubusercontent.com/Tormak9970/Steam-Art-Manager/$currentVersion/public/logo.svg --output ~/.sarm/icon.svg
echo -e "${lightGreen}[INFO]${noColor}: Downloaded Icon."
echo ""


echo -e "${lightBlue}[INFO]${noColor}: Making Shortcuts..."

absSarmPath="$HOME/.sarm"
appImagePath="$absSarmPath/steam-art-manager.AppImage"
iconPath="$absSarmPath/icon.svg"

# Create the launcher .desktop.
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

uninstallScriptPath="$absSarmPath/linux-uninstaller.sh"

# Create the uninstaller .desktop.
read -r -d '' uninstallSarmContent <<- EOM
  #!/usr/bin/env xdg-open
  [Desktop Entry]
  Comment=$uninstallComment
  Name=Uninstall SARM
  Exec=$uninstallScriptPath
  Icon=delete
  Terminal=false
  Type=Application
  Categories=Utility
  StartupNotify=false

EOM

# Create the start menu launcher.
echo -e "$shortcutContents" >> $HOME/.local/share/applications/SARM.desktop
chmod 700 $HOME/.local/share/applications/SARM.desktop
echo -e "${lightGreen}[INFO]${noColor}: Made Start Menu Shortcut."

# Create the desktop launcher.
echo -e "$shortcutContents" >> $HOME/Desktop/SARM.desktop
chmod 700 $HOME/Desktop/SARM.desktop
echo -e "${lightGreen}[INFO]${noColor}: Made Desktop Shortcut."

# Create the start menu uninstaller.
echo -e "$uninstallSarmContent" >> $HOME/.local/share/applications/UinstallSARM.desktop
chmod 700 $HOME/.local/share/applications/UinstallSARM.desktop
echo -e "${lightGreen}[INFO]${noColor}: Made Start Menu Uninstall Shortcut."

# Create the desktop uninstaller.
echo -e "$uninstallSarmContent" >> $HOME/Desktop/UinstallSARM.desktop
chmod 700 $HOME/Desktop/UinstallSARM.desktop
echo -e "${lightGreen}[INFO]${noColor}: Made Desktop Uninstall Shortcut."

echo -e "${lightGreen}[INFO]${noColor}: Finished Making Shortcuts."
echo ""

# Update .desktop database.
update-desktop-database $HOME/.local/share/applications

echo -e "${lightGreen}[INFO]${noColor}: Instalation of SARM $currentVersion complete."
echo ""
echo -e "${green}[TIP]${noColor}: Feel free to delete this script. SARM will notify you when new updates are available!"