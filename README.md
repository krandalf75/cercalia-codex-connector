# Cercalia Codex Connector

Official Cercalia connector for Codex with MCP tools for geocoding, reverse geocoding, routing, static maps, suggest, isochrones, POI/proximity search, and route optimization workflows.

## Quick Install

### One-line install from GitHub

```bash
bash <(curl -fsSL https://raw.githubusercontent.com/krandalf75/cercalia-codex-connector/main/scripts/install.sh) -- --api-key "your_api_key"
```

### Manual install from local clone

```bash
git clone https://github.com/krandalf75/cercalia-codex-connector.git
cd cercalia-codex-connector
./scripts/install.sh
```
Or explicitly:
```bash
./scripts/install.sh --api-key "your_api_key"
```

Restart Codex to refresh plugin catalog.

## OS-specific Install

### macOS (zsh/bash)

```bash
bash <(curl -fsSL https://raw.githubusercontent.com/krandalf75/cercalia-codex-connector/main/scripts/install.sh) -- --api-key "your_api_key"
```

### Linux (bash)

```bash
bash <(curl -fsSL https://raw.githubusercontent.com/krandalf75/cercalia-codex-connector/main/scripts/install.sh) -- --api-key "your_api_key"
```

### Windows (PowerShell)

```powershell
git clone https://github.com/krandalf75/cercalia-codex-connector.git
cd cercalia-codex-connector
wsl bash ./scripts/install.sh
```

If you do not use WSL, install manually:

1. Copy `plugins/cercalia-services` to `%USERPROFILE%\plugins\cercalia-services`
2. Add marketplace entry in `%USERPROFILE%\.agents\plugins\marketplace.json`
3. Set env var: `CERCALIA_API_KEY`
4. Restart Codex

## Management

```bash
./scripts/doctor.sh
./scripts/uninstall.sh
```

## Repository Structure

- `plugins/cercalia-services/` - Main Codex plugin
- `plugins/cercalia-services/mcp/cercalia-mcp/` - MCP server implementation
- `skills/` - Language-oriented skill prompts/templates
- `marketplace.json` - Repo-local marketplace entry example
- `scripts/install.sh` - Automated installer
- `scripts/uninstall.sh` - Automated uninstaller
- `scripts/doctor.sh` - Environment/install checks

## Features

MCP tools currently implemented:

- `check_api_key`
- `geocode`
- `reverse_geocode`
- `route`
- `static_map`
- `suggest`
- `isochrones`
- `poi_search`
- `proximity_search`
- `route_optimization`

## Requirements

- Node.js 18+
- A valid Cercalia API key

## Configuration

Environment variables used by MCP server:

- `CERCALIA_API_KEY` (required)
- `CERCALIA_BASE_URL` (optional, default `https://lb.cercalia.com/services/v2/json`)

Installer flags:

- `--api-key <key>` sets API key non-interactively (recommended)
- `--base-url <url>` overrides endpoint base URL
- `--no-profile` avoids writing exports to shell profile

## Local MCP Run

```bash
cd plugins/cercalia-services/mcp/cercalia-mcp
node server.mjs
```

## Plugin Wiring

The plugin uses a relative MCP path in `plugins/cercalia-services/.mcp.json`, so it is portable across machines/repositories.

## Branding Assets

- `plugins/cercalia-services/assets/cercalia-logo.svg`
- `plugins/cercalia-services/assets/cercalia-avatar.svg`
- `plugins/cercalia-services/assets/cercalia-favicon.ico`

## License

Add your preferred license file (`LICENSE`) before public distribution.
