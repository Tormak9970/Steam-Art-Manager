#!/bin/sh

# this script takes the deb made by tauri a makes a proper appimage that bundles webkigtk
# and all dependencies, so the resulting appimage actually works on any linux system

set -eu

export ARCH="$(uname -m)"
export APPIMAGE_EXTRACT_AND_RUN=1

UPINFO="gh-releases-zsync|$(echo "$GITHUB_REPOSITORY" | tr '/' '|')|latest|*$ARCH.AppImage.zsync"
APPIMAGETOOL="https://github.com/AppImage/appimagetool/releases/download/continuous/appimagetool-x86_64.AppImage"
LIB4BIN="https://raw.githubusercontent.com/VHSgunzo/sharun/refs/heads/main/lib4bin"

mkdir ./AppDir
cd ./AppDir

# Unpack the deb
if [ ! -f "$1" ]; then
	echo "ERROR: Please give the path to the .deb file to turn into an AppImage"
	exit 1
fi
cp -v "$1" ./sarm.deb
ar vx sarm.deb
tar -xvf data.tar.gz
rm -f *.tar* sarm.deb debian-binary
mv ./usr/share ./
cp ./share/applications/*.desktop ./
cp ./share/icons/hicolor/256x256/apps/app.png ./
ln -s ./app.png ./.DirIcon

# Bundle all libs we have to include opengl for webkigtk
wget --retry-connrefused --tries=30 "$LIB4BIN" -O ./lib4bin
chmod +x ./lib4bin
./lib4bin -p -v -r -s -k ./usr/bin/app \
	/usr/lib/x86_64-linux-gnu/libGL* \
	/usr/lib/x86_64-linux-gnu/libEGL* \
	/usr/lib/x86_64-linux-gnu/libvulkan* \
	/usr/lib/x86_64-linux-gnu/dri/* \
	/usr/lib/x86_64-linux-gnu/gstreamer-1.0/* \
	/usr/lib/x86_64-linux-gnu/libpulsecommon* \
	/usr/lib/x86_64-linux-gnu/libnss_mdns*
rm -rf ./usr

# Add gstreamer binaries
cp -vr /usr/lib/x86_64-linux-gnu/gstreamer1.0/*/* ./shared/bin
( cd ./shared/lib/gstreamer-1.0
	ln -s ../../../sharun ./gst-plugin-scanner
	ln -s ../../../sharun ./gst-ptp-helper
)

# Bundle webkitgtk
# We need to wrap the webkitgtk binaries with sharun, so they go in bin
cp -vr /usr/lib/x86_64-linux-gnu/webkit2gtk-4.1/* ./shared/bin

# Now symlink them from their "typical" location
mkdir -p ./shared/lib/webkit2gtk-4.1/injected-bundle
( cd ./shared/lib/webkit2gtk-4.1
	ln -s ../../../sharun ./WebKitWebProcess
	ln -s ../../../sharun ./WebKitNetworkProcess
	ln -s ../../../sharun ./MiniBrowser
	cd ./injected-bundle
	cp -v ../../../../shared/bin/injected-bundle/* ./
)
ln -s ./ ./shared/lib/x86_64-linux-gnu

# Now we need to patch away the hardcoded path from the webkitgtk libraries
# Ideally something like ld-preload-open should be used
# but webkitgtk is so amazing that even that does not work
find ./shared/lib -name 'libwebkit*' -exec sed -i 's|/usr|././|g' {} \;
echo 'SHARUN_WORKING_DIR=${SHARUN_DIR}' > ./.env

# Prepare sharun
ln ./sharun ./AppRun
./sharun -g

# Make appimage
cd ..
wget -q "$APPIMAGETOOL" -O ./appimagetool
chmod +x ./appimagetool
./appimagetool --comp zstd \
	--mksquashfs-opt -Xcompression-level --mksquashfs-opt 22 \
	-n -u "$UPINFO" "$PWD"/AppDir "$PWD"/Steam-Art-Manager-anylinux-"$ARCH".AppImage

echo "All done!"

