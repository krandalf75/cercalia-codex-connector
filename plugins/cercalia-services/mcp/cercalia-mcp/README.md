# Cercalia MCP Server

MCP server exposing Cercalia tools:

- `geocode`
- `reverse_geocode`
- `route`
- `static_map`
- `suggest`
- `isochrones`
- `poi_search`
- `proximity_search`
- `route_optimization`
- `check_api_key`

## Environment

Set these variables where the MCP server runs:

- `CERCALIA_API_KEY` (required)
- `CERCALIA_BASE_URL` (optional, default `https://lb.cercalia.com/services/v2/json`)

## Run (local test)

```bash
cd plugins/cercalia-services/mcp/cercalia-mcp
node server.mjs
```

## Notes

- This version uses GET requests to Core REST JSON endpoint.
- Tool responses are returned as JSON text content.
- Depending on your Cercalia plan and endpoint specifics, some command parameter names may need adjustment.
