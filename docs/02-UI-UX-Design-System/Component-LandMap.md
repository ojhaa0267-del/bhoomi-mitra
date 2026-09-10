---
title: "Component Spec: LandMap GIS Parcel Viewer"
tags:
  - bhoomi-mitra
  - ui-ux
  - leaflet
  - gis
  - components
date: 2026-09-07
---

# 🗺️ Component Spec: LandMap.jsx

> **MOC Link**: [[00-Bhoomi-Mitra-MOC|Back to Master Index]]

## 1. Component Overview
`LandMap.jsx` is the core spatial visualization component of Bhoomi Mitra. It embeds an interactive **Leaflet.js** map container that dynamically centers on the searched plot's GPS coordinates, highlights the parcel polygon, and renders instant visual warning alerts if an encroachment or protected zone buffer is detected.

---

## 2. Interactive Requirements
1. **Dynamic Pan & Zoom (`MapController`)**:
   - Whenever a user searches for a new Bhu-Aadhar ID, the map smoothly pans to `[latitude, longitude]` and zooms in to level `16`.
2. **Color-Coded Risk Polygons**:
   - **Low Risk / Safe**: Green border (`#10B981`), fill opacity `0.35`.
   - **Medium Risk / Warning**: Amber border (`#F59E0B`), fill opacity `0.45`.
   - **High Risk / Dispute / Overlap**: Crimson border (`#EF4444`), fill opacity `0.55` + active border sonar pulse.
3. **Popup Inspection Card**:
   - Shows Parcel ID, Legal Status, Risk Level badge, and a direct Google Maps external navigation link (`https://www.google.com/maps/search/?api=1&query={lat},{lng}`).
4. **Voice Agent Controller Hook**:
   - The map can be directly commanded by the Voice Agent via `[MAP_ACTION: {"lat": ..., "lng": ..., "zoom": ...}]`.

---

## 3. Reference Implementation Snippet

```javascript
import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Polygon, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

function MapController({ center, zoom = 16 }) {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.flyTo(center, zoom, { duration: 1.5 });
    }
  }, [center, zoom, map]);
  return null;
}

export default function LandMap({ latitude, longitude, riskStatus = 'Low', plotName = 'Land Parcel' }) {
  const defaultCenter = [latitude || 28.6139, longitude || 77.2090];
  
  // Approximate boundary polygon square around center coordinates
  const plotCoordinates = [
    [defaultCenter[0] - 0.0012, defaultCenter[1] - 0.0012],
    [defaultCenter[0] - 0.0012, defaultCenter[1] + 0.0012],
    [defaultCenter[0] + 0.0012, defaultCenter[1] + 0.0012],
    [defaultCenter[0] + 0.0012, defaultCenter[1] - 0.0012],
  ];

  const fillOption = {
    color: riskStatus === 'High' ? '#EF4444' : riskStatus === 'Medium' ? '#F59E0B' : '#10B981',
    fillColor: riskStatus === 'High' ? '#EF4444' : riskStatus === 'Medium' ? '#F59E0B' : '#10B981',
    fillOpacity: 0.45,
    weight: 3,
  };

  return (
    <div className={`relative h-[420px] w-full rounded-2xl overflow-hidden shadow-2xl border ${
      riskStatus === 'High' ? 'border-accent-crimson animate-pulse-slow' : 'border-blue-900/30'
    }`}>
      <MapContainer center={defaultCenter} zoom={15} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Polygon pathOptions={fillOption} positions={plotCoordinates}>
          <Popup>
            <div className="p-1 text-slate-900 font-sans">
              <h4 className="font-bold text-sm">{plotName}</h4>
              <p className="text-xs mt-1">Status: <strong className={riskStatus === 'High' ? 'text-red-600' : 'text-emerald-600'}>{riskStatus} Risk</strong></p>
              <a 
                href={`https://www.google.com/maps/search/?api=1&query=${defaultCenter[0]},${defaultCenter[1]}`} 
                target="_blank" 
                rel="noreferrer"
                className="inline-block mt-2 text-xs font-semibold text-blue-600 hover:underline"
              >
                Open in Satellite View ↗
              </a>
            </div>
          </Popup>
        </Polygon>
        <MapController center={defaultCenter} />
      </MapContainer>
    </div>
  );
}
```

---

## 4. Related Notes
- [[Design-Tokens-and-Theme|UI Theme & Styling Tokens]]
- [[GIS-Risk-Assessment|GIS Risk Assessment & Encroachment Logic]]
- [[Voice-Agent-Prompts|Voice Agent Function Calling for Map Zoom]]
