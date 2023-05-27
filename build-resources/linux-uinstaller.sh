#!/bin/bash
# Author: Tormak

lightRed='\033[1;31m'
green='\033[0;32m'
lightGreen='\033[1;32m'
lightBlue='\033[1;34m'
noColor='\033[0m'

if zenity --question --title="Warning!" --text="You are about to uninstall SARM and all of its files.\n\n Are you sure you want to proceed?" --width=600; then
  # Delete install directory
  rm -rf "$HOME/.sarm"

  # Remove Desktop icons
  rm -rf "$HOME/Desktop/SARM.desktop"
  rm -rf "$HOME/Desktop/UninstallSARM.desktop"

  # Remove Start Menu shortcuts
  rm -rf "$HOME/.local/share/applications/SARM.desktop"
  rm -rf "$HOME/.local/share/applications/UninstallSARM.desktop"

  # Remove cache directory
  rm -rf "$HOME/.cache/dev.tormak.steam-art-manager"

  # Remove config directory
  rm -rf "$HOME/.config/dev.tormak.steam-art-manager"

  # Remove Tauri Files
  rm -rf "$HOME/.local/share/dev.tormak.steam-art-manager"

  update-desktop-database $HOME/.local/share/applications

  echo "${lightGreen}[INFO]${noColor}: Successfully uninstalled SARM. If this was because you ran into an issue, please open a GitHub issue so I can get it fixed!"
fi