#!/bin/bash
# Author: Tormak

errorRed='\033[1;91m'
warningYellow='\033[1;93m'
tipBlue='\033[1;94m'
successGreen='\033[1;92m'
infoCyan='\033[1;96m'
noColor='\033[0m'

if zenity --question --title="Warning!" --text="You are about to uninstall SARM and all of its files.\n\n Are you sure you want to proceed?" --width=600; then
  echo -e "${infoCyan}[INFO]${noColor}: Uninstalling Steam Art Manager (SARM)..."
  echo ""

  # Delete install directory
  rm -rf "$HOME/.sarm"
  echo -e "${successGreen}[INFO]${noColor}: Removed SARM directory."

  # Remove Desktop icons
  rm -rf "$HOME/Desktop/SARM.desktop"
  echo -e "${successGreen}[INFO]${noColor}: Removed SARM desktop launch shortcut."
  rm -rf "$HOME/Desktop/UninstallSARM.desktop"
  echo -e "${successGreen}[INFO]${noColor}: Removed SARM start menu launch shortcut."

  # Remove Start Menu shortcuts
  rm -rf "$HOME/.local/share/applications/SARM.desktop"
  echo -e "${successGreen}[INFO]${noColor}: Removed SARM desktop uninstall shortcut."
  rm -rf "$HOME/.local/share/applications/UninstallSARM.desktop"
  echo -e "${successGreen}[INFO]${noColor}: Removed SARM start menu uninstall shortcut."

  # Remove cache directory
  rm -rf "$HOME/.cache/dev.tormak.steam-art-manager"
  echo -e "${successGreen}[INFO]${noColor}: Removed SARM cache directory."

  # Remove config directory
  rm -rf "$HOME/.config/dev.tormak.steam-art-manager"
  echo -e "${successGreen}[INFO]${noColor}: Removed SARM config files."

  # Remove Tauri Runtime Files
  rm -rf "$HOME/.local/share/dev.tormak.steam-art-manager"
  echo -e "${successGreen}[INFO]${noColor}: Removed Tauri runtime files."

  update-desktop-database $HOME/.local/share/applications
  echo -e "${successGreen}[INFO]${noColor}: Updated .desktop database."

  echo ""

  echo -e "${successGreen}[INFO]${noColor}: Successfully uninstalled SARM. If this was because you ran into an issue, please open a GitHub issue so I can get it fixed!"
fi