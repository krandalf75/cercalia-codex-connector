---
name: cercalia-ios-routing-geocoding
description: Build and maintain iOS applications using Cercalia APIs for maps, routing, POI, and geospatial workflows.
---

# Cercalia iOS Skill

Use this skill when developing applications that consume Cercalia services.

## Trigger Keywords

cercalia, ios, swift, swiftui, uikit, cocoapods, swift package manager, alamofire, maps sdk, geospatial, gis, geocoding, reverse geocoding, routing, route optimization, matrix, eta, isochrone, poi, proximity, geofence, point in polygon, snap to road, static map, wms, geometry

## Supported Cercalia APIs

- Geocoding: address to coordinates
- Reverse Geocoding: coordinates to address
- Suggest API: autocomplete for addresses/POIs
- Routing API: route calculation, alternatives, ETA
- Route Optimization: multi-stop optimization
- Isochrones: reachable area by time/distance
- POI Search: nearby places and category filtering
- Proximity Search: nearest entities
- Geofencing: point-in-polygon and boundary checks
- Snap to Road: GPS trace map-matching
- Static Maps: map image generation
- WMS Layers: GIS map layers
- Geographic Element Geometry Download: administrative geometries
- Surface Track GPS and Zone Visit Analysis: visited-area and zone checks

## Typical Tasks

1. Generate a minimal client for a specific Cercalia endpoint.
2. Build an address lookup + reverse geocoding feature.
3. Implement route calculation with alternatives and ETA.
4. Add POI and proximity search in a map workflow.
5. Add retries, validation, and integration tests for production use.

## API Key Usage by API

Core REST pattern (shared across APIs):
- Base URL (JSON): `https://lb.cercalia.com/services/v2/json`
- Base URL (XML): `https://lb.cercalia.com/services/xmlgeo`
- Authentication: add `key=YOUR_API_KEY` in each request.

Examples by API family (same key auth pattern):
- Geocoding / Reverse Geocoding / Suggest: `?cmd=...&key=YOUR_API_KEY`
- Routing / Route Optimization / Isochrones: `?cmd=...&key=YOUR_API_KEY`
- POI / Proximity / Geofencing: `?cmd=...&key=YOUR_API_KEY`
- Static Maps / WMS / Geometry download: `?cmd=...&key=YOUR_API_KEY`

SDK auth pattern:
- Server-side SDKs use `api_key` in SDK config (or environment variables such as `CERCALIA_API_KEY`).
- For client-side SDKs (JavaScript Maps, Android, iOS), configure the API key in SDK initialization as documented in the corresponding SDK guide.

## Get API Key

1. Register a client account: https://clients.cercalia.com/register
2. Confirm your account email if required.
3. Sign in to the Cercalia client area and create or copy your API key.
4. Store the key in environment variables (never hardcode in source code).
5. Test one simple endpoint call before full integration.

Recommended environment variable names:
- `CERCALIA_API_KEY`
- `CERCALIA_BASE_URL`

## Installation

```bash
# Follow the official iOS SDK guide.
# Add Swift Package/CocoaPods coordinates once confirmed by Cercalia docs/support.
```

## References

- iOS SDK docs: https://docs.cercalia.com/docs/sdks/client-side/ios/
- Platform docs root: https://docs.cercalia.com/docs/

## Notes

- Verify package versions before implementation.
- If repository/package naming changes, use official docs as source of truth.
- Last reference check: 2026-05-26.
