#!/bin/bash
# usage: tools/run.sh <args to Transpiler>   (paths are relative to the current directory)
T="$(cd "$(dirname "$0")" && pwd)"
java $(cat "$T/out/exports.txt") -cp "$T/out" Transpiler "$@" 2>&1 | grep -v "^Picked up"
