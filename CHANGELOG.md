# Change Log

All notable changes to Steam Art Manager (SARM) will be recorded in this file.

<!-- Check [Keep a Changelog](http://keepachangelog.com/) for recommendations on how to structure this file. -->

<!-- replace me with new updates! -->

## v3.6.4

Bug Fixes
* grids now reset properly on game change ([31672e5](https://github.com/Tormak9970/Steam-Art-Manager/commit/31672e5))

## v3.6.3

Bug Fixes
* linux build no longer panics on load ([91d5723](https://github.com/Tormak9970/Steam-Art-Manager/commit/91d5723))
* no longer loads duplicate grids or looses grids ([c9c3e9f](https://github.com/Tormak9970/Steam-Art-Manager/commit/c9c3e9f))
* object settings now save properly ([bf054d8](https://github.com/Tormak9970/Steam-Art-Manager/commit/bf054d8))

## v3.6.2

Bug Fixes
* sgdb api key now properly validates ([d4e94cb](https://github.com/Tormak9970/Steam-Art-Manager/commit/d4e94cb))
* steam path validation now works on linux ([b827f13](https://github.com/Tormak9970/Steam-Art-Manager/commit/b827f13))

## v3.6.1

Bug Fixes
* additional grids now load if the window is resized ([83d6708](https://github.com/Tormak9970/Steam-Art-Manager/commit/83d6708))
* appinfo games now load properly again ([9f11b08](https://github.com/Tormak9970/Steam-Art-Manager/commit/9f11b08))
* other modals will no longer show below the update modal ([a220e80](https://github.com/Tormak9970/Steam-Art-Manager/commit/a220e80))
* settings window no longer overflows on small screens ([26169c1](https://github.com/Tormak9970/Steam-Art-Manager/commit/26169c1))
* steam install path properly resolves symlinks during validation ([4051e31](https://github.com/Tormak9970/Steam-Art-Manager/commit/4051e31))

## v3.6.0

New Features
* added button to settings that open the app log directory ([a292816](https://github.com/Tormak9970/Steam-Art-Manager/commit/a292816))
* added debug mode setting ([5b670a2](https://github.com/Tormak9970/Steam-Art-Manager/commit/5b670a2))
* added detection for steam api key changes ([5763339](https://github.com/Tormak9970/Steam-Art-Manager/commit/5763339))
* added install path change validation ([60a1365](https://github.com/Tormak9970/Steam-Art-Manager/commit/60a1365))
* added loading of additional grid pages ([279e36a](https://github.com/Tormak9970/Steam-Art-Manager/commit/279e36a))
* added validation to all settings ([497a40e](https://github.com/Tormak9970/Steam-Art-Manager/commit/497a40e))

Bug Fixes
* added additional failsafes for typos in api keys ([b1094c5](https://github.com/Tormak9970/Steam-Art-Manager/commit/b1094c5))
* added support for scoop steam installs ([2fc3c6d](https://github.com/Tormak9970/Steam-Art-Manager/commit/2fc3c6d))
* app no longer breaks when saved install path no longer exists ([b6a7aa7](https://github.com/Tormak9970/Steam-Art-Manager/commit/b6a7aa7))
* error messages no longer show briefly when changing games ([9a910b7](https://github.com/Tormak9970/Steam-Art-Manager/commit/9a910b7))
* the game loading system is now more robust ([f813f56](https://github.com/Tormak9970/Steam-Art-Manager/commit/f813f56))
* users dropdown no longer displays undefined ([da78202](https://github.com/Tormak9970/Steam-Art-Manager/commit/da78202))

## v3.2.1

Bug Fixes
* added scopes for bazzite support ([931b0d5](https://github.com/Tormak9970/Steam-Art-Manager/commit/931b0d5))
* added symlink support for linux steam installs ([5a1dfe2](https://github.com/Tormak9970/Steam-Art-Manager/commit/5a1dfe2))
* changing steam path now properly adds it to scope ([0bf0635](https://github.com/Tormak9970/Steam-Art-Manager/commit/0bf0635))
* steam path modal no longer gets stuck after saving changes ([e7070c4](https://github.com/Tormak9970/Steam-Art-Manager/commit/e7070c4))
* updated csp to specify video sources ([c789c47](https://github.com/Tormak9970/Steam-Art-Manager/commit/c789c47))

## v3.2.0

New Features
* added info modal ([19a4b1d](https://github.com/Tormak9970/Steam-Art-Manager/commit/19a4b1d))
* added link to sgdb page for each grid ([6346cc7](https://github.com/Tormak9970/Steam-Art-Manager/commit/6346cc7))
* added list view ([a8ef14e](https://github.com/Tormak9970/Steam-Art-Manager/commit/a8ef14e))
* added modal to view current grids for games ([abab377](https://github.com/Tormak9970/Steam-Art-Manager/commit/abab377))
* added start menu tiles updating system ([f8d80e5](https://github.com/Tormak9970/Steam-Art-Manager/commit/f8d80e5))
* app now saves modal settings ([495a780](https://github.com/Tormak9970/Steam-Art-Manager/commit/495a780))
* app window is slightly rounded to match design language ([c8e7a11](https://github.com/Tormak9970/Steam-Art-Manager/commit/c8e7a11))
* filter choices now persist after app is closed ([808e8de](https://github.com/Tormak9970/Steam-Art-Manager/commit/808e8de))
* overhauled settings sytem and added new settings ([90ce315](https://github.com/Tormak9970/Steam-Art-Manager/commit/90ce315))
* panel positions are now consistent ([398e5d7](https://github.com/Tormak9970/Steam-Art-Manager/commit/398e5d7))

Bug Fixes
* corrected typo breaking game loading ([80ade96](https://github.com/Tormak9970/Steam-Art-Manager/commit/80ade96))
* hiding games now works properly again ([1ff3dbe](https://github.com/Tormak9970/Steam-Art-Manager/commit/1ff3dbe))
* images now load faster and more reliably ([0463dbb](https://github.com/Tormak9970/Steam-Art-Manager/commit/0463dbb))
* large libraries should now render gracefully ([be1f628](https://github.com/Tormak9970/Steam-Art-Manager/commit/be1f628))
* settings system overhaul and fixes ([f92b5c6](https://github.com/Tormak9970/Steam-Art-Manager/commit/f92b5c6))
* slight tweaks to lightmode ([eb68fcc](https://github.com/Tormak9970/Steam-Art-Manager/commit/eb68fcc))
* tooltip are slightly smaller and better styled ([fafa86a](https://github.com/Tormak9970/Steam-Art-Manager/commit/fafa86a))
* tooltip text is now shorter where possible ([030c086](https://github.com/Tormak9970/Steam-Art-Manager/commit/030c086))
* update modal layout no longer breaks with large changelogs ([ce645a0](https://github.com/Tormak9970/Steam-Art-Manager/commit/ce645a0))
* user is no longer changeable when modals are open ([7aed7c5](https://github.com/Tormak9970/Steam-Art-Manager/commit/7aed7c5))

Build Pipeline Improvements
* added eslint ([b63cd08](https://github.com/Tormak9970/Steam-Art-Manager/commit/b63cd08))
* fixed changelog generating colons at the end ([1291338](https://github.com/Tormak9970/Steam-Art-Manager/commit/1291338))

## v3.0.0

New Features:
* added custom search system for game names ([605997b](https://github.com/Tormak9970/Steam-Art-Manager/commit/605997b))
* added custom steam path support ([3bec562](https://github.com/Tormak9970/Steam-Art-Manager/commit/3bec562))
* added git social preview ([01fc444](https://github.com/Tormak9970/Steam-Art-Manager/commit/01fc444))
* added librarycache exists check ([1e891b8](https://github.com/Tormak9970/Steam-Art-Manager/commit/1e891b8))
* added loading skeletons to games and grids ([cf838a4](https://github.com/Tormak9970/Steam-Art-Manager/commit/cf838a4))
* dialog now shows when no users are found ([e938468](https://github.com/Tormak9970/Steam-Art-Manager/commit/e938468))
* switched to all custom dialogs ([a783ee4](https://github.com/Tormak9970/Steam-Art-Manager/commit/a783ee4))
* updated app icon and image in readme ([ec9d216](https://github.com/Tormak9970/Steam-Art-Manager/commit/ec9d216))

Bug Fixes:
* added frontend logging to log controller ([1c8f61c](https://github.com/Tormak9970/Steam-Art-Manager/commit/1c8f61c))
* app now properly exits when click close from taskbar ([8430fd6](https://github.com/Tormak9970/Steam-Art-Manager/commit/8430fd6))
* bumped tauri to 1.4.1 and tauri-build to 1,4,0 ([aa6b70c](https://github.com/Tormak9970/Steam-Art-Manager/commit/aa6b70c))
* buttons are no longer cramped on small screens ([23dac30](https://github.com/Tormak9970/Steam-Art-Manager/commit/23dac30))
* consecutive dialog modals now work properly ([c15fe36](https://github.com/Tormak9970/Steam-Art-Manager/commit/c15fe36))
* corrected small inconsistencies in headers ([9f00723](https://github.com/Tormak9970/Steam-Art-Manager/commit/9f00723))
* grid preview no longer opens in the incorrect size ([90a7543](https://github.com/Tormak9970/Steam-Art-Manager/commit/90a7543))
* linux installer and uninstaller are now more robust ([255368b](https://github.com/Tormak9970/Steam-Art-Manager/commit/255368b))
* linux shortcut now uses clearer icon and can be pinned to taskbar ([90a7d4c](https://github.com/Tormak9970/Steam-Art-Manager/commit/90a7d4c))
* linux-installer will now fetch the specific version of sarm ([c079bbf](https://github.com/Tormak9970/Steam-Art-Manager/commit/c079bbf))
* modals no longer close on right click ([38eb2cc](https://github.com/Tormak9970/Steam-Art-Manager/commit/38eb2cc))
* modals no longer close unexpectedly when drag clicking ([841f0a8](https://github.com/Tormak9970/Steam-Art-Manager/commit/841f0a8))
* modals now blur background instead of applying opacity ([fcf6712](https://github.com/Tormak9970/Steam-Art-Manager/commit/fcf6712))
* scroll padding is now consistent everywhere ([4c2291d](https://github.com/Tormak9970/Steam-Art-Manager/commit/4c2291d))
* undefined no longer occasionally shows in selected game field ([8381cbb](https://github.com/Tormak9970/Steam-Art-Manager/commit/8381cbb))
* when installed with the linux installer, app now works in wayland ([ff624d8](https://github.com/Tormak9970/Steam-Art-Manager/commit/ff624d8))

Build Pipeline Improvements:
* build process now generates a changelog.md file ([c43ea6f](https://github.com/Tormak9970/Steam-Art-Manager/commit/c43ea6f))
* switched to reliable-changelog ([6688292](https://github.com/Tormak9970/Steam-Art-Manager/commit/6688292))

## v2.9.0

New Features:
* feat: added a custom update modal ([37bc88b](https://github.com/Tormak9970/Steam-Art-Manager/commit/37bc88b))

Bug Fixes:
* fix: removed update event listener ([73e2ac7](https://github.com/Tormak9970/Steam-Art-Manager/commit/73e2ac7))

Build Pipeline Improvements:
* build: latest.json now includes changelog ([e46d3c9](https://github.com/Tormak9970/Steam-Art-Manager/commit/e46d3c9))

## v2.8.0

New Features:
* feat: added custom wix installer ([87f5fbf](https://github.com/Tormak9970/Steam-Art-Manager/commit/87f5fbf))

## v2.7.1

Bug Fixes:
* fix: steam install check now works correctly ([330059d](https://github.com/Tormak9970/Steam-Art-Manager/commit/330059d))

## v2.7.0

New Features:
* feat: added panic info messages ([6611988](https://github.com/Tormak9970/Steam-Art-Manager/commit/6611988))
* feat: significant ui overhaul ([3df883f](https://github.com/Tormak9970/Steam-Art-Manager/commit/3df883f))

Bug Fixes:
* fix: added more robust error check to grids fetching ([5d9c4df](https://github.com/Tormak9970/Steam-Art-Manager/commit/5d9c4df))
* fix: corrected typo in manual games tooltip ([5caaf81](https://github.com/Tormak9970/Steam-Art-Manager/commit/5caaf81))
* fix: edit logo pos icon now shows on linux ([3f46dd0](https://github.com/Tormak9970/Steam-Art-Manager/commit/3f46dd0))
* fix: lightmode revamp for better contrast ([7d77c8e](https://github.com/Tormak9970/Steam-Art-Manager/commit/7d77c8e))
* fix: steam game icons now work properly ([f16cd65](https://github.com/Tormak9970/Steam-Art-Manager/commit/f16cd65))
* fix: taskbar icon should no longer be blurry on linux ([b5f22bc](https://github.com/Tormak9970/Steam-Art-Manager/commit/b5f22bc))

## v2.6.4

Bug Fixes:
* fix: reduce count needed for games to display ([1e41768](https://github.com/Tormak9970/Steam-Art-Manager/commit/1e41768))
* fix: typo in linux uninstaller filename ([d32f285](https://github.com/Tormak9970/Steam-Art-Manager/commit/d32f285))

## v2.6.3

Bug Fixes:
* fix: added check for logPosition prob ([23960ea](https://github.com/Tormak9970/Steam-Art-Manager/commit/23960ea))
* fix: added duplicate detection when adding games ([a8df388](https://github.com/Tormak9970/Steam-Art-Manager/commit/a8df388))
* fix: added header to manage manual games list ([aa240d5](https://github.com/Tormak9970/Steam-Art-Manager/commit/aa240d5))
* fix: added logoPosition prob check on load ([c121047](https://github.com/Tormak9970/Steam-Art-Manager/commit/c121047))
* fix: games with less then 4 grids now load ([5681304](https://github.com/Tormak9970/Steam-Art-Manager/commit/5681304))
* fix: grid download throttling to fix save issues ([31fe27c](https://github.com/Tormak9970/Steam-Art-Manager/commit/31fe27c))
* fix: logo pos no longer breaks save when missing ([db0bbbc](https://github.com/Tormak9970/Steam-Art-Manager/commit/db0bbbc))
* fix: settings modal now closes properly ([d5203aa](https://github.com/Tormak9970/Steam-Art-Manager/commit/d5203aa))
* fix: sgdb games properly reset on game change ([4a20906](https://github.com/Tormak9970/Steam-Art-Manager/commit/4a20906))
* fix: steam not installed now shows properly ([6c554d2](https://github.com/Tormak9970/Steam-Art-Manager/commit/6c554d2))

## v2.6.0

New Features:
* feat: added chocolatey support ([642c4c2](https://github.com/Tormak9970/Steam-Art-Manager/commit/642c4c2))
* feat: added confirmation dialog to reload button ([d18dbf7](https://github.com/Tormak9970/Steam-Art-Manager/commit/d18dbf7))
* feat: added grid cleaning ([ce65fc3](https://github.com/Tormak9970/Steam-Art-Manager/commit/ce65fc3))
* feat: added panic capture logging ([4b18dbe](https://github.com/Tormak9970/Steam-Art-Manager/commit/4b18dbe))
* feat: added timeouts to all http requests ([b8e5089](https://github.com/Tormak9970/Steam-Art-Manager/commit/b8e5089))
* feat: added timeouts to grid image fetching ([697258a](https://github.com/Tormak9970/Steam-Art-Manager/commit/697258a))
* feat: added window position persistance ([cb45192](https://github.com/Tormak9970/Steam-Art-Manager/commit/cb45192))
* feat: manual games complete ([530713d](https://github.com/Tormak9970/Steam-Art-Manager/commit/530713d))

Bug Fixes:
* fix: duplicates are now detected on load ([26cf233](https://github.com/Tormak9970/Steam-Art-Manager/commit/26cf233))
* fix: settings manager is now a modal again ([c878d72](https://github.com/Tormak9970/Steam-Art-Manager/commit/c878d72))

Build Pipeline Improvements:
* build: added pipeline section to releases ([1ab3deb](https://github.com/Tormak9970/Steam-Art-Manager/commit/1ab3deb))

## v2.5.0

New Features:
* feat: added connectivity check to installer ([00b4d61](https://github.com/Tormak9970/Steam-Art-Manager/commit/00b4d61))
* feat: added existence checks to uninstaller ([63350ea](https://github.com/Tormak9970/Steam-Art-Manager/commit/63350ea))
* feat: added logging to uninstaller ([66cf631](https://github.com/Tormak9970/Steam-Art-Manager/commit/66cf631))
* feat: added uninstall script ([0cdff3d](https://github.com/Tormak9970/Steam-Art-Manager/commit/0cdff3d))

Bug Fixes:
* fix: footer tooltips make more sense now ([8b6096a](https://github.com/Tormak9970/Steam-Art-Manager/commit/8b6096a))
* fix: installer no longer messes up version num ([93f57b9](https://github.com/Tormak9970/Steam-Art-Manager/commit/93f57b9))
* fix: linux installer no longer errors ([fb2b9f4](https://github.com/Tormak9970/Steam-Art-Manager/commit/fb2b9f4))

## v2.4.0

New Features:
* feat: added check for Steam being installed ([d2864dd](https://github.com/Tormak9970/Steam-Art-Manager/commit/d2864dd))
* feat: now checks if there is at least one user ([afa251b](https://github.com/Tormak9970/Steam-Art-Manager/commit/afa251b))
* feat: now creates .desktop files for linux ([58d8ad0](https://github.com/Tormak9970/Steam-Art-Manager/commit/58d8ad0))

Bug Fixes:
* fix: now handles improper userconfig casing ([3367359](https://github.com/Tormak9970/Steam-Art-Manager/commit/3367359))

## v2.3.0

New Features:
* feat: added logo config support to import export ([3532b40](https://github.com/Tormak9970/Steam-Art-Manager/commit/3532b40))
* feat: added reset logo position ([2be9b31](https://github.com/Tormak9970/Steam-Art-Manager/commit/2be9b31))
* feat: changed footer buttons to icons ([0b67585](https://github.com/Tormak9970/Steam-Art-Manager/commit/0b67585))
* feat: logo positions are now loaded if they exist ([7a2ff47](https://github.com/Tormak9970/Steam-Art-Manager/commit/7a2ff47))
* feat: logo positions now discard with changes ([06fb826](https://github.com/Tormak9970/Steam-Art-Manager/commit/06fb826))
* feat: major logging overhaul ([5a58808](https://github.com/Tormak9970/Steam-Art-Manager/commit/5a58808))
* feat: now able to set logo position ([0fc0d48](https://github.com/Tormak9970/Steam-Art-Manager/commit/0fc0d48))

Bug Fixes:
* fix: dropdown arrow doesnt bug on game switch ([49f8992](https://github.com/Tormak9970/Steam-Art-Manager/commit/49f8992))
* fix: dropdowns aren't bugged anymore ([0becdac](https://github.com/Tormak9970/Steam-Art-Manager/commit/0becdac))
* fix: images are no longer draggable ([f4ffba9](https://github.com/Tormak9970/Steam-Art-Manager/commit/f4ffba9))
* fix: reload now just relaunches the app ([4793f61](https://github.com/Tormak9970/Steam-Art-Manager/commit/4793f61))
* fix: removing logos deletes files properly ([39c1d85](https://github.com/Tormak9970/Steam-Art-Manager/commit/39c1d85))
* fix: selected sgdb game saves on grid type change ([10a9bbb](https://github.com/Tormak9970/Steam-Art-Manager/commit/10a9bbb))
* fix: steam api key now loaded properly ([fb24b5f](https://github.com/Tormak9970/Steam-Art-Manager/commit/fb24b5f))

## v2.1.2

Bug Fixes:
* fix: completely fixed shortcut icon bug ([c46027c](https://github.com/Tormak9970/Steam-Art-Manager/commit/c46027c))
* fix: platform switching works again ([bae5c92](https://github.com/Tormak9970/Steam-Art-Manager/commit/bae5c92))
* fix: shortcut icons no longer point to other dirs ([f52d9ed](https://github.com/Tormak9970/Steam-Art-Manager/commit/f52d9ed))

## v2.1.1

Bug Fixes:
* fix: shortcuts are working again ([9f203eb](https://github.com/Tormak9970/Steam-Art-Manager/commit/9f203eb))

## v2.1.0

New Features:
* feat: added game name tooltips on hover ([bc0d6e7](https://github.com/Tormak9970/Steam-Art-Manager/commit/bc0d6e7))
* feat: added single instance enforcement ([e3739d9](https://github.com/Tormak9970/Steam-Art-Manager/commit/e3739d9))
* feat: clear grids now displays if there are grids ([55e9ebd](https://github.com/Tormak9970/Steam-Art-Manager/commit/55e9ebd))
* feat: global frontend error logging ([2c2d1dd](https://github.com/Tormak9970/Steam-Art-Manager/commit/2c2d1dd))

Bug Fixes:
* fix: believe windows 11 issue is fixed ([d8a37a8](https://github.com/Tormak9970/Steam-Art-Manager/commit/d8a37a8))
* fix: clearing grids no longer erases image in UI ([a7abbce](https://github.com/Tormak9970/Steam-Art-Manager/commit/a7abbce))
* fix: fixed loading if game selected on key changes ([bb57f88](https://github.com/Tormak9970/Steam-Art-Manager/commit/bb57f88))
* fix: theme state is now properly updated ([b37cb52](https://github.com/Tormak9970/Steam-Art-Manager/commit/b37cb52))
* fix: webps are now applied properly ([af10a9d](https://github.com/Tormak9970/Steam-Art-Manager/commit/af10a9d))

## v2.0.0

New Features:
* feat: added ability to change steam users ([4641900](https://github.com/Tormak9970/Steam-Art-Manager/commit/4641900))
* feat: added ability to discard changes per game ([238ef3d](https://github.com/Tormak9970/Steam-Art-Manager/commit/238ef3d))
* feat: added animated indicator to grids ([9b8a1ca](https://github.com/Tormak9970/Steam-Art-Manager/commit/9b8a1ca))
* feat: added focus indication to windows ([efa8fb9](https://github.com/Tormak9970/Steam-Art-Manager/commit/efa8fb9))
* feat: added full support for non-steam games ([753837b](https://github.com/Tormak9970/Steam-Art-Manager/commit/753837b))
* feat: added grid previews ([31764ac](https://github.com/Tormak9970/Steam-Art-Manager/commit/31764ac))
* feat: added message when quitting without save ([a333828](https://github.com/Tormak9970/Steam-Art-Manager/commit/a333828))
* feat: added notes indicator to grids ([953af8d](https://github.com/Tormak9970/Steam-Art-Manager/commit/953af8d))
* feat: added page count detection ([30e37a8](https://github.com/Tormak9970/Steam-Art-Manager/commit/30e37a8))
* feat: added reload button to footer ([6c7f3b4](https://github.com/Tormak9970/Steam-Art-Manager/commit/6c7f3b4))
* feat: added settings window ([97dddd7](https://github.com/Tormak9970/Steam-Art-Manager/commit/97dddd7))
* feat: animated images don't animate unless hovered ([6d82ac4](https://github.com/Tormak9970/Steam-Art-Manager/commit/6d82ac4))
* feat: ctrl f now navigates to searchbar ([5b5b9f9](https://github.com/Tormak9970/Steam-Art-Manager/commit/5b5b9f9))
* feat: game selection for steam games ([6472a16](https://github.com/Tormak9970/Steam-Art-Manager/commit/6472a16))
* feat: grid type is now always shown ([65afffe](https://github.com/Tormak9970/Steam-Art-Manager/commit/65afffe))
* feat: lightmode for haters ([a089e4f](https://github.com/Tormak9970/Steam-Art-Manager/commit/a089e4f))
* feat: loading images using localconfig complete ([2429e07](https://github.com/Tormak9970/Steam-Art-Manager/commit/2429e07))
* feat: major release 2 ([3c95c2b](https://github.com/Tormak9970/Steam-Art-Manager/commit/3c95c2b))
* feat: non-steam games now render ([0314a65](https://github.com/Tormak9970/Steam-Art-Manager/commit/0314a65))
* feat: nonsteam import/export complete ([0d6d79e](https://github.com/Tormak9970/Steam-Art-Manager/commit/0d6d79e))
* feat: selectable non-steam results ([87541ab](https://github.com/Tormak9970/Steam-Art-Manager/commit/87541ab))
* feat: shortcuts reading complete ([3a6ac5f](https://github.com/Tormak9970/Steam-Art-Manager/commit/3a6ac5f))

Bug Fixes:
* fix: apngs now download properly ([a936f89](https://github.com/Tormak9970/Steam-Art-Manager/commit/a936f89))
* fix: app no longer takes ages to load from p-scope ([8002a01](https://github.com/Tormak9970/Steam-Art-Manager/commit/8002a01))
* fix: app now loads on launch without interaction ([fe8bc15](https://github.com/Tormak9970/Steam-Art-Manager/commit/fe8bc15))
* fix: app now retries a couple of times if offline ([b7600cc](https://github.com/Tormak9970/Steam-Art-Manager/commit/b7600cc))
* fix: appinfo reading has been fixed ([276aaaa](https://github.com/Tormak9970/Steam-Art-Manager/commit/276aaaa))
* fix: changes now apply after multiple saves ([6c9f979](https://github.com/Tormak9970/Steam-Art-Manager/commit/6c9f979))
* fix: filtering now works properly ([7f32422](https://github.com/Tormak9970/Steam-Art-Manager/commit/7f32422))
* fix: games on other platforms dissapear on change ([215458c](https://github.com/Tormak9970/Steam-Art-Manager/commit/215458c))
* fix: grids now save for apps without previous ones ([4759e51](https://github.com/Tormak9970/Steam-Art-Manager/commit/4759e51))
* fix: ico images render properly in preview ([42e55b1](https://github.com/Tormak9970/Steam-Art-Manager/commit/42e55b1))
* fix: loading spinner now done properly ([b0a7f01](https://github.com/Tormak9970/Steam-Art-Manager/commit/b0a7f01))
* fix: logos and icons no longer broken ([dce6574](https://github.com/Tormak9970/Steam-Art-Manager/commit/dce6574))
* fix: numbers no longer look like ass ([c899f86](https://github.com/Tormak9970/Steam-Art-Manager/commit/c899f86))
* fix: settings now load properly ([723b325](https://github.com/Tormak9970/Steam-Art-Manager/commit/723b325))
* fix: strings no longer get malformed when read ([656a605](https://github.com/Tormak9970/Steam-Art-Manager/commit/656a605))

## v1.4.5

Bug Fixes:
* fix: cmd line no longer opens with app ([51369b4](https://github.com/Tormak9970/Steam-Art-Manager/commit/51369b4))
* fix: included steamgriddb in img csp ([59f6328](https://github.com/Tormak9970/Steam-Art-Manager/commit/59f6328))

## v1.4.4

Bug Fixes:
* fix: user id is now properly found ([6581239](https://github.com/Tormak9970/Steam-Art-Manager/commit/6581239))

## v1.4.3

Bug Fixes:
* fix: misunderstanding vdf_serde resolved ([21ad742](https://github.com/Tormak9970/Steam-Art-Manager/commit/21ad742))
* fix: removed caching that caused stale builds ([fe57505](https://github.com/Tormak9970/Steam-Art-Manager/commit/fe57505))

## v1.4.2

Bug Fixes:
* fix: typo no longer bricking loading of games ([56caff0](https://github.com/Tormak9970/Steam-Art-Manager/commit/56caff0))

## v1.4.1

Bug Fixes:
* fix: now checks and creates cache dir ([51237e9](https://github.com/Tormak9970/Steam-Art-Manager/commit/51237e9))
* fix: version calc has been fixed ([4b5b495](https://github.com/Tormak9970/Steam-Art-Manager/commit/4b5b495))

## v1.4.0

Bug Fixes:
* fix: log_to_file was getting called before clean ([0f60341](https://github.com/Tormak9970/Steam-Art-Manager/commit/0f60341))
* fix: no longer logging before log is cleared ([2bad2c5](https://github.com/Tormak9970/Steam-Art-Manager/commit/2bad2c5))
* fix: removed broad scope for assets and fs ([9c8ad7f](https://github.com/Tormak9970/Steam-Art-Manager/commit/9c8ad7f))
* fix: worked on linux logging issues ([63c1117](https://github.com/Tormak9970/Steam-Art-Manager/commit/63c1117))

## v1.2.0

New Features:
* feat: add loading indicator to grid when download ([65b9fe7](https://github.com/Tormak9970/Steam-Art-Manager/commit/65b9fe7))
* feat: added acknowledgements ([7a2b21e](https://github.com/Tormak9970/Steam-Art-Manager/commit/7a2b21e))
* feat: added backup text to game images ([f51156b](https://github.com/Tormak9970/Steam-Art-Manager/commit/f51156b))
* feat: added change saving ([9ca2102](https://github.com/Tormak9970/Steam-Art-Manager/commit/9ca2102))
* feat: added commit linting ([5e1fa0e](https://github.com/Tormak9970/Steam-Art-Manager/commit/5e1fa0e))
* feat: added grids loader and no results msg ([dc65623](https://github.com/Tormak9970/Steam-Art-Manager/commit/dc65623))
* feat: finished filtering and styling for grids ([7221660](https://github.com/Tormak9970/Steam-Art-Manager/commit/7221660))
* feat: image caching and cleanup complete ([8f651f7](https://github.com/Tormak9970/Steam-Art-Manager/commit/8f651f7))
* feat: implemented grids fetching ([169d631](https://github.com/Tormak9970/Steam-Art-Manager/commit/169d631))
* feat: implemented sgdb wrapper ([873de77](https://github.com/Tormak9970/Steam-Art-Manager/commit/873de77))
* feat: removed malformed config ([808c426](https://github.com/Tormak9970/Steam-Art-Manager/commit/808c426))

Bug Fixes:
* fix: package.json version was incorrect ([7f1a286](https://github.com/Tormak9970/Steam-Art-Manager/commit/7f1a286))
* fix: pipeline should function now ([cc24458](https://github.com/Tormak9970/Steam-Art-Manager/commit/cc24458))
* fix: save and discard now function properly ([73594d1](https://github.com/Tormak9970/Steam-Art-Manager/commit/73594d1))
* fix: typo from refactor was breaking build ([423ea39](https://github.com/Tormak9970/Steam-Art-Manager/commit/423ea39))


<!-- TODO: add all the missing updates that have already happened here -->