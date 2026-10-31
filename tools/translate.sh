#!/bin/bash
# Full pipeline step: patched tree -> build/game.js + build/external.txt  (cwd = project root)
cd "$(dirname "$0")/.."
python3 tools/apply_patches.py >/dev/null || exit 1
BLOCK=$(grep -v '^#' port/blocklist.txt | grep -v '^$' | tr '\n' ',' | sed 's/,$//')
tools/run.sh --out build/game.js --report build/external.txt --src build/jsrc,port/stubs --seeds "$(grep -v '^#' port/seeds.txt | tr '\n' ',' | sed 's/,$//')" ${BLOCK:+--block "$BLOCK"} "$@" > build/translate.log 2>&1
echo "exit: $?"
