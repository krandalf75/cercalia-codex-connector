#!/usr/bin/env bash
set -euo pipefail

PLUGIN_NAME="cercalia-services"
TARGET_PLUGIN_DIR="$HOME/plugins/$PLUGIN_NAME"
MARKETPLACE_FILE="$HOME/.agents/plugins/marketplace.json"

log() { printf '[uninstall] %s\n' "$1"; }
warn() { printf '[uninstall][warn] %s\n' "$1"; }

if [[ -d "$TARGET_PLUGIN_DIR" ]]; then
  rm -rf "$TARGET_PLUGIN_DIR"
  log "Removed plugin directory: $TARGET_PLUGIN_DIR"
else
  warn "Plugin directory not found: $TARGET_PLUGIN_DIR"
fi

if [[ -f "$MARKETPLACE_FILE" ]]; then
  python3 - <<PY
import json
from pathlib import Path

market = Path(r"$MARKETPLACE_FILE")
name = "$PLUGIN_NAME"
data = json.loads(market.read_text())
plugins = data.get("plugins", [])
data["plugins"] = [p for p in plugins if not (isinstance(p, dict) and p.get("name") == name)]
market.write_text(json.dumps(data, indent=2) + "\n")
PY
  log "Removed marketplace entry from: $MARKETPLACE_FILE"
else
  warn "Marketplace file not found: $MARKETPLACE_FILE"
fi

log "Uninstall complete. Restart Codex to refresh plugin catalog."
