#!/usr/bin/env bash
set -euo pipefail

PLUGIN_NAME="cercalia-services"
PLUGIN_DIR="$HOME/plugins/$PLUGIN_NAME"
MARKETPLACE_FILE="$HOME/.agents/plugins/marketplace.json"
MCP_SERVER="$PLUGIN_DIR/mcp/cercalia-mcp/server.mjs"

ok() { printf '[doctor][ok] %s\n' "$1"; }
warn() { printf '[doctor][warn] %s\n' "$1"; }
err() { printf '[doctor][error] %s\n' "$1"; }

status=0

if command -v node >/dev/null 2>&1; then
  ok "node found: $(node -v)"
else
  err "node not found (required for MCP server)"
  status=1
fi

if [[ -n "${CERCALIA_API_KEY:-}" ]]; then
  ok "CERCALIA_API_KEY is set in current shell"
else
  warn "CERCALIA_API_KEY is not set in current shell"
fi

if [[ -d "$PLUGIN_DIR" ]]; then
  ok "plugin directory exists: $PLUGIN_DIR"
else
  err "plugin directory missing: $PLUGIN_DIR"
  status=1
fi

if [[ -f "$MCP_SERVER" ]]; then
  ok "MCP server exists: $MCP_SERVER"
else
  err "MCP server missing: $MCP_SERVER"
  status=1
fi

if [[ -f "$MARKETPLACE_FILE" ]]; then
  if python3 - <<PY
import json
from pathlib import Path
f = Path(r"$MARKETPLACE_FILE")
data = json.loads(f.read_text())
name = "$PLUGIN_NAME"
plugins = data.get("plugins", [])
found = any(isinstance(p, dict) and p.get("name") == name for p in plugins)
raise SystemExit(0 if found else 1)
PY
  then
    ok "marketplace entry found in $MARKETPLACE_FILE"
  else
    err "marketplace entry for $PLUGIN_NAME missing in $MARKETPLACE_FILE"
    status=1
  fi
else
  err "marketplace file missing: $MARKETPLACE_FILE"
  status=1
fi

if [[ $status -eq 0 ]]; then
  ok "All checks passed"
else
  err "One or more checks failed"
fi

exit $status
