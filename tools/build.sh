#!/bin/bash
# Builds the Java->JS translator (needs a JDK 17+; uses javac internals via --add-exports)
set -e
cd "$(dirname "$0")"
EXPORTS="--add-exports jdk.compiler/com.sun.tools.javac.api=ALL-UNNAMED --add-exports jdk.compiler/com.sun.tools.javac.code=ALL-UNNAMED --add-exports jdk.compiler/com.sun.tools.javac.tree=ALL-UNNAMED --add-exports jdk.compiler/com.sun.tools.javac.util=ALL-UNNAMED --add-exports jdk.compiler/com.sun.tools.javac.main=ALL-UNNAMED --add-exports jdk.compiler/com.sun.tools.javac.file=ALL-UNNAMED --add-exports jdk.compiler/com.sun.tools.javac.comp=ALL-UNNAMED --add-exports jdk.compiler/com.sun.tools.javac.parser=ALL-UNNAMED"
mkdir -p out
javac $EXPORTS -d out Transpiler.java JsGen.java 2>&1 | grep -v "^Picked up" || true
echo "$EXPORTS" > out/exports.txt
