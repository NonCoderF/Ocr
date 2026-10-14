#!/usr/bin/env bash

set -euo pipefail

PROJECT_ROOT="$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)"
ANDROID_ROOT="$PROJECT_ROOT/android"
GRADLE_WRAPPER="$ANDROID_ROOT/gradlew"

if [[ ! -x "$GRADLE_WRAPPER" ]]; then
  echo "Error: Android Gradle wrapper not found or not executable: $GRADLE_WRAPPER" >&2
  echo "On Unix-like systems, run: chmod +x android/gradlew" >&2
  exit 1
fi

if ! command -v node >/dev/null 2>&1; then
  echo "Error: Node.js is required to read and update the app version." >&2
  exit 1
fi

CURRENT_VERSION="$(node -e 'console.log(require(process.argv[1]).expo.version)' "$PROJECT_ROOT/app.json")"

echo "Select Android build variant:"
echo "  1) debug"
echo "  2) release"
echo "  3) all"
read -r -p "Enter choice [1-3]: " VARIANT_CHOICE

case "$VARIANT_CHOICE" in
  1) VARIANT="debug" ;;
  2) VARIANT="release" ;;
  3) VARIANT="all" ;;
  *)
    echo "Invalid build variant choice." >&2
    exit 1
    ;;
esac

read -r -p "Enter version [$CURRENT_VERSION]: " VERSION
VERSION="${VERSION:-$CURRENT_VERSION}"

if [[ ! "$VERSION" =~ ^[0-9]+\.[0-9]+\.[0-9]+([.-][0-9A-Za-z.-]+)?$ ]]; then
  echo "Invalid version '$VERSION'. Use semantic version format, for example 1.2.3." >&2
  exit 1
fi

echo "Updating app version to $VERSION..."
node - "$PROJECT_ROOT" "$VERSION" <<'NODE'
const fs = require('fs');
const path = require('path');

const projectRoot = process.argv[2];
const version = process.argv[3];

function updateJson(file, update) {
  const fullPath = path.join(projectRoot, file);
  const json = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
  update(json);
  fs.writeFileSync(fullPath, `${JSON.stringify(json, null, 2)}\n`);
}

updateJson('app.json', (json) => { json.expo.version = version; });
updateJson('package.json', (json) => { json.version = version; });

const gradlePath = path.join(projectRoot, 'android', 'app', 'build.gradle');
let gradle = fs.readFileSync(gradlePath, 'utf8');
if (!/versionName\s+["'][^"']+["']/.test(gradle)) {
  throw new Error(`Could not find versionName in ${gradlePath}`);
}
gradle = gradle.replace(/versionName\s+["'][^"']+["']/, `versionName "${version}"`);
fs.writeFileSync(gradlePath, gradle);
NODE

if [[ "$VARIANT" == "all" ]]; then
  BUILD_VARIANTS=(debug release)
else
  BUILD_VARIANTS=("$VARIANT")
fi

for BUILD_VARIANT in "${BUILD_VARIANTS[@]}"; do
  TASK=":app:assemble${BUILD_VARIANT^}"
  echo "Building $BUILD_VARIANT APK ($TASK)..."
  (
    cd "$ANDROID_ROOT"
    "$GRADLE_WRAPPER" "$TASK" --no-daemon --console=plain
  )
done

echo
echo "Build completed successfully. Output folder(s):"
for BUILD_VARIANT in "${BUILD_VARIANTS[@]}"; do
  OUTPUT_DIR="$ANDROID_ROOT/app/build/outputs/apk/$BUILD_VARIANT"
  if [[ -d "$OUTPUT_DIR" ]]; then
    echo "  $OUTPUT_DIR"
    find "$OUTPUT_DIR" -maxdepth 1 -type f -name '*.apk' -print
  else
    echo "  Warning: output folder was not found: $OUTPUT_DIR" >&2
  fi
done
