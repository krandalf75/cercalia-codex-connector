# Cercalia Codex Connector

Official Cercalia connector for Codex with MCP tools for geocoding, reverse geocoding, routing, static maps, suggest, isochrones, POI/proximity search, and route optimization workflows.

## Repository Structure

- `plugins/cercalia-services/` - Main Codex plugin
- `plugins/cercalia-services/mcp/cercalia-mcp/` - MCP server implementation
- `skills/` - Language-oriented skill prompts/templates
- `marketplace.json` - Repo-local marketplace entry example

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

Set environment variables where MCP runs:

- `CERCALIA_API_KEY` (required)
- `CERCALIA_BASE_URL` (optional, default `https://lb.cercalia.com/services/v2/json`)

## Local Run

```bash
cd plugins/cercalia-services/mcp/cercalia-mcp
node server.mjs
```

## Plugin Wiring

The plugin uses relative MCP path in:

- `plugins/cercalia-services/.mcp.json`

So it is portable across machines/repositories.

## Branding Assets

- `plugins/cercalia-services/assets/cercalia-logo.svg`
- `plugins/cercalia-services/assets/cercalia-avatar.svg`
- `plugins/cercalia-services/assets/cercalia-favicon.ico`

## Publish Notes

1. Validate plugin:

```bash
python3 /Users/arovira/.codex/skills/.system/plugin-creator/scripts/validate_plugin.py plugins/cercalia-services
```

2. Push to GitHub:

```bash
git push -u origin main
```

## License

Add your preferred license file (`LICENSE`) before public distribution.
