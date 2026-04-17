import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet'; // Import the Leaflet library for custom icons
import 'leaflet/dist/leaflet.css'; // <-- CRUCIAL: You must import the Leaflet CSS

// --- TypeScript Types ---
// Assuming UserDetails is defined in a types file like this:
// export interface UserDetails {
//   name: string;
//   address: string;
//   phone: string;
// }
import { UserDetails } from '../types'; // Adjust the import path as needed

interface UserDetailsStepProps {
  onComplete: (details: UserDetails & { city: string }) => void;
}

function ResizeMap() {
  const map = useMap();

  useEffect(() => {
    setTimeout(() => {
      map.invalidateSize();
    }, 200);
  }, [map]);

  return null;
}
// --- City Data with Real Geographic Coordinates ---
const CITIES_DATA = [
    { name: "Karachi", position: [24.8607, 67.0011] as L.LatLngExpression },
    { name: "Lahore", position: [31.5820, 74.3294] as L.LatLngExpression },
    { name: "Islamabad", position: [33.6844, 73.0479] as L.LatLngExpression },
    { name: "Rawalpindi", position: [33.5651, 73.0169] as L.LatLngExpression },
    { name: "Peshawar", position: [34.0151, 71.5249] as L.LatLngExpression },
    { name: "Quetta", position: [30.1798, 66.9750] as L.LatLngExpression },
    { name: "Faisalabad", position: [31.4504, 73.1350] as L.LatLngExpression },
    { name: "Multan", position: [30.1575, 71.5249] as L.LatLngExpression },
    { name: "Sialkot", position: [32.4945, 74.5229] as L.LatLngExpression },
    { name: "Gujranwala", position: [32.1877, 74.1885] as L.LatLngExpression },
    { name: "Sargodha", position: [32.0836, 72.6711] as L.LatLngExpression },
    { name: "Bahawalpur", position: [29.3544, 71.6911] as L.LatLngExpression },
    { name: "Sukkur", position: [27.7244, 68.8672] as L.LatLngExpression },
    { name: "Hyderabad", position: [25.3960, 68.3578] as L.LatLngExpression },
];

const CITY_NAMES = CITIES_DATA.map(c => c.name);

// --- Custom Icon Logic for Map Markers ---
const createCustomIcon = (isSelected: boolean): L.DivIcon => {
  return L.divIcon({
    className: `custom-map-marker ${isSelected ? 'selected' : ''}`,
    html: `<div class="marker-pin"></div><div class="marker-pulse"></div>`,
    iconSize: [30, 42],
    iconAnchor: [15, 42],
  });
};


// ─────────────────────────────────────────────────────────────────
//  Dedicated Interactive Map Component
// ─────────────────────────────────────────────────────────────────
interface InteractiveMapProps {
  selectedCity: string;
  onCitySelect: (city: string) => void;
}

const isDarkMode =
  document.documentElement.classList.contains('dark') ||
  document.body.classList.contains('dark');

function InteractiveMap({ selectedCity, onCitySelect }: InteractiveMapProps) {
  const pakistanCenter: L.LatLngExpression = [30.3753, 69.3451];

  const isDarkMode =
    document.documentElement.classList.contains('dark') ||
    document.body.classList.contains('dark');

  return (
    <MapContainer 
      center={pakistanCenter} 
      zoom={6} 
      style={{ height: '100%', width: '100%', borderRadius: '14px' }}
    >
      <ResizeMap />

      <TileLayer
        attribution='&copy; OpenStreetMap contributors'
        url={
          isDarkMode
            ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        }
      />

      {CITIES_DATA.map(city => (
        <Marker
          key={city.name}
          position={city.position}
          icon={createCustomIcon(selectedCity === city.name)}
          eventHandlers={{
            click: () => onCitySelect(city.name),
          }}
        >
          <Popup>{city.name}</Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}

// ─────────────────────────────────────────────────────────────────
//  Main User Details Step Component
// ─────────────────────────────────────────────────────────────────
export default function UserDetailsStep({ onComplete }: UserDetailsStepProps) {
  const [details, setDetails] = useState({
    name: '',
    address: '',
    phone: '',
    city: ''
  });

  const isValid = details.name && details.address && details.phone && details.city;

  const handleCitySelect = (city: string) => {
    setDetails(d => ({ ...d, city }));
  };

  return (
    <div className="screen uds-wrap">
      <style>{CSS}</style>

      {/* ── Header ── */}
      <div className="uds-header">
        <h1 className="uds-title display">Your Details</h1>
        <p className="uds-sub">Select your city on the interactive map to continue.</p>
      </div>

      {/* ── Form Body ── */}
      <div className="uds-body">
        <div className="uds-form-stack">
          <div className="uds-input-group">
            <label className="uds-label">Full Name</label>
            <input type="text" placeholder="e.g., Ahmed Hassan" value={details.name} onChange={(e) => setDetails(d => ({ ...d, name: e.target.value }))} className="uds-input" />
          </div>
          <div className="uds-input-group">
            <label className="uds-label">Property Address</label>
            <input type="text" placeholder="e.g., House 42, Block C, DHA" value={details.address} onChange={(e) => setDetails(d => ({ ...d, address: e.target.value }))} className="uds-input" />
          </div>
          <div className="uds-input-group">
            <label className="uds-label">Phone Number</label>
            <input type="tel" placeholder="e.g., +92 300 1234567" value={details.phone} onChange={(e) => setDetails(d => ({ ...d, phone: e.target.value }))} className="uds-input" />
          </div>
        </div>

        <div className="uds-map-section">
          <label className="uds-label">Installation City</label>
          <div className="uds-map-container">
            <InteractiveMap selectedCity={details.city} onCitySelect={handleCitySelect} />
          </div>
          <div className="uds-select-wrapper">
            <select value={details.city} onChange={(e) => handleCitySelect(e.target.value)} className="uds-select">
              <option value="" disabled>Or select from this list...</option>
              {CITY_NAMES.sort().map(city => <option key={city} value={city}>{city}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* ── Footer / Continue Button ── */}
      <div className="uds-footer">
        <button disabled={!isValid} onClick={() => onComplete(details)} className="uds-button">
          Continue
          <svg viewBox="0 0 16 16" fill="none" width={16} height={16}>
            <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
//  Component Styles
// ─────────────────────────────────────────────────────────────────
const CSS = `
:root {
  --primary-accent: var(--accent, #0EA5E9);
  --primary-accent-alpha: var(--p-alpha, rgba(14,165,233,0.3));
}

.uds-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 48px 32px 72px;
  max-width: 900px;   /* Increased width */
  margin: 0 auto;
  width: 100%;
}
.uds-header { text-align: center; max-width: 600px; margin-bottom: 48px; }
.uds-eyebrow { display: inline-block; font-size: 11px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: var(--muted); background: var(--input-bg, rgba(128,128,128,0.1)); border: 1px solid var(--border, rgba(128,128,128,0.15)); border-radius: 100px; padding: 4px 12px; margin-bottom: 16px; }
.uds-title { font-size: clamp(24px, 4.5vw, 44px) !important; font-weight: 700; color: var(--fg); letter-spacing: -0.5px; line-height: 1.15; margin: 0 0 14px !important; }
.uds-sub { font-size: 16px; color: var(--muted); line-height: 1.6; margin: 0; }

.uds-body { width: 100%; display: grid; grid-template-columns: 1fr; gap: 40px; }
@media (min-width: 768px) { 
  .uds-body { 
    grid-template-columns: 1.1fr 1.4fr; /* Expanded both sides */
    gap: 56px;
    align-items: flex-start; 
  } 
}
.uds-form-stack { display: flex; flex-direction: column; gap: 24px; }
.uds-input-group { display: flex; flex-direction: column; gap: 8px; }
.uds-label { font-size: 11px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: var(--muted); }
.uds-input { font-size: 15px; width: 100%; background: var(--input-bg, rgba(128,128,128,0.1)); border: 1.5px solid var(--border, rgba(128,128,128,0.15)); border-radius: 12px; padding: 14px 16px; color: var(--fg); outline: none; transition: border-color 0.2s, box-shadow 0.2s; }
.uds-input::placeholder { color: var(--muted); opacity: 0.6; }
.uds-input:focus { border-color: var(--primary-accent); box-shadow: 0 0 0 3px var(--primary-accent-alpha); }

/* --- Interactive Map Styles --- */
.uds-map-section { display: flex; flex-direction: column; gap: 16px; }
.uds-map-container {
  height: 420px;
  position: relative;
  background: var(--input-bg, rgba(128,128,128,0.07));
  border: 1.5px solid var(--border, rgba(128,128,128,0.15));
  border-radius: 14px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
}
.leaflet-pane { z-index: 1; }
.leaflet-control-zoom, .leaflet-control-attribution { z-index: 2; }

/* --- Custom Marker Styles --- */
.custom-map-marker .marker-pin {
  width: 30px;
  height: 30px;
  border-radius: 50% 50% 50% 0;
  background: var(--muted);
  border: 2px solid #fff;
  transform: rotate(-45deg);
  position: absolute;
  left: 0;
  top: 0;
  box-shadow: 0 4px 8px rgba(0,0,0,0.2);
  transition: background 0.2s ease;
}
.custom-map-marker:hover .marker-pin {
  background: var(--primary-accent);
}

.custom-map-marker .marker-pulse {
  background: var(--primary-accent-alpha);
  border-radius: 50%;
  height: 14px;
  width: 14px;
  position: absolute;
  left: 8px;
  top: 8px;
  transform: rotate(45deg);
  opacity: 0;
}

.custom-map-marker.selected .marker-pin {
  background: var(--primary-accent);
  animation: bounce 0.5s ease-out forwards;
}

.custom-map-marker.selected .marker-pulse {
  animation: pulse 1.5s ease-out infinite;
}

@keyframes pulse {
  0% { transform: rotate(45deg) scale(0.5); opacity: 0.8; }
  100% { transform: rotate(45deg) scale(2.5); opacity: 0; }
}

@keyframes bounce {
  0% { transform: rotate(-45deg) translateY(0); }
  50% { transform: rotate(-45deg) translateY(-15px); }
  100% { transform: rotate(-45deg) translateY(0); }
}
.leaflet-popup-content-wrapper {
  background: var(--surface);
  color: var(--fg);
}

.leaflet-popup-tip {
  background: var(--surface);
}
.uds-select-wrapper { margin-top: 0; }
.uds-select {
  font-size: 15px;
  width: 100%;
  background: var(--input-bg, rgba(128,128,128,0.1));
  border: 1.5px solid var(--border, rgba(128,128,128,0.15));
  border-radius: 22px;
  padding: 24px 16px;
  color: var(--fg);
  outline: none;
  cursor: pointer;
  appearance: none;

  background-image: url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http://www.w3.org/2000/svg%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%236B7280%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22/%3E%3C/svg%3E');
  background-repeat: no-repeat;
  background-position: right 16px center;
  background-size: 1em;
}
/* Dropdown options */
.uds-select option {
  background-color: var(--surface, #fff);
  color: var(--fg, #000);
}

.uds-footer { grid-column: 1 / -1; max-width: 340px; margin: 40px auto 0; padding-top: 24px; border-top: 1px solid var(--border, rgba(128,128,128,0.15)); width: 100%; }
.uds-button { width: 100%; padding: 16px 24px; border-radius: 100px; font-size: 14px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: #fff; background: var(--primary-accent); border: none; cursor: pointer; transition: all 0.2s ease; display: flex; align-items: center; justify-content: center; gap: 8px; }
.uds-button:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(14,165,233,0.3); }
.uds-button:disabled { background: var(--input-bg, rgba(128,128,128,0.1)); color: var(--muted); cursor: not-allowed; }
.uds-button svg { transition: transform 0.2s ease; }
.uds-button:hover:not(:disabled) svg { transform: translateX(3px); }
`;