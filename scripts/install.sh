#!/usr/bin/env bash
set -euo pipefail

PLUGIN_NAME="cercalia-services"
REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SOURCE_PLUGIN_DIR="$REPO_ROOT/plugins/$PLUGIN_NAME"
GITHUB_REPO="${GITHUB_REPO:-krandalf75/cercalia-codex-connector}"
GITHUB_REF="${GITHUB_REF:-main}"
API_KEY="${CERCALIA_API_KEY:-}"
BASE_URL="${CERCALIA_BASE_URL:-https://lb.cercalia.com/services/v2/json}"
PERSIST_PROFILE=1
TARGET_PLUGINS_DIR="$HOME/plugins"
TARGET_PLUGIN_DIR="$TARGET_PLUGINS_DIR/$PLUGIN_NAME"
MARKETPLACE_DIR="$HOME/.agents/plugins"
MARKETPLACE_FILE="$MARKETPLACE_DIR/marketplace.json"
TMP_SOURCE_DIR=""

log() { printf '[install] %s\n' "$1"; }
warn() { printf '[install][warn] %s\n' "$1"; }

require_cmd() {
  if ! command -v "$1" >/dev/null 2>&1; then
    printf '[install][error] Missing required command: %s\n' "$1" >&2
    exit 1
  fi
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --)
      shift
      continue
      ;;
    --api-key)
      API_KEY="${2:-}"
      shift 2
      ;;
    --base-url)
      BASE_URL="${2:-}"
      shift 2
      ;;
    --no-profile)
      PERSIST_PROFILE=0
      shift
      ;;
    *)
      printf '[install][error] Unknown argument: %s\n' "$1" >&2
      printf 'Usage: %s [--api-key <key>] [--base-url <url>] [--no-profile]\n' "$0" >&2
      exit 1
      ;;
  esac
done

require_cmd rsync

if [[ ! -d "$SOURCE_PLUGIN_DIR" ]]; then
  require_cmd curl
  require_cmd tar
  log "Local source not found. Downloading plugin from GitHub ($GITHUB_REPO@$GITHUB_REF)"
  TMP_SOURCE_DIR="$(mktemp -d)"
  trap '[[ -n "$TMP_SOURCE_DIR" && -d "$TMP_SOURCE_DIR" ]] && rm -rf "$TMP_SOURCE_DIR"' EXIT
  curl -fsSL "https://codeload.github.com/${GITHUB_REPO}/tar.gz/refs/heads/${GITHUB_REF}" \
    | tar -xz -C "$TMP_SOURCE_DIR"
  DOWNLOADED_ROOT="$(find "$TMP_SOURCE_DIR" -mindepth 1 -maxdepth 1 -type d | head -n 1)"
  SOURCE_PLUGIN_DIR="$DOWNLOADED_ROOT/plugins/$PLUGIN_NAME"
  if [[ ! -d "$SOURCE_PLUGIN_DIR" ]]; then
    printf '[install][error] Downloaded source missing plugin directory: %s\n' "$SOURCE_PLUGIN_DIR" >&2
    exit 1
  fi
fi

mkdir -p "$TARGET_PLUGINS_DIR"
log "Syncing plugin to $TARGET_PLUGIN_DIR"
rsync -a --delete "$SOURCE_PLUGIN_DIR/" "$TARGET_PLUGIN_DIR/"

mkdir -p "$MARKETPLACE_DIR"
if [[ ! -f "$MARKETPLACE_FILE" ]]; then
  log "Creating marketplace file at $MARKETPLACE_FILE"
  cat > "$MARKETPLACE_FILE" <<JSON
{
  "name": "personal",
  "interface": {
    "displayName": "Personal"
  },
  "plugins": []
}
JSON
fi

log "Updating marketplace entry for $PLUGIN_NAME"
python3 - <<PY
import json
from pathlib import Path

market = Path(r"$MARKETPLACE_FILE")
name = "$PLUGIN_NAME"
entry = {
  "name": name,
  "source": {"source": "local", "path": f"./plugins/{name}"},
  "policy": {"installation": "AVAILABLE"},
  "category": "Productivity"
}

data = json.loads(market.read_text())
if "plugins" not in data or not isinstance(data["plugins"], list):
  data["plugins"] = []

replaced = False
for i, p in enumerate(data["plugins"]):
  if isinstance(p, dict) and p.get("name") == name:
    data["plugins"][i] = entry
    replaced = True
    break

if not replaced:
  data["plugins"].append(entry)

if "name" not in data:
  data["name"] = "personal"
if "interface" not in data or not isinstance(data["interface"], dict):
  data["interface"] = {"displayName": "Personal"}
if "displayName" not in data["interface"]:
  data["interface"]["displayName"] = "Personal"

market.write_text(json.dumps(data, indent=2) + "\n")
PY

if ! command -v node >/dev/null 2>&1; then
  warn "Node.js is not installed. MCP server may not run until Node.js 18+ is installed."
fi

if [[ -z "$API_KEY" ]]; then
  printf 'Enter your CERCALIA_API_KEY: '
  read -r API_KEY
fi

if [[ -z "$API_KEY" ]]; then
  printf '[install][error] CERCALIA_API_KEY is required.\n' >&2
  exit 1
fi

log "Configuring MCP environment in $TARGET_PLUGIN_DIR/.mcp.json"
python3 - <<PY
import json
from pathlib import Path

f = Path(r"$TARGET_PLUGIN_DIR/.mcp.json")
data = json.loads(f.read_text())
srv = data.setdefault("mcpServers", {}).setdefault("cercalia", {})
env = srv.setdefault("env", {})
env["CERCALIA_API_KEY"] = r"$API_KEY"
env["CERCALIA_BASE_URL"] = r"$BASE_URL"
f.write_text(json.dumps(data, indent=2) + "\n")
PY

if [[ "$PERSIST_PROFILE" -eq 1 ]]; then
  shell_name="$(basename "${SHELL:-}")"
  profile="$HOME/.zshrc"
  if [[ "$shell_name" == "bash" ]]; then
    profile="$HOME/.bashrc"
  fi
  if [[ ! -f "$profile" ]] || ! grep -q '^export CERCALIA_API_KEY=' "$profile" 2>/dev/null; then
    {
      echo ''
      echo '# Cercalia Codex Connector'
      printf 'export CERCALIA_API_KEY="%s"\n' "$API_KEY"
      printf 'export CERCALIA_BASE_URL="%s"\n' "$BASE_URL"
    } >> "$profile"
    log "Saved CERCALIA env vars to $profile"
  fi
fi

log "Install complete. Restart Codex to refresh plugin catalog."
log "Installed plugin: $TARGET_PLUGIN_DIR"
log "Marketplace: $MARKETPLACE_FILE"
