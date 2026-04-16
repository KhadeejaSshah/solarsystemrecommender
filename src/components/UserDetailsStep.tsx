// import React, { useState } from 'react';
// import { UserDetails } from '../types';

// /* ─────────────────────────────────────────────────────────────────
//    User Details Step — with a region-based interactive Pakistan map.
//    Features a focus/blur effect for city selection.
//    All colours via CSS variables → dark mode safe.
// ───────────────────────────────────────────────────────────────── */

// interface UserDetailsStepProps {
//   onComplete: (details: UserDetails & { city: string }) => void;
// }

// // Data for the city regions, making the SVG rendering cleaner
// const CITIES_DATA = [
//   { name: "Islamabad", path: "M440 260 L480 260 L490 300 L450 310 Z" },
//   { name: "Lahore", path: "M500 380 L540 390 L530 430 L490 420 Z" },
//   { name: "Karachi", path: "M360 690 L420 700 L410 750 L350 740 Z" },
//   { name: "Peshawar", path: "M390 230 L430 230 L420 260 L380 250 Z" },
//   { name: "Quetta", path: "M280 500 L330 500 L320 550 L270 540 Z" },
//   { name: "Multan", path: "M470 470 L510 480 L500 520 L460 510 Z" },
//   { name: "Faisalabad", path: "M480 330 L520 340 L510 380 L470 370 Z" }, // Added Faisalabad
//   { name: "Sialkot", path: "M510 290 L550 300 L540 340 L500 330 Z" }, // Added Sialkot
// ];

// const CITY_NAMES = CITIES_DATA.map(c => c.name);

// export default function UserDetailsStep({ onComplete }: UserDetailsStepProps) {
//   const [details, setDetails] = useState({
//     name: '',
//     address: '',
//     phone: '',
//     city: ''
//   });

//   const isValid = details.name && details.address && details.phone && details.city;

//   const handleCitySelect = (city: string) => {
//     setDetails(d => ({ ...d, city }));
//   };

//   return (
//     <div className="screen uds-wrap">
//       <style>{CSS}</style>

//       {/* ── Header ── */}
//       <div className="uds-header">
//         <span className="uds-eyebrow">Solar Sizing Wizard · Step 1 of 4</span>
//         <h1 className="uds-title display">Your Details</h1>
//         <p className="uds-sub">First, tell us who you are and where you'll be installing the system.</p>
//       </div>

//       {/* ── Form Body ── */}
//       <div className="uds-body">
//         <div className="uds-form-stack">
//           {/* Inputs */}
//           <div className="uds-input-group">
//             <label className="uds-label">Full Name</label>
//             <input type="text" placeholder="e.g., Ahmed Hassan" value={details.name} onChange={(e) => setDetails(d => ({ ...d, name: e.target.value }))} className="uds-input" />
//           </div>
//           <div className="uds-input-group">
//             <label className="uds-label">Property Address</label>
//             <input type="text" placeholder="e.g., House 42, Block C, DHA" value={details.address} onChange={(e) => setDetails(d => ({ ...d, address: e.target.value }))} className="uds-input" />
//           </div>
//           <div className="uds-input-group">
//             <label className="uds-label">Phone Number</label>
//             <input type="tel" placeholder="e.g., +92 300 1234567" value={details.phone} onChange={(e) => setDetails(d => ({ ...d, phone: e.target.value }))} className="uds-input" />
//           </div>
//         </div>

//         <div className="uds-map-section">
//           <label className="uds-label">Installation City</label>
//           <div className="uds-map-container">
//             {/* Pakistan Map SVG */}
//             <svg viewBox="0 0 800 900" className="uds-map">
//               <defs>
//                 <filter id="map-blur">
//                   <feGaussianBlur stdDeviation="2" />
//                 </filter>
//               </defs>
//               <g className={`uds-map-base ${details.city ? 'uds-map-base--dimmed' : ''}`}>
//                 <path d="M520 60 L480 90 L450 120 L420 160 L390 190 L360 220 L340 250 L310 280 L280 320 L260 350 L230 390 L210 420 L200 460 L210 500 L230 540 L250 580 L280 610 L320 650 L350 680 L390 710 L430 730 L470 740 L520 720 L560 690 L590 650 L610 610 L620 560 L630 520 L620 480 L600 440 L580 400 L560 360 L550 320 L540 290 L520 260 L500 230 L520 200 L540 170 L560 140 L550 100 Z" />
//               </g>

//               {CITIES_DATA.map(city => {
//                 const isSelected = details.city === city.name;
//                 const isBlurred = details.city && !isSelected;

//                 return (
//                   <path
//                     key={city.name}
//                     className={`uds-city ${isSelected ? 'uds-city--selected' : ''}`}
//                     d={city.path}
//                     onClick={() => handleCitySelect(city.name)}
//                     style={{ filter: isBlurred ? 'url(#map-blur)' : 'none' }}
//                   />
//                 );
//               })}
//             </svg>
            
//             <div className="uds-select-wrapper">
//               <select value={details.city} onChange={(e) => handleCitySelect(e.target.value)} className="uds-select">
//                 <option value="" disabled>Select from list...</option>
//                 {CITY_NAMES.map(city => <option key={city} value={city}>{city}</option>)}
//               </select>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* ── Footer / Continue Button ── */}
//       <div className="uds-footer">
//         <button disabled={!isValid} onClick={() => onComplete(details)} className="uds-button">
//           Continue
//           <svg viewBox="0 0 16 16" fill="none" width={16} height={16}>
//             <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
//           </svg>
//         </button>
//       </div>
//     </div>
//   );
// }

// const CSS = `
// /* Theme variables mapped for this component */
// :root {
//   --map-base: var(--input-bg, rgba(128,128,128,0.1));
//   --map-border: var(--border, rgba(128,128,128,0.2));
//   --primary-accent: var(--accent, #0EA5E9);
//   --primary-accent-alpha: var(--p-alpha, rgba(14,165,233,0.2));
// }

// .uds-wrap {
//   display: flex;
//   flex-direction: column;
//   align-items: center;
//   padding: 48px 24px 72px;
//   max-width: 900px;
//   margin: 0 auto;
// }
// .uds-header {
//   text-align: center;
//   max-width: 600px;
//   margin-bottom: 48px;
//   display: flex;
//   flex-direction: column;
//   align-items: center;
// }
// .uds-eyebrow {
//   display: inline-block;
//   font-size: 11px;
//   font-weight: 600;
//   letter-spacing: 0.1em;
//   text-transform: uppercase;
//   color: var(--muted);
//   background: var(--input-bg, rgba(128,128,128,0.1));
//   border: 1px solid var(--border, rgba(128,128,128,0.15));
//   border-radius: 100px;
//   padding: 4px 12px;
//   margin-bottom: 16px;
// }
// .uds-title {
//   font-size: clamp(24px, 4.5vw, 44px) !important;
//   font-weight: 700;
//   color: var(--fg);
//   letter-spacing: -0.5px;
//   line-height: 1.15;
//   margin: 0 0 14px !important;
// }
// .uds-sub {
//   font-size: 16px;
//   color: var(--muted);
//   line-height: 1.6;
//   margin: 0;
// }

// /* Form Body */
// .uds-body {
//   width: 100%;
//   display: grid;
//   grid-template-columns: 1fr;
//   gap: 40px;
// }
// @media (min-width: 768px) {
//   .uds-body {
//     grid-template-columns: 1fr 1.1fr; /* Give map a bit more space */
//     gap: 48px;
//     align-items: flex-start;
//   }
// }

// .uds-form-stack { display: flex; flex-direction: column; gap: 24px; }
// .uds-input-group { display: flex; flex-direction: column; gap: 8px; }
// .uds-label { font-size: 11px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: var(--muted); }
// .uds-input {
//   font-size: 15px;
//   width: 100%;
//   background: var(--input-bg, rgba(128,128,128,0.1));
//   border: 1.5px solid var(--border, rgba(128,128,128,0.15));
//   border-radius: 12px;
//   padding: 14px 16px;
//   color: var(--fg);
//   outline: none;
//   transition: border-color 0.2s, box-shadow 0.2s;
// }
// .uds-input::placeholder { color: var(--muted); opacity: 0.6; }
// .uds-input:focus {
//   border-color: var(--primary-accent);
//   box-shadow: 0 0 0 3px var(--primary-accent-alpha);
// }

// /* Map Section */
// .uds-map-section { display: flex; flex-direction: column; gap: 8px; }
// .uds-map-container {
//   position: relative;
//   background: var(--input-bg, rgba(128,128,128,0.07));
//   border: 1.5px solid var(--border, rgba(128,128,128,0.15));
//   border-radius: 14px;
//   padding: 20px;
//   overflow: hidden;
// }
// .uds-map { width: 100%; height: auto; }

// /* SVG Map Styling */
// .uds-map-base { transition: opacity 0.3s ease; }
// .uds-map-base--dimmed { opacity: 0.5; }
// .uds-map-base path {
//   fill: var(--map-base);
//   stroke: var(--map-border);
//   stroke-width: 2;
// }

// .uds-city {
//   fill: transparent;
//   stroke: var(--primary-accent);
//   stroke-width: 2;
//   cursor: pointer;
//   transition: all 0.3s ease;
// }
// .uds-city:hover {
//   fill: var(--primary-accent-alpha);
// }
// .uds-city--selected {
//   fill: var(--primary-accent-alpha);
//   stroke-width: 3.5;
// }

// .uds-select-wrapper { margin-top: 16px; }
// .uds-select {
//   font-size: 15px;
//   width: 100%;
//   background: var(--surface, #fff);
//   border: 1.5px solid var(--border, rgba(128,128,128,0.15));
//   border-radius: 12px;
//   padding: 14px 16px;
//   color: var(--fg);
//   outline: none;
//   cursor: pointer;
//   appearance: none;
//   background-image: url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22currentColor%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C/polyline%3E%3C/svg%3E');
//   background-repeat: no-repeat;
//   background-position: right 16px center;
//   background-size: 1em;
// }

// /* Footer */
// .uds-footer {
//   grid-column: 1 / -1;
//   max-width: 340px;
//   margin: 40px auto 0;
//   padding-top: 24px;
//   border-top: 1px solid var(--border, rgba(128,128,128,0.15));
//   width: 100%;
// }
// .uds-button {
//   width: 100%;
//   padding: 16px 24px;
//   border-radius: 100px;
//   font-size: 14px;
//   font-weight: 700;
//   letter-spacing: 0.08em;
//   text-transform: uppercase;
//   color: #fff;
//   background: var(--primary-accent);
//   border: none;
//   cursor: pointer;
//   transition: all 0.2s ease;
//   display: flex;
//   align-items: center;
//   justify-content: center;
//   gap: 8px;
// }
// .uds-button:hover:not(:disabled) {
//   transform: translateY(-2px);
//   box-shadow: 0 4px 12px rgba(14,165,233,0.3);
// }
// .uds-button:disabled {
//   background: var(--input-bg, rgba(128,128,128,0.1));
//   color: var(--muted);
//   cursor: not-allowed;
// }
// .uds-button svg { transition: transform 0.2s ease; }
// .uds-button:hover:not(:disabled) svg { transform: translateX(3px); }
// `;
import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
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

function InteractiveMap({ selectedCity, onCitySelect }: InteractiveMapProps) {
  const pakistanCenter: L.LatLngExpression = [30.3753, 69.3451];

  return (
    <MapContainer center={pakistanCenter} zoom={6} style={{ height: '100%', width: '100%', borderRadius: '14px' }}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
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
        <span className="uds-eyebrow">Solar Sizing Wizard · Step 1 of 4</span>
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
  padding: 48px 24px 72px;
  max-width: 900px;
  margin: 0 auto;
}
.uds-header { text-align: center; max-width: 600px; margin-bottom: 48px; }
.uds-eyebrow { display: inline-block; font-size: 11px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: var(--muted); background: var(--input-bg, rgba(128,128,128,0.1)); border: 1px solid var(--border, rgba(128,128,128,0.15)); border-radius: 100px; padding: 4px 12px; margin-bottom: 16px; }
.uds-title { font-size: clamp(24px, 4.5vw, 44px) !important; font-weight: 700; color: var(--fg); letter-spacing: -0.5px; line-height: 1.15; margin: 0 0 14px !important; }
.uds-sub { font-size: 16px; color: var(--muted); line-height: 1.6; margin: 0; }

.uds-body { width: 100%; display: grid; grid-template-columns: 1fr; gap: 40px; }
@media (min-width: 768px) { .uds-body { grid-template-columns: 1fr 1.1fr; gap: 48px; align-items: flex-start; } }

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

.uds-select-wrapper { margin-top: 0; }
.uds-select { font-size: 15px; width: 100%; background: var(--surface, #fff); border: 1.5px solid var(--border, rgba(128,128,128,0.15)); border-radius: 12px; padding: 14px 16px; color: var(--fg); outline: none; cursor: pointer; appearance: none; background-image: url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22currentColor%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C/polyline%3E%3C/svg%3E'); background-repeat: no-repeat; background-position: right 16px center; background-size: 1em; }

.uds-footer { grid-column: 1 / -1; max-width: 340px; margin: 40px auto 0; padding-top: 24px; border-top: 1px solid var(--border, rgba(128,128,128,0.15)); width: 100%; }
.uds-button { width: 100%; padding: 16px 24px; border-radius: 100px; font-size: 14px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: #fff; background: var(--primary-accent); border: none; cursor: pointer; transition: all 0.2s ease; display: flex; align-items: center; justify-content: center; gap: 8px; }
.uds-button:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(14,165,233,0.3); }
.uds-button:disabled { background: var(--input-bg, rgba(128,128,128,0.1)); color: var(--muted); cursor: not-allowed; }
.uds-button svg { transition: transform 0.2s ease; }
.uds-button:hover:not(:disabled) svg { transform: translateX(3px); }
`;