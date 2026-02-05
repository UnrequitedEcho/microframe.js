#!/usr/bin/env bash
set -e

SRC="./src"
DIST="./dist"

echo "Building microframe..."

mkdir -p "$DIST"

cp "$SRC/microframe.js" "$DIST/microframe.js"
cp "$SRC/microframe.css" "$DIST/microframe.css"
terser "$DIST/microframe.js" -o "$DIST/microframe.min.js" --compress --mangle
csso "$DIST/microframe.css" --output "$DIST/microframe.min.css"

zip -j -q "$DIST/microframe.zip" "$DIST/microframe.min.js" "$DIST/microframe.min.css"

echo "Build complete"

