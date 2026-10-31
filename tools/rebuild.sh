#!/usr/bin/env bash
# Full rebuild of the web port from the decompiled Android sources.
#   1. put the JADX output into  port/src/   (the folders  d/  and  dk/  of  sources/)
#   2. put the decoded resources into  build/res-original/  (apktool "res" folder, incl. values/public.xml)
#   3. put joystix.otf (from the APK assets) next to this script's parent:  build/joystix.otf
# Needs: JDK 17+, python3.  Output: dist/ (static site; serve with any web server).
set -euo pipefail
cd "$(dirname "$0")/.."
[ -d port/src/d ] || { echo "port/src/d missing - copy the decompiled sources into port/src first"; exit 1; }
tools/build.sh                                                   # Java->JS translator
python3 tools/build_assets.py build/res-original build/joystix.otf dist   # sprites, sounds, font, dist/res.js
KEEP_GOING=1 tools/translate.sh                                   # patched sources -> build/game.js (+ build/external.txt)
node tools/check_external.js || true                              # sanity: every external API used exists in the JS runtime
tools/build_web.sh                                                # dist/game-bundle.js + dist/index.html
echo "done: serve ./dist  (e.g.  python3 -m http.server -d dist 8000)"
