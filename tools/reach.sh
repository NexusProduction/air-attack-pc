#!/bin/bash
# usage: tools/reach.sh [--api] ; prints REACH list in build/reach.log (cwd = project root)
cd "$(dirname "$0")/.."
python3 tools/apply_patches.py >/dev/null || exit 1
BLOCK=$(grep -v '^#' port/blocklist.txt | grep -v '^$' | tr '\n' ',' | sed 's/,$//')
DUMP_REACH=1 tools/run.sh --api --src build/jsrc,port/stubs --seeds "$(cat port/seeds.txt | tr '\n' ',' | sed 's/,$//')" --block "$BLOCK" > build/reach.log 2>&1
grep '^REACH' build/reach.log | awk '{print $2}' | sed 's/\$.*//' | sort -u > build/reach_classes.txt
wc -l < build/reach_classes.txt
