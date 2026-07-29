#!/bin/bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
LAMBDA_DIR="$SCRIPT_DIR/lambda"
BUILD_DIR="$SCRIPT_DIR/build"
ZIP_FILE="$SCRIPT_DIR/ftracker-skill.zip"

echo "Cleaning previous build..."
rm -rf "$BUILD_DIR" "$ZIP_FILE"
mkdir -p "$BUILD_DIR"

echo "Copying Lambda source..."
cp "$LAMBDA_DIR/lambda_function.py" "$BUILD_DIR/"
cp "$LAMBDA_DIR/requirements.txt" "$BUILD_DIR/"

# Install deps only if requirements.txt has non-comment, non-empty lines
if grep -qE '^[[:space:]]*[^#[:space:]]' "$LAMBDA_DIR/requirements.txt" 2>/dev/null; then
  echo "Installing dependencies..."
  pip3 install -r "$LAMBDA_DIR/requirements.txt" -t "$BUILD_DIR/" --quiet
  find "$BUILD_DIR" -type d -name '__pycache__' -exec rm -rf {} + 2>/dev/null || true
  find "$BUILD_DIR" -type d -name '*.dist-info' -exec rm -rf {} + 2>/dev/null || true
  find "$BUILD_DIR" -type d -name '*.egg-info' -exec rm -rf {} + 2>/dev/null || true
fi

FILE_COUNT=$(find "$BUILD_DIR" -type f | wc -l | tr -d ' ')
echo "Packaging $FILE_COUNT file(s)..."

echo "Creating zip..."
(
  cd "$BUILD_DIR"
  zip -r "$ZIP_FILE" . -x "*.pyc" -x "*/__pycache__/*"
)

echo "Verifying archive layout..."
if ! unzip -l "$ZIP_FILE" | grep -q 'lambda_function.py'; then
  echo "ERROR: zip is missing lambda_function.py"
  unzip -l "$ZIP_FILE"
  exit 1
fi

echo "Done: $ZIP_FILE ($(du -sh "$ZIP_FILE" | cut -f1))"
echo "Contents:"
unzip -l "$ZIP_FILE"
