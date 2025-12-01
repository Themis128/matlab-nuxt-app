#!/usr/bin/env bash
set -euo pipefail

MODE=${1:-hide}
ROOTDIR=$(cd "$(dirname "$0")/.." && pwd -P)
SETTINGSDIR="$ROOTDIR/settings-controls"
TARGET="$ROOTDIR/settings.json"

case "$MODE" in
  hide)
    SRC="$SETTINGSDIR/settings-hide.json"
    ;;
  show)
    SRC="$SETTINGSDIR/settings-show.json"
    ;;
  *)
    echo "Usage: $0 [hide|show]"
    exit 2
    ;;
esac

if [ ! -f "$SRC" ]; then
  echo "Source not found: $SRC" >&2
  exit 1
fi

cp -f "$SRC" "$TARGET"
echo "Applied settings: $MODE to $TARGET"
echo "Reload VS Code or run 'Developer: Reload Window' to apply changes."
