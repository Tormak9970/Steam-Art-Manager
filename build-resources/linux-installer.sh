#!/bin/bash
# Author: Tormak

errorRed='\033[1;91m'
warningYellow='\033[1;93m'
tipBlue='\033[1;94m'
successGreen='\033[1;96m'
infoCyan='\033[1;92m'
noColor='\033[0m'

comment="A tool for setting the artwork of your Steam library."
uninstallComment="Uninstalls all files related to SARM."

currentVersion="v2.9.0"

# Show starting message.
echo -e "${infoCyan}[INFO]${noColor}: Installing Steam Art Manager (SARM) $currentVersion..."
echo ""
echo -e "${tipBlue}[TIP]${noColor}: If SARM doesn't install, try closing this window and running it again. Sometimes it takes 3-5 attempts to install, looking into the cause."

# Check for a Github.com connection
echo -e "${infoCyan}[INFO]${noColor}: Checking connection to GitHub.com..."
case "$(curl -s --max-time 2 -I http://github.com | sed 's/^[^ ]*  *\([0-9]\).*/\1/; 1q')" in
  [23])
    echo -e "${successGreen}[INFO]${noColor}: Able to reach Github.com"
    ;;
  5)
    echo -e "${errorRed}[ERROR]${noColor}: The web proxy won't let requests through."
    read -p "Press any key to quit the installer"
    exit 1
    ;;
  *)
    echo -e "${errorRed}[ERROR]${noColor}: The network is down or very slow."
    read -p "Press any key to quit the installer"
    exit 1
    ;;
esac

# Check if the .sarm directory already exists.
if [ -d "$HOME/.sarm" ]; then
  echo -e "${successGreen}[INFO]${noColor}: SARM Directory Exists."
else
  mkdir $HOME/.sarm
  echo -e "${successGreen}[INFO]${noColor}: Made SARM Directory."
fi
echo ""

# Download the latest appimage from GitHub.
rm -rf "$HOME"/.sarm/steam-art-manager.AppImage 2>/dev/null
echo -e "${infoCyan}[INFO]${noColor}: Downloading AppImage..."
curl -L https://github.com/Tormak9970/Steam-Art-Manager/releases/download/$currentVersion/steam-art-manager.AppImage --output ~/.sarm/steam-art-manager.AppImage 
chmod 700 ~/.sarm/steam-art-manager.AppImage
echo -e "${successGreen}[INFO]${noColor}: Downloaded AppImage."
echo ""

# Download the uninstall script from GitHub.
rm -rf "$HOME"/.sarm/linux-uninstaller.sh 2>/dev/null
echo -e "${infoCyan}[INFO]${noColor}: Downloading Uninstall Script..."
curl -L https://raw.githubusercontent.com/Tormak9970/Steam-Art-Manager/$currentVersion/build-resources/linux-uninstaller.sh --output ~/.sarm/linux-uninstaller.sh
chmod 700 ~/.sarm/linux-uninstaller.sh
echo -e "${successGreen}[INFO]${noColor}: Downloaded Uninstall Script."
echo ""

# Download the icon from GitHub.
rm -rf "$HOME"/.sarm/steam-art-manager.png 2>/dev/null
echo -e "${infoCyan}[INFO]${noColor}: Downloading Icon..."
curl https://raw.githubusercontent.com/Tormak9970/Steam-Art-Manager/$currentVersion/public/logo.png --output ~/.sarm/steam-art-manager.png
echo -e "${successGreen}[INFO]${noColor}: Downloaded Icon."
echo ""


absSarmPath="$HOME/.sarm"
appImagePath="$absSarmPath/steam-art-manager.AppImage"
iconPath="$absSarmPath/steam-art-manager.png"

cd $absSarmPath
xdg-icon-resource install steam-art-manager.png --size 64
xdg-icon-resource install steam-art-manager.png --size 128
xdg-icon-resource install steam-art-manager.png --size 256
echo -e "${successGreen}[INFO]${noColor}: Updated Icon Database."
echo ""


echo -e "${infoCyan}[INFO]${noColor}: Making Shortcuts..."

# Create the launcher .desktop.
read -r -d '' shortcutContents <<- EOM
#!/usr/bin/env xdg-open
[Desktop Entry]
Comment=$comment
Name=Steam Art Manager
Exec=GTK_USE_PORTAL=1 WEBKIT_DISABLE_COMPOSITING_MODE=1 $appImagePath
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
Name=Uninstall Steam Art Manager
Exec=$uninstallScriptPath
Icon=delete
Terminal=true
Type=Application
Categories=Utility
StartupNotify=false

EOM

# Create the start menu launcher.
rm -rf "$HOME"/.local/share/applications/steam-art-manager.desktop 2>/dev/null
echo -e "$shortcutContents" >> $HOME/.local/share/applications/steam-art-manager.desktop
chmod 700 $HOME/.local/share/applications/steam-art-manager.desktop
echo -e "${successGreen}[INFO]${noColor}: Made Start Menu Shortcut."

# Create the desktop launcher.
rm -rf "$HOME"/Desktop/steam-art-manager.desktop 2>/dev/null
echo -e "$shortcutContents" >> $HOME/Desktop/steam-art-manager.desktop
chmod 700 $HOME/Desktop/steam-art-manager.desktop
echo -e "${successGreen}[INFO]${noColor}: Made Desktop Shortcut."

# Create the start menu uninstaller.
rm -rf "$HOME"/.local/share/applications/uninstall-steam-art-manager.desktop 2>/dev/null
echo -e "$uninstallSarmContent" >> $HOME/.local/share/applications/uninstall-steam-art-manager.desktop
chmod 700 $HOME/.local/share/applications/uninstall-steam-art-manager.desktop
echo -e "${successGreen}[INFO]${noColor}: Made Start Menu Uninstall Shortcut."

# Create the desktop uninstaller.
rm -rf "$HOME"/Desktop/uninstall-steam-art-manager.desktop 2>/dev/null
echo -e "$uninstallSarmContent" >> $HOME/Desktop/uninstall-steam-art-manager.desktop
chmod 700 $HOME/Desktop/uninstall-steam-art-manager.desktop
echo -e "${successGreen}[INFO]${noColor}: Made Desktop Uninstall Shortcut."

echo -e "${successGreen}[INFO]${noColor}: Finished Making Shortcuts."
echo ""

# Update .desktop database.
update-desktop-database $HOME/.local/share/applications
echo -e "${successGreen}[INFO]${noColor}: Updated .desktop database."
echo ""

echo -e "${successGreen}[INFO]${noColor}: Instalation of SARM $currentVersion complete."
echo ""
echo -e "${tipBlue}[TIP]${noColor}: Feel free to delete this script. SARM will notify you when new updates are available!"