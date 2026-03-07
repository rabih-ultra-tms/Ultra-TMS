# Google Maps Integration Guide

> AI Dev Guide | Google Maps API usage in Load Planner (geocoding, distance, routing)

---

## Overview

Google Maps is used exclusively in the **Load Planner** (`/load-planner/[id]/edit`) -- a PROTECTED component at 9/10 quality. DO NOT modify the Load Planner code.

## APIs Used

### 1. Geocoding API

Converts addresses to lat/lng coordinates.

```
Use case: When user enters a pickup/delivery address
Input: "123 Main St, Dallas, TX 75201"
Output: { lat: 32.7767, lng: -96.7970 }
```

### 2. Distance Matrix API

Calculates driving distance and time between points.

```
Use case: Auto-calculate miles and transit time for rate calculation
Input: Origin coordinates, destination coordinates
Output: { distanceMiles: 920, durationHours: 14 }
```

### 3. Directions API

Provides turn-by-turn routing for map display.

```
Use case: Draw route on map in Load Planner
Input: Origin, destination, waypoints (intermediate stops)
Output: Polyline path, step-by-step directions
```

### 4. Places Autocomplete API

Address autocomplete as user types.

```
Use case: Address input fields in Load Planner
Input: Partial address "123 Mai..."
Output: Suggested complete addresses
```

## Environment Variables

```bash
# Required for Load Planner
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIza...

# Enable these APIs in Google Cloud Console:
# - Geocoding API
# - Distance Matrix API
# - Directions API
# - Places API
# - Maps JavaScript API
```

**IMPORTANT:** The key must be prefixed with `NEXT_PUBLIC_` to be available in the browser.

## Usage in Load Planner

The Load Planner uses Google Maps for:

1. **Address entry** -- Places Autocomplete for pickup/delivery addresses
2. **Route visualization** -- Directions API to draw the route on an embedded map
3. **Distance calculation** -- Distance Matrix to auto-fill mileage
4. **Rate estimation** -- Miles * rate-per-mile for carrier rate suggestions
5. **Multi-stop routing** -- Waypoint support for loads with intermediate stops

## Cost Considerations

| API | Cost per 1000 requests | Monthly free tier |
|-----|----------------------|-------------------|
| Geocoding | $5.00 | $200 credit |
| Distance Matrix | $5.00 (elements) | $200 credit |
| Directions | $5.00 | $200 credit |
| Places Autocomplete | $2.83 | $200 credit |

Google provides $200/month free credit. For development, this is usually sufficient.

## Security

- API key is restricted to specific HTTP referrers in Google Cloud Console
- Key is client-side (NEXT_PUBLIC_) -- cannot be hidden, must be restricted
- Server-side geocoding for batch operations uses a separate key without `NEXT_PUBLIC_` prefix

## Other Potential Map Uses (Future)

| Feature | Status | Maps API Needed |
|---------|--------|----------------|
| Tracking Map (`/operations/tracking`) | Not Built | Maps JavaScript API + real-time markers |
| Dispatch Board (map view) | Not Built | Maps JavaScript API |
| Customer Portal tracking | Not Built | Maps JavaScript API |
| Lane analysis | Not Built | Distance Matrix (batch) |

## Fallback Behavior

If Google Maps API key is not configured:
- Load Planner shows a warning banner
- Address fields work as plain text inputs (no autocomplete)
- Distance must be entered manually
- Map component shows placeholder
