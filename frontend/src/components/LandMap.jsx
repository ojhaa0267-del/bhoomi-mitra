/**
 * LandMap.jsx – Interactive GIS Parcel Viewer (React-Leaflet)
 *
 * Implements all specifications from leaflet-react-guide.md:
 *  - Feature A: Cyber Dark mode (OSM + CSS filter) & Live Satellite (ESRI ArcGIS)
 *  - Feature B: Browser Geolocation with fallback to Kolkata Pincode 700039
 *  - Feature C: Custom Area Selection (Bounding Box Tool)
 *  - Feature D: Dynamic Risk Levels (Crimson / Amber / Emerald) with sonar rings
 *  - Feature E: One-click turn-by-turn Google Maps navigation
 *  - Feature F: In-browser Haversine distance & travel time estimation engine
 */
import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import {
  MapContainer,
  TileLayer,
  Polygon,
  Popup,
  Marker,
  Circle,
  Rectangle,
  useMap,
  useMapEvents,
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { API_BASE_URL } from '../config';
import { searchVicinity, getAdjacentPlots } from '../utils/api';

// ── Fallback & Kolkata Defaults ──────────────────────────────────────────
const DEFAULT_USER_LOCATION = {
  lat: 22.5385,
  lng: 88.3850,
  pincode: '700039',
  label: 'Topsia / Tangra (Pincode 700039)',
};

// ── Risk colour config ───────────────────────────────────────────────────
const RISK_COLORS = {
  High:   { stroke: '#EF4444', fill: '#EF4444', fillOpacity: 0.40, weight: 3 },
  Medium: { stroke: '#F59E0B', fill: '#F59E0B', fillOpacity: 0.35, weight: 2.5 },
  Low:    { stroke: '#10B981', fill: '#10B981', fillOpacity: 0.28, weight: 2 },
};

// ── Custom Pulsing User Location Marker Icon (zero broken asset icons) ───
const createUserPinIcon = () =>
  L.divIcon({
    className: 'bhoomi-user-gps-marker',
    html: `
      <div style="position: relative; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center;">
        <div style="position: absolute; width: 26px; height: 26px; border-radius: 9999px; background: rgba(59, 130, 246, 0.4); animation: ping 1.8s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
        <div style="position: relative; width: 14px; height: 14px; border-radius: 9999px; background: #2563EB; border: 2.5px solid #FFFFFF; box-shadow: 0 0 10px rgba(37, 99, 235, 0.8);"></div>
      </div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });

const createAdjacentPinIcon = () =>
  L.divIcon({
    className: 'custom-adjacent-pin',
    html: `
      <div style="position: relative; display: flex; justify-content: center; align-items: center; width: 100%; height: 100%;">
        <div style="position: absolute; width: 24px; height: 24px; border-radius: 9999px; background: rgba(16, 185, 129, 0.2);"></div>
        <div style="position: relative; width: 12px; height: 12px; border-radius: 9999px; background: #10B981; border: 2px solid #FFFFFF; box-shadow: 0 0 8px rgba(16, 185, 129, 0.8);"></div>
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });

const createSelectedAreaIcon = () =>
  L.divIcon({
    className: 'custom-selected-pin',
    html: `
      <div style="position: relative; display: flex; justify-content: center; align-items: center; width: 100%; height: 100%;">
        <div style="position: absolute; width: 32px; height: 32px; border-radius: 9999px; background: rgba(245, 158, 11, 0.2); animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
        <div style="position: relative; width: 16px; height: 16px; border-radius: 9999px; background: #F59E0B; border: 3px solid #0B1528; box-shadow: 0 0 12px rgba(245, 158, 11, 0.8);"></div>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });

// ── Haversine Distance Calculation Engine ────────────────────────────────
function calculateHaversineDistance(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return null;
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const straightDistanceKm = R * c;
  const estimatedDrivingKm = straightDistanceKm * 1.25; // 25% road curve factor

  return {
    straightKm: straightDistanceKm.toFixed(1),
    drivingKm: estimatedDrivingKm.toFixed(1),
    estimatedMinutes: Math.max(1, Math.round((estimatedDrivingKm / 28) * 60)), // 28 km/h local speed
  };
}

// ── Internal map controller (smooth flyTo) ───────────────────────────────
function MapFlyController({ center, zoom }) {
  const map = useMap();
  const prev = useRef(null);

  useEffect(() => {
    if (!center) return;
    const key = `${center[0]},${center[1]}`;
    if (prev.current === key) return;
    prev.current = key;
    map.flyTo(center, zoom ?? 15, { duration: 1.5, easeLinearity: 0.25 });
  }, [center, zoom, map]);

  return null;
}

// ── Unit Conversion Engine ─────────────────────────────────────────────────
const AREA_UNITS = {
  sqm: { label: 'Sq M', multiplier: 1 },
  katta: { label: 'Katta', multiplier: 66.89 },
  bigha: { label: 'Bigha', multiplier: 1337.8 },
  acre: { label: 'Acre', multiplier: 4046.86 },
  gaj: { label: 'Gaj', multiplier: 0.836 },
};

const PLOT_TYPES = [
  { id: 'residential', label: 'Residential', ratio: 1.0 }, // 1:1 aspect
  { id: 'commercial', label: 'Commercial', ratio: 1.5 },   // 1.5:1
  { id: 'agricultural', label: 'Agricultural', ratio: 2.0 }, // 2:1
];

// ── Interactive Map Click Handler for Custom Area Selection (Feature C) ───
function AreaSelectListener({ isSelecting, onAreaSelected, areaSqm, plotType }) {
  useMapEvents({
    click(e) {
      if (!isSelecting) return;
      const ratio = PLOT_TYPES.find(p => p.id === plotType)?.ratio || 1.0;
      const heightMeters = Math.sqrt(areaSqm / ratio);
      const widthMeters = heightMeters * ratio;
      
      const deltaLat = (heightMeters / 2) / 111111;
      const latRad = e.latlng.lat * (Math.PI / 180);
      const deltaLng = (widthMeters / 2) / (111111 * Math.cos(latRad));

      const bounds = {
        minLat: e.latlng.lat - deltaLat,
        maxLat: e.latlng.lat + deltaLat,
        minLng: e.latlng.lng - deltaLng,
        maxLng: e.latlng.lng + deltaLng,
        areaSqm,
        plotType
      };
      onAreaSelected(bounds);
    },
  });
  return null;
}

// ── Build parcel boundary polygon ────────────────────────────────────────
function buildPlotPolygon(lat, lng, deltaLat = 0.0014, deltaLng = 0.0018) {
  return [
    [lat - deltaLat, lng - deltaLng],
    [lat - deltaLat, lng + deltaLng],
    [lat + deltaLat, lng + deltaLng],
    [lat + deltaLat, lng - deltaLng],
  ];
}

// ── Resize Observer for map container ──────────────────────────────────────
function MapResizeController() {
  const map = useMap();
  useEffect(() => {
    const container = map.getContainer();
    const resizeObserver = new ResizeObserver(() => {
      map.invalidateSize();
    });
    resizeObserver.observe(container);
    return () => resizeObserver.disconnect();
  }, [map]);
  return null;
}

// ── Main LandMap Component ───────────────────────────────────────────────
const LandMap = forwardRef(function LandMap(
  {
    latitude = 22.4280,
    longitude = 88.3980,
    riskLevel = 'Low',
    bhuAadharId = '',
    ownerName = '',
    targetMouza = '',
    zoom = 15,
    onSimulateSearch,
  },
  ref
) {
  const [mapLayer, setMapLayer] = useState('dark'); // 'dark' | 'satellite'
  const [userLocation, setUserLocation] = useState(DEFAULT_USER_LOCATION);
  const [isGpsLive, setIsGpsLive] = useState(false);
  const [isSelectingArea, setIsSelectingArea] = useState(false);
  const [selectedAreaBounds, setSelectedAreaBounds] = useState(null);

  // Area Marking Control State
  const [areaValue, setAreaValue] = useState(1);
  const [areaUnit, setAreaUnit] = useState('katta');
  const [plotType, setPlotType] = useState('agricultural');

  // Vicinity Prompt & Data
  const [showVicinityPrompt, setShowVicinityPrompt] = useState(false);
  const [vicinityData, setVicinityData] = useState(null);
  const [isFetchingVicinity, setIsFetchingVicinity] = useState(false);

  // Adjacent Plots State
  const [adjacentPlots, setAdjacentPlots] = useState([]);
  const [isSnapModalOpen, setIsSnapModalOpen] = useState(false);

  const mapRef = useRef(null);
  const plotCenter = [latitude, longitude];
  const polygon = buildPlotPolygon(latitude, longitude);
  const colors = RISK_COLORS[riskLevel] ?? RISK_COLORS.Low;

  // 1. User Geolocation Detection with Instant Fallback
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            pincode: 'Active GPS',
            label: 'Your Live Location (GPS)',
          });
          setIsGpsLive(true);
        },
        () => {
          console.log('GPS permission denied. Using fallback: Pincode 700039 (Topsia/Tangra)');
        },
        { enableHighAccuracy: false, timeout: 6000 }
      );
    }
  }, []);

  // Keyboard Shortcuts for Area Marking
  useEffect(() => {
    if (!isSelectingArea) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setIsSelectingArea(false);
      if (e.key === 'ArrowUp' || e.key === '+') setAreaValue(v => Number((v + 0.1).toFixed(2)));
      if (e.key === 'ArrowDown' || e.key === '-') setAreaValue(v => Math.max(0.1, Number((v - 0.1).toFixed(2))));
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSelectingArea]);

  // Fetch Adjacent Plots on Mount
  useEffect(() => {
    if (!bhuAadharId) return;
    getAdjacentPlots(bhuAadharId, null)
      .then(data => {
        if (data.adjacent_count > 0) {
          setAdjacentPlots(data.adjacent_plots);
          setIsSnapModalOpen(true);
        } else {
          setAdjacentPlots([]);
          setIsSnapModalOpen(false);
        }
      })
      .catch(err => console.error("Error fetching adjacent plots:", err));
  }, [bhuAadharId]);

  // 2. Haversine Distance Engine
  const distanceInfo = calculateHaversineDistance(
    userLocation.lat,
    userLocation.lng,
    latitude,
    longitude
  );

  // 3. Google Maps Turn-by-Turn Navigation URL
  const gmapsNavigationUrl = `https://www.google.com/maps/dir/?api=1&origin=${userLocation.lat},${userLocation.lng}&destination=${latitude},${longitude}&travelmode=driving`;

  // Expose flyTo for voice-agent commands
  useImperativeHandle(ref, () => ({
    flyTo(lat, lng, z = 16) {
      mapRef.current?.flyTo([lat, lng], z, { duration: 1.6 });
    },
    selectAreaMode(enable = true) {
      setIsSelectingArea(enable);
    },
  }));

  const riskBorderClass =
    riskLevel === 'High'
      ? 'border-2 border-red-500 shadow-glow-crimson animate-pulse-slow'
      : riskLevel === 'Medium'
      ? 'border border-amber-500/60 shadow-glow-amber'
      : 'border border-emerald-500/40 shadow-glow-emerald';

  return (
    <div className="w-full h-full flex flex-col rounded-2xl overflow-hidden bg-[#070F1E] border border-slate-800 shadow-2xl">
      {/* ── Top Header Location Bar ──────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-3.5 py-2 bg-[#0B1528] border-b border-slate-800 text-[11px] select-none">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 relative">
            {isGpsLive && (
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
            )}
            <span
              className={`relative inline-flex rounded-full h-2 w-2 ${
                isGpsLive ? 'bg-blue-500' : 'bg-amber-400'
              }`}
            />
          </span>
          <span className="text-slate-400">User Origin:</span>
          <strong className="text-slate-200 font-medium">
            {userLocation.pincode === 'Active GPS' ? 'Live GPS' : 'Pincode 700039'}
          </strong>
          <span className="text-slate-500 font-mono text-[10px]">
            ({userLocation.lat.toFixed(3)}, {userLocation.lng.toFixed(3)})
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-slate-400">Target Area:</span>
          <strong className="text-blue-400 font-medium truncate max-w-[220px]">
            {targetMouza || (bhuAadharId ? `Plot #${bhuAadharId.slice(-6)}` : 'Dakshin Gobindopur (700145)')}
          </strong>
        </div>
      </div>

      {/* ── Main Map Viewport ────────────────────────────────────────────── */}
      <div className={`relative flex-1 h-full min-h-0 w-full overflow-hidden isolate ${riskBorderClass}`}>
        {/* Risk Banner Badge */}
        {riskLevel === 'High' && (
          <div className="absolute top-3 left-3 z-[500] flex items-center gap-2 bg-red-600/90 backdrop-blur-sm text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg pointer-events-none">
            <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
            HIGH RISK · Active Court Dispute
          </div>
        )}
        {riskLevel === 'Medium' && (
          <div className="absolute top-3 left-3 z-[500] flex items-center gap-2 bg-amber-500/90 backdrop-blur-sm text-black text-xs font-bold px-3 py-1.5 rounded-full shadow-lg pointer-events-none">
            <span className="w-2 h-2 rounded-full bg-black/50 animate-pulse" />
            CAUTION · Buffer Overlap
          </div>
        )}
        {riskLevel === 'Low' && (
          <div className="absolute top-3 left-3 z-[500] flex items-center gap-2 bg-emerald-600/90 backdrop-blur-sm text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg pointer-events-none">
            <span className="w-2 h-2 rounded-full bg-white" />
            VERIFIED · Clean Title
          </div>
        )}
        {/* Map Overlay Badge (V4 Design) */}
        <div className="absolute top-12 left-3 z-[400] bg-slate-900/90 backdrop-blur-md border border-slate-700 px-3 py-2 rounded-xl text-xs flex items-center space-x-2 pointer-events-none shadow-lg">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
          <span className="font-semibold text-slate-200">GIS Satellite Grid: {targetMouza || (bhuAadharId ? `Plot #${bhuAadharId.slice(-6)}` : 'Dakshin Gobindopur (700145)')}</span>
        </div>
        {/* Floating Controls: Layer Toggle Only */}
        <div className="absolute top-3 right-3 z-[1000] flex flex-col gap-2 items-end">
          <div className="flex items-center gap-1.5 bg-slate-900/90 backdrop-blur-md border border-slate-700/60 rounded-xl p-1 shadow-2xl">
            {/* Layer Modes */}
            <button
              type="button"
              onClick={() => setMapLayer('dark')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                mapLayer === 'dark'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              🗺️ Cyber Dark
            </button>
            <button
              type="button"
              onClick={() => setMapLayer('satellite')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                mapLayer === 'satellite'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              🛰️ Satellite
            </button>
          </div>
        </div>

        {/* ── Leaflet Map Container ──────────────────────────────────────── */}
        <MapContainer
          center={plotCenter}
          zoom={zoom}
          ref={mapRef}
          style={{ height: '100%', width: '100%' }}
          zoomControl={true}
          scrollWheelZoom={true}
        >
          <MapResizeController />
          {mapLayer === 'dark' ? (
            /* OpenStreetMap Tiles with Dark Mode CSS Filter */
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              className="osm-dark-tiles"
              maxZoom={19}
            />
          ) : (
            /* High-Resolution ESRI World Imagery Satellite Layer */
            <TileLayer
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              attribution='Tiles &copy; Esri'
              maxZoom={19}
            />
          )}

          {/* User Location Marker */}
          <Marker position={[userLocation.lat, userLocation.lng]} icon={createUserPinIcon()}>
            <Popup>
              <div className="p-1 text-slate-200">
                <div className="font-bold text-xs text-blue-400 mb-1">
                  📍 {userLocation.label}
                </div>
                <div className="text-[10px] text-slate-400 font-mono">
                  GPS: {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}
                </div>
                <div className="mt-1 text-[10px] text-emerald-400">
                  Origin reference for route navigation
                </div>
              </div>
            </Popup>
          </Marker>

          {/* Target Parcel Boundary Polygon */}
          <Polygon
            pathOptions={{
              color: colors.stroke,
              fillColor: colors.fill,
              fillOpacity: colors.fillOpacity,
              weight: colors.weight,
              dashArray: riskLevel === 'High' ? '6 4' : null,
            }}
            positions={polygon}
          >
            <Popup>
              <div className="min-w-[190px] p-0.5">
                <div className="flex items-center gap-2 mb-1.5">
                  <span
                    className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                      riskLevel === 'High'
                        ? 'bg-red-500'
                        : riskLevel === 'Medium'
                        ? 'bg-amber-500'
                        : 'bg-emerald-500'
                    }`}
                  />
                  <h4 className="font-bold text-sm text-slate-100 truncate">
                    {ownerName || 'Target Land Parcel'}
                  </h4>
                </div>
                {bhuAadharId && (
                  <p className="text-[10px] text-slate-400 font-mono mb-1">
                    Bhu-Aadhar: <span className="text-slate-200">{bhuAadharId}</span>
                  </p>
                )}
                <p className="text-xs text-slate-300 mb-2">
                  Risk Level:{' '}
                  <strong
                    className={
                      riskLevel === 'High'
                        ? 'text-red-400'
                        : riskLevel === 'Medium'
                        ? 'text-amber-400'
                        : 'text-emerald-400'
                    }
                  >
                    {riskLevel} Risk
                  </strong>
                </p>
                <div className="pt-2 border-t border-slate-700/60 flex flex-col gap-1.5">
                  <a
                    href={gmapsNavigationUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    🚗 Open Driving Route ↗
                  </a>
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-400 hover:text-slate-200 transition-colors"
                  >
                    🛰️ Google Satellite View ↗
                  </a>
                </div>
              </div>
            </Popup>
          </Polygon>

          {/* Adjacent Plots Markers */}
          {adjacentPlots.map((plot, idx) => (
            <Marker key={idx} position={[plot.latitude, plot.longitude]} icon={createAdjacentPinIcon()}>
              <Popup>
                <div className="p-1 text-slate-200 min-w-[150px]">
                  <div className="font-bold text-xs text-blue-400 mb-1 flex items-center gap-1">
                    <span>🔗</span> Neighbor Plot
                  </div>
                  <div className="text-[10px] text-slate-300 mb-0.5">
                    <strong>Owner:</strong> {plot.owner}
                  </div>
                  <div className="text-[10px] text-slate-300 mb-0.5">
                    <strong>Distance:</strong> {(plot.distance_km * 1000).toFixed(0)}m
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono mt-1">
                    Bhu-Aadhar: {plot.bhu_aadhar_id}
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}

          {/* Mark Area Selection Mode Ring */}
          {isSelectingArea && (
            <Circle
              center={plotCenter}
              radius={140}
              pathOptions={{
                color: '#38BDF8',
                fillOpacity: 0.1,
                fillColor: '#0EA5E9',
                weight: 2,
                dashArray: '6 8',
                interactive: false
              }}
            />
          )}

          {/* Custom Drawn Area Selection Box */}
          {selectedAreaBounds && (
            <>
              <Rectangle
                bounds={[
                  [selectedAreaBounds.minLat, selectedAreaBounds.minLng],
                  [selectedAreaBounds.maxLat, selectedAreaBounds.maxLng],
                ]}
                pathOptions={{
                  color: '#10B981', // Emerald green
                  fillColor: '#34D399',
                  fillOpacity: 0.35,
                  weight: 3,
                  dashArray: '8 6',
                  interactive: false
                }}
              />
              <Marker
                position={[
                  (selectedAreaBounds.minLat + selectedAreaBounds.maxLat) / 2,
                  (selectedAreaBounds.minLng + selectedAreaBounds.maxLng) / 2
                ]}
                icon={createSelectedAreaIcon()}
              >
                <Popup autoPan={false}>
                  <div className="text-xs p-1 text-slate-200 font-sans min-w-[140px]">
                    <strong className="text-emerald-400 text-sm flex items-center gap-1">📍 Marked Area</strong>
                    <p className="text-[11px] text-slate-300 mt-1">
                      Type: {selectedAreaBounds.plotType.charAt(0).toUpperCase() + selectedAreaBounds.plotType.slice(1)}
                    </p>
                    <p className="text-[11px] text-slate-300 mt-0.5">
                      Area: <span className="font-mono text-emerald-400 font-bold">{selectedAreaBounds.areaSqm.toFixed(1)}</span> Sq.M
                    </p>
                  </div>
                </Popup>
              </Marker>
            </>
          )}

          <MapFlyController center={plotCenter} zoom={zoom} />
          <AreaSelectListener
            isSelecting={isSelectingArea}
            areaSqm={areaValue * (AREA_UNITS[areaUnit]?.multiplier || 1)}
            plotType={plotType}
            onAreaSelected={(bounds) => {
              setSelectedAreaBounds(bounds);
              setIsSelectingArea(false);
              setShowVicinityPrompt(true);
            }}
          />
        </MapContainer>

        {/* GPS Coordinates Badge */}
        <div className="absolute bottom-2.5 right-2.5 z-[500] bg-[#070F1E]/85 backdrop-blur-sm text-slate-400 text-[10px] font-mono px-2 py-0.5 rounded-lg border border-blue-900/40 pointer-events-none">
          {latitude.toFixed(4)}, {longitude.toFixed(4)}
        </div>

        {/* Snap to Nearest Cluster Modal / Toast */}
        {isSnapModalOpen && adjacentPlots.length > 0 && (
          <div className="absolute top-20 left-1/2 transform -translate-x-1/2 z-[3000] w-[320px] bg-slate-900/95 backdrop-blur-xl border border-blue-400/50 rounded-2xl p-4 shadow-[0_20px_50px_rgba(0,0,0,0.5)] animate-slide-down-fade">
            <div className="flex justify-between items-start mb-2">
              <h4 className="text-sm font-bold text-blue-400 flex items-center gap-2">
                <span className="text-lg">✨</span> Smart Suggestion
              </h4>
              <button onClick={() => setIsSnapModalOpen(false)} className="text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 w-6 h-6 rounded-full flex items-center justify-center transition-colors">
                ✕
              </button>
            </div>
            <p className="text-xs text-slate-200 mb-4 leading-relaxed">
              We found a cluster of <strong className="text-emerald-400 font-bold bg-emerald-400/10 px-1 py-0.5 rounded">{adjacentPlots.length} verified plots</strong> nearby. Want to jump to the action?
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  if (mapRef.current) {
                    const group = L.featureGroup([
                      L.marker([latitude, longitude]),
                      ...adjacentPlots.map(p => L.marker([p.latitude, p.longitude]))
                    ]);
                    mapRef.current.fitBounds(group.getBounds().pad(0.2));
                  }
                  setIsSnapModalOpen(false);
                }}
                className="flex-1 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold py-1.5 rounded-lg transition-colors"
              >
                Snap to Cluster
              </button>
            </div>
          </div>
        )}

        {vicinityData && (
          <div className="absolute bottom-10 md:bottom-0 left-0 w-full z-[2000] bg-[#070F1E]/95 backdrop-blur-md border-t border-blue-500/30 p-3 md:p-4 pb-4 max-h-[45vh] md:max-h-[300px] overflow-y-auto custom-scrollbar animate-slide-up-fade shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
            <div className="absolute top-4 right-4 flex items-center gap-2">
              <button onClick={() => setVicinityData(null)} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors">✕</button>
            </div>
            
            <div className="flex items-start gap-3 mb-3">
              <div className="hidden sm:flex w-10 h-10 rounded-full bg-blue-500/10 border border-blue-500/20 items-center justify-center text-xl shrink-0 shadow-inner shadow-blue-500/10">🗺️</div>
              <div className="min-w-0">
                <h3 className="text-base font-black text-white tracking-wide flex flex-wrap items-center gap-2">
                  {vicinityData.estimated_mouza}
                  <span className="bg-emerald-500/20 text-emerald-400 text-[10px] px-2 py-0.5 rounded-full border border-emerald-500/30 uppercase tracking-widest font-bold">VERIFIED</span>
                </h3>
                <p className="text-xs text-blue-300 font-medium mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
                  <span className="flex items-center gap-1"><span>📍</span> {vicinityData.district}</span>
                  <span className="text-slate-600 text-[10px]">●</span>
                  <span className="flex items-center gap-1"><strong className="text-amber-400">{vicinityData.total_surrounding_plots}</strong> Surrounding Plots</span>
                </p>
              </div>
            </div>

            <h4 className="text-[10px] md:text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">Surrounding Area Records</h4>
            <div className="flex overflow-x-auto gap-3 pb-2 custom-scrollbar snap-x">
              {vicinityData.surrounding_plots.map((plot, idx) => (
                <div key={idx} className="min-w-[260px] sm:min-w-[280px] snap-center shrink-0 bg-slate-900/50 hover:bg-slate-800/80 border border-slate-800 hover:border-blue-500/30 p-3 rounded-xl transition-all group cursor-default">
                  <div className="flex justify-between items-start mb-2">
                    <div className="text-[10px] font-mono text-slate-400 px-1.5 py-0.5 bg-slate-950 rounded-md border border-slate-800 group-hover:border-blue-900/50 transition-colors">
                      ID: {plot.bhu_aadhar_id}
                    </div>
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md ${
                      plot.risk_level === 'High' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 
                      plot.risk_level === 'Medium' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 
                      'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    }`}>
                      {plot.risk_level} Risk
                    </span>
                  </div>
                  <div className="text-xs font-bold text-slate-200 truncate">{plot.owner_name}</div>
                  <div className="text-[10px] text-slate-400 flex items-center gap-1.5 mt-1">
                    <span>📄 {plot.dag_no}, {plot.khatian_no}</span>
                    <span className="text-slate-600">•</span>
                    <span className="text-amber-400/80">{plot.land_type}</span>
                  </div>
                  <div className="mt-3 pt-2 border-t border-slate-800 flex items-center justify-between">
                    <div className="text-[10px] font-medium text-emerald-400">
                      ₹{(plot.circle_rate_inr / 100000).toFixed(1)}L / Katta
                    </div>
                    <div className="text-[10px] text-slate-500 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                      {plot.distance_meters}m away
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Vicinity Confirmation Prompt & Details Drawer ─────────────────────────── */}
        {showVicinityPrompt && selectedAreaBounds && !vicinityData && (
          <div className="absolute bottom-10 md:bottom-4 left-2 right-2 sm:left-4 sm:right-4 bg-[#0B1528]/95 backdrop-blur-md border border-amber-500/30 p-4 rounded-2xl animate-slide-up z-[2000] shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h4 className="text-amber-400 font-bold text-sm flex items-center gap-2">📍 Nayi Location Mark Ki Gayi!</h4>
                <p className="text-slate-300 text-xs mt-1">
                  Aapne {selectedAreaBounds.areaSqm.toFixed(0)} Sq.M ka area select kiya hai. Kya aapko is location ki details dekhni hai?
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <button onClick={() => setShowVicinityPrompt(false)} className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors whitespace-nowrap">
                  ✕ Cancel
                </button>
                <button
                  onClick={() => {
                    setIsFetchingVicinity(true);
                    searchVicinity({
                        center_lat: (selectedAreaBounds.minLat + selectedAreaBounds.maxLat) / 2,
                        center_lng: (selectedAreaBounds.minLng + selectedAreaBounds.maxLng) / 2,
                        radius_km: 1.5,
                        area_sqm: selectedAreaBounds.areaSqm,
                        plot_type: selectedAreaBounds.plotType
                    }, null)
                    .then(data => {
                      setVicinityData(data);
                      if (onSimulateSearch && data.target_location_profile) {
                        onSimulateSearch(data.target_location_profile);
                      }
                      setIsFetchingVicinity(false);
                      setShowVicinityPrompt(false);
                    })
                    .catch(err => {
                      console.error("Error fetching vicinity:", err);
                      setIsFetchingVicinity(false);
                    });
                  }}
                  disabled={isFetchingVicinity}
                  className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl transition-colors shadow-lg shadow-emerald-600/20 disabled:opacity-50 flex items-center gap-2 whitespace-nowrap"
                >
                  {isFetchingVicinity ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : '✓'}
                  {isFetchingVicinity ? 'Loading...' : 'Haan, Details Dikhao'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Area Marking Control Deck (Below Map) ────────────────────────────── */}
      <div className="bg-[#0f172a] border-t border-slate-800 p-3 sm:p-4 shrink-0">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          
          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => {
                setIsSelectingArea(prev => !prev);
                if (selectedAreaBounds) {
                  setSelectedAreaBounds(null);
                  setShowVicinityPrompt(false);
                  setVicinityData(null);
                }
              }}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all shadow-lg flex items-center gap-2 whitespace-nowrap ${
                isSelectingArea
                  ? 'bg-amber-500 text-black shadow-amber-500/25 animate-pulse'
                  : 'bg-blue-600 text-white hover:bg-blue-500 shadow-blue-500/20'
              }`}
            >
              <span>📐</span>
              {isSelectingArea ? 'Click Map to Place...' : 'Mark Area'}
            </button>
            
            <div className="flex items-center gap-2 bg-slate-900/60 p-1 rounded-xl border border-slate-800 flex-1 sm:flex-none">
              <button onClick={() => setAreaValue(v => Math.max(0.1, Number((v - 0.1).toFixed(2))))} className="px-2 py-1 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg text-xs font-bold transition-colors">－</button>
              <input type="number" value={areaValue} onChange={e => setAreaValue(Number(e.target.value))} step="0.1" min="0.1" className="w-12 bg-transparent text-center text-sm font-bold text-amber-400 focus:outline-none" />
              <button onClick={() => setAreaValue(v => Number((v + 0.1).toFixed(2)))} className="px-2 py-1 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg text-xs font-bold transition-colors">＋</button>
            </div>
            
            <select value={areaUnit} onChange={e => setAreaUnit(e.target.value)} className="bg-slate-900/60 border border-slate-800 rounded-xl text-xs px-3 py-2 text-white font-semibold focus:outline-none focus:border-blue-500 transition-colors">
              {Object.entries(AREA_UNITS).map(([key, unit]) => (
                <option key={key} value={key}>{unit.label}</option>
              ))}
            </select>
            
            <select value={plotType} onChange={e => setPlotType(e.target.value)} className="bg-slate-900/60 border border-slate-800 rounded-xl text-xs px-3 py-2 text-white font-semibold focus:outline-none focus:border-blue-500 transition-colors hidden sm:block">
              {PLOT_TYPES.map(type => (
                <option key={type.id} value={type.id}>{type.label}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto overflow-x-auto custom-scrollbar pb-1 sm:pb-0">
            <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mr-1 whitespace-nowrap">Presets:</span>
            {[
              { label: '1 Katta', val: 1, unit: 'katta' },
              { label: '5 Katta', val: 5, unit: 'katta' },
              { label: '1 Bigha', val: 1, unit: 'bigha' },
              { label: '1 Acre', val: 1, unit: 'acre' },
            ].map(preset => (
              <button
                key={preset.label}
                onClick={() => { setAreaValue(preset.val); setAreaUnit(preset.unit); setIsSelectingArea(true); }}
                className="px-2.5 py-1 text-[10px] font-bold text-slate-300 bg-slate-800 hover:bg-slate-700 hover:text-white rounded-lg border border-slate-700/50 transition-colors whitespace-nowrap"
              >
                {preset.label}
              </button>
            ))}
            {selectedAreaBounds && (
              <button onClick={() => { setSelectedAreaBounds(null); setShowVicinityPrompt(false); setVicinityData(null); }} className="ml-2 px-2.5 py-1 text-[10px] font-bold text-red-400 hover:bg-red-500/10 rounded-lg transition-colors whitespace-nowrap">
                ✕ Clear
              </button>
            )}
          </div>
          
        </div>
      </div>

      {/* ── Navigation Footer Action Bar (Features E & F) ────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-[#0B1528] border-t border-slate-800 shrink-0">
        <div className="text-xs text-slate-300 flex items-center gap-2">
          <span className="text-slate-500">Distance from Origin:</span>
          {distanceInfo ? (
            <div className="flex items-center gap-2">
              <strong className="text-white font-semibold">
                ~{distanceInfo.drivingKm} km
              </strong>
              <span className="text-slate-400">
                ({distanceInfo.estimatedMinutes} mins drive)
              </span>
              <span className="hidden sm:inline text-[10px] text-slate-500 font-mono">
                [Straight: {distanceInfo.straightKm} km]
              </span>
            </div>
          ) : (
            <span className="text-slate-500">Calculating...</span>
          )}
        </div>

        <a
          href={gmapsNavigationUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white text-xs font-semibold px-3.5 py-1.5 rounded-lg transition-all shadow-lg hover:shadow-blue-500/25"
        >
          <span>📍</span>
          <span>Navigate on Google Maps</span>
          <span className="text-[10px] opacity-75">↗</span>
        </a>
      </div>
    </div>
  );
});

export default LandMap;

