#!/bin/bash
# Author: Tormak

lightRed='\033[1;31m'
green='\033[0;32m'
lightGreen='\033[1;32m'
lightBlue='\033[1;34m'
noColor='\033[0m'

if zenity --question --title="Warning!" --text="You are about to uninstall SARM and all of its files.\n\n Are you sure you want to proceed?" --width=600; then
  echo -e "${lightBlue}[INFO]${noColor}: Uninstalling Steam Art Manager (SARM)..."
  echo ""

  # Delete install directory
  rm -rf "$HOME/.sarm"
  echo "${lightGreen}[INFO]${noColor}: Removed SARM directory."

  # Remove Desktop icons
  rm -rf "$HOME/Desktop/SARM.desktop"
  echo "${lightGreen}[INFO]${noColor}: Removed SARM desktop launch shortcut."
  rm -rf "$HOME/Desktop/UninstallSARM.desktop"
  echo "${lightGreen}[INFO]${noColor}: Removed SARM start menu launch shortcut."

  # Remove Start Menu shortcuts
  rm -rf "$HOME/.local/share/applications/SARM.desktop"
  echo "${lightGreen}[INFO]${noColor}: Removed SARM desktop uninstall shortcut."
  rm -rf "$HOME/.local/share/applications/UninstallSARM.desktop"
  echo "${lightGreen}[INFO]${noColor}: Removed SARM start menu uninstall shortcut."

  # Remove cache directory
  rm -rf "$HOME/.cache/dev.tormak.steam-art-manager"
  echo "${lightGreen}[INFO]${noColor}: Removed SARM cache directory."

  # Remove config directory
  rm -rf "$HOME/.config/dev.tormak.steam-art-manager"
  echo "${lightGreen}[INFO]${noColor}: Removed SARM config files."

  # Remove Tauri Runtime Files
  rm -rf "$HOME/.local/share/dev.tormak.steam-art-manager"
  echo "${lightGreen}[INFO]${noColor}: Removed Tauri runtime files."

  update-desktop-database $HOME/.local/share/applications
  echo "${lightGreen}[INFO]${noColor}: Updated .desktop database."

  echo ""

  echo "${lightGreen}[INFO]${noColor}: Successfully uninstalled SARM. If this was because you ran into an issue, please open a GitHub issue so I can get it fixed!"
fi