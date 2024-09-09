#!/bin/bash
# Author: Travis Lane

errorRed='\033[1;91m'
warningYellow='\033[1;93m'
tipBlue='\033[1;94m'
successGreen='\033[1;96m'
infoCyan='\033[1;92m'
noColor='\033[0m'

if zenity --question --title="Warning!" --text="You are about to uninstall SARM and all of its files.\n\n Are you sure you want to proceed?" --width=600; then
  echo -e "${infoCyan}[INFO]${noColor}: Uninstalling Steam Art Manager (SARM)..."
  echo ""

  # Delete install directory
  if [ -d "$HOME/.sarm" ]; then
    rm -rf "$HOME/.sarm"
    echo -e "${successGreen}[INFO]${noColor}: Removed SARM directory."
  else
    echo -e "${infoCyan}[INFO]${noColor}: SARM directory already removed."
  fi

  # Remove Desktop icons
  if [ -d "$HOME/Desktop/steam-art-manager.desktop" ]; then
    rm -rf "$HOME/Desktop/steam-art-manager.desktop"
    echo -e "${successGreen}[INFO]${noColor}: Removed SARM desktop launch shortcut."
  else
    echo -e "${infoCyan}[INFO]${noColor}: SARM desktop launch shortcut already removed."
  fi

  if [ -d "$HOME/Desktop/uninstall-steam-art-manager.desktop" ]; then
    rm -rf "$HOME/Desktop/uninstall-steam-art-manager.desktop"
    echo -e "${successGreen}[INFO]${noColor}: Removed SARM desktop uninstall shortcut."
  else
    echo -e "${infoCyan}[INFO]${noColor}: SARM desktop uninstall shortcut already removed."
  fi

  # Remove Start Menu shortcuts
  if [ -d "$HOME/.local/share/applications/steam-art-manager.desktop" ]; then
    rm -rf "$HOME/.local/share/applications/steam-art-manager.desktop"
    echo -e "${successGreen}[INFO]${noColor}: Removed SARM start menu launch shortcut."
  else
    echo -e "${infoCyan}[INFO]${noColor}: SARM start menu launch shortcut already removed."
  fi

  if [ -d "$HOME/.local/share/applications/uninstall-steam-art-manager.desktop" ]; then
    rm -rf "$HOME/.local/share/applications/uninstall-steam-art-manager.desktop"
    echo -e "${successGreen}[INFO]${noColor}: Removed SARM start menu uninstall shortcut."
  else
    echo -e "${infoCyan}[INFO]${noColor}: SARM start menu uninstall shortcut already removed."
  fi

  # Remove cache directory
  if [ -d "$HOME/.cache/dev.tormak.steam-art-manager" ]; then
    rm -rf "$HOME/.cache/dev.tormak.steam-art-manager"
    echo -e "${successGreen}[INFO]${noColor}: Removed SARM cache directory."
  else
    echo -e "${infoCyan}[INFO]${noColor}: SARM cache directory already removed."
  fi

  # Remove config directory
  if [ -d "$HOME/.config/dev.tormak.steam-art-manager" ]; then
    rm -rf "$HOME/.config/dev.tormak.steam-art-manager"
    echo -e "${successGreen}[INFO]${noColor}: Removed SARM config directory."
  else
    echo -e "${infoCyan}[INFO]${noColor}: SARM config directory already removed."
  fi

  # Remove Tauri Runtime Files
  if [ -d "$HOME/.local/share/dev.tormak.steam-art-manager" ]; then
    rm -rf "$HOME/.local/share/dev.tormak.steam-art-manager"
    echo -e "${successGreen}[INFO]${noColor}: Removed SARM Tauri runtime files."
  else
    echo -e "${infoCyan}[INFO]${noColor}: SARM Tauri runtime files already removed."
  fi

  update-desktop-database $HOME/.local/share/applications
  echo -e "${successGreen}[INFO]${noColor}: Updated .desktop database."

  echo ""

  echo -e "${successGreen}[INFO]${noColor}: Successfully uninstalled SARM. If this was because you ran into an issue, please open a GitHub issue so I can get it fixed!"
fi