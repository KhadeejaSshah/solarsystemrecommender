import React, { useState } from "react";
import { HouseType } from "../types";

/* ─────────────────────────────────────────────────────────────────
   All surface / text colours use CSS custom properties so the
   component automatically adapts to light AND dark themes.
   Accent colours (green, purple, gray) remain literal because
   they carry brand meaning and are legible on both backgrounds.
───────────────────────────────────────────────────────────────── */

const tiers: {
  id: HouseType;
  label: string;
  badge?: string;
  tagline: string;
  target: string;
  capacity: string;
  powers: string[];
  support: string;
  accent: string;
  accentAlpha: string;
  icon: React.ReactNode;
}[] = [
  {
    id: "apartment",
    label: "Smart Lite",
    tagline: "Compact home, shared walls",
    target: "Up to 10 Marla / 250 yards / Portions",
    capacity: "5–10 kW · 10 kWh Smart Battery",
    powers: ["Basic lights & fans", "Fridge & LED TV", "1–2 Inverter ACs"],
    support: "Mobile App + Cloud Monitoring",
    accent: "#6B7280",
    accentAlpha: "rgba(107,114,128,0.12)",
    icon: (
      <svg viewBox="0 0 40 40" fill="none" width={38} height={38}>
        <rect x="8" y="18" width="24" height="16" rx="1" stroke="currentColor" strokeWidth="1.5" />
        <path d="M4 20L20 6L36 20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <rect x="16" y="26" width="8" height="8" rx="0.5" stroke="currentColor" strokeWidth="1.5" />
        <rect x="11" y="22" width="5" height="4" rx="0.5" stroke="currentColor" strokeWidth="1.25" />
        <rect x="24" y="22" width="5" height="4" rx="0.5" stroke="currentColor" strokeWidth="1.25" />
      </svg>
    ),
  },
  {
    id: "house",
    badge: "Most Popular",
    label: "Smart Plus",
    tagline: "Full home backup for 1–2 Kanal",
    target: "1–2 Kanal / 500 yards Houses",
    capacity: "15–30 kW · 20–40 kWh Smart Battery",
    powers: ["Full home backup", "4–6 ACs + Water Pump", "Built-in EV Charger"],
    support: "Mobile App + Cloud Monitoring",
    accent: "#16A34A",
    accentAlpha: "rgba(22,163,74,0.12)",
    icon: (
      <svg viewBox="0 0 40 40" fill="none" width={38} height={38}>
        <rect x="6" y="18" width="28" height="17" rx="1" stroke="currentColor" strokeWidth="1.5" />
        <path d="M3 20L20 4L37 20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <rect x="16" y="27" width="8" height="8" rx="0.5" stroke="currentColor" strokeWidth="1.5" />
        <rect x="9" y="22" width="6" height="5" rx="0.5" stroke="currentColor" strokeWidth="1.25" />
        <rect x="25" y="22" width="6" height="5" rx="0.5" stroke="currentColor" strokeWidth="1.25" />
        <path d="M24 11L26 13.5L31 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    id: "estate",
    label: "Estate Max",
    tagline: "Large estates, high-capacity loads",
    target: "Farmhouses / Large Estates / 1000 yards+",
    capacity: "50 kW+ · High-Capacity Lithium Bank",
    powers: ["Centralized cooling & pools", "Lifts & heavy equipment", "Multiple EV Chargers"],
    support: "24/7 Dedicated NOC Support",
    accent: "#7C3AED",
    accentAlpha: "rgba(124,58,237,0.12)",
    icon: (
      <svg viewBox="0 0 40 40" fill="none" width={38} height={38}>
        <rect x="4" y="20" width="32" height="16" rx="1" stroke="currentColor" strokeWidth="1.5" />
        <path d="M2 22L20 6L38 22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <rect x="8" y="24" width="7" height="12" rx="0.5" stroke="currentColor" strokeWidth="1.25" />
        <rect x="25" y="24" width="7" height="12" rx="0.5" stroke="currentColor" strokeWidth="1.25" />
        <rect x="17" y="27" width="6" height="9" rx="0.5" stroke="currentColor" strokeWidth="1.5" />
        <rect x="14" y="10" width="12" height="6" rx="0.5" stroke="currentColor" strokeWidth="1.25" />
        <path d="M20 10V7M14 13H10M26 13H30" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
      </svg>
    ),
  },
];

export default function HousingSelection({ onSelect }: { onSelect: (house: HouseType) => void }) {
  const [hovered, setHovered] = useState<HouseType | null>(null);

  return (
    <div className="screen hs-wrap">
      <style>{CSS}</style>

      {/* ── Header ── */}
      <div className="hs-header">
        <span className="hs-eyebrow">Solar Sizing Wizard · Step 1 of 4</span>
        <h1 className="hs-page-title">What type of home are you powering?</h1>
        <p className="hs-page-sub">
          We'll match you to the right Smart Solar Package — engineered for your scale.
        </p>
      </div>

      {/* ── Cards ── */}
      <div className="hs-grid">
        {tiers.map((tier) => {
          const active = hovered === tier.id;
          const popular = !!tier.badge;
          return (
            <button
              key={tier.id}
              type="button"
              className={[
                "hs-card",
                popular && "hs-card--popular",
                active && "hs-card--active",
              ]
                .filter(Boolean)
                .join(" ")}
              style={
                {
                  "--t-accent": tier.accent,
                  "--t-alpha": tier.accentAlpha,
                  borderColor: popular ? tier.accent : undefined,
                } as React.CSSProperties
              }
              onClick={() => onSelect(tier.id)}
              onMouseEnter={() => setHovered(tier.id)}
              onMouseLeave={() => setHovered(null)}
            >
              {popular && (
                <span className="hs-badge" style={{ background: tier.accent }}>
                  {tier.badge}
                </span>
              )}

              <div
                className="hs-icon"
                style={
                  active
                    ? { background: tier.accentAlpha, color: tier.accent, borderColor: `${tier.accent}55` }
                    : undefined
                }
              >
                {tier.icon}
              </div>

              <div className="hs-name-block">
                <div className="hs-name">{tier.label}</div>
                <div className="hs-tagline">{tier.tagline}</div>
              </div>

              <div className="hs-divider" />

              <div className="hs-specs">
                <SpecRow label="Target" value={tier.target} />
                <SpecRow label="Capacity" value={tier.capacity} />
                <SpecRow label="Support" value={tier.support} />
              </div>

              <ul className="hs-powers">
                {tier.powers.map((p) => (
                  <li key={p} className="hs-power">
                    <span className="hs-dot" style={{ background: tier.accent }} />
                    {p}
                  </li>
                ))}
              </ul>

              <div className="hs-cta" style={active ? { color: tier.accent } : undefined}>
                <span>Select {tier.label}</span>
                <svg
                  viewBox="0 0 16 16"
                  fill="none"
                  width={14}
                  height={14}
                  className={active ? "hs-arrow--go" : ""}
                >
                  <path
                    d="M3 8h10M9 4l4 4-4 4"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </button>
          );
        })}
      </div>

      <p className="hs-foot">
        Not sure? We'll recommend a package based on your appliances in the next step.
      </p>
    </div>
  );
}

function SpecRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="hs-spec-row">
      <span className="hs-spec-label">{label}</span>
      <span className="hs-spec-value">{value}</span>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   CSS — every colour token references a CSS variable that already
   exists in your app's theme (--muted, --border, --fg, etc.) or
   falls back to a safe neutral. No hardcoded #hex for backgrounds
   or text → dark mode works automatically.
───────────────────────────────────────────────────────────────── */
const CSS = `
.hs-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 48px 24px 64px;
}
.hs-header {
  text-align: center;
  max-width: 560px;
  margin-bottom: 40px;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.hs-eyebrow {
  display: inline-block;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--muted);
  background: var(--input-bg, rgba(128,128,128,0.1));
  border: 1px solid var(--border, rgba(128,128,128,0.15));
  border-radius: 100px;
  padding: 4px 12px;
  margin-bottom: 16px;
}
.hs-page-title {
  font-size: clamp(22px, 4vw, 32px);
  font-weight: 700;
  color: var(--fg);
  letter-spacing: -0.5px;
  line-height: 1.2;
  margin: 0 0 12px;
}
.hs-page-sub {
  font-size: 15px;
  color: var(--muted);
  line-height: 1.6;
  margin: 0;
}

/* Grid */
.hs-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 16px;
  width: 100%;
  max-width: 980px;
}

/* Card — NO hardcoded background */
.hs-card {
  position: relative;
  background: var(--card, var(--surface, transparent));
  border: 1.5px solid var(--border, rgba(128,128,128,0.2));
  border-radius: 16px;
  padding: 28px 24px 22px;
  text-align: left;
  cursor: pointer;
  transition: transform 0.22s ease, box-shadow 0.22s ease, border-color 0.22s ease;
  display: flex;
  flex-direction: column;
  gap: 14px;
  outline: none;
  color: inherit;
}
.hs-card:focus-visible {
  box-shadow: 0 0 0 3px var(--t-accent, rgba(128,128,128,0.4));
}
.hs-card--popular {
  border-width: 2px;
}
.hs-card--active {
  transform: translateY(-3px);
  box-shadow: 0 10px 32px rgba(0,0,0,0.15);
}

/* Badge */
.hs-badge {
  position: absolute;
  top: -13px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.07em;
  text-transform: uppercase;
  color: #fff;
  padding: 4px 14px;
  border-radius: 100px;
  white-space: nowrap;
}

/* Icon box */
.hs-icon {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  border: 1px solid var(--border, rgba(128,128,128,0.2));
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--muted);
  background: var(--input-bg, rgba(128,128,128,0.07));
  transition: background 0.22s, color 0.22s, border-color 0.22s;
  flex-shrink: 0;
}

/* Name */
.hs-name-block { display: flex; flex-direction: column; gap: 4px; }
.hs-name {
  font-size: 20px;
  font-weight: 700;
  color: var(--fg);
  letter-spacing: -0.3px;
}
.hs-tagline {
  font-size: 13px;
  color: var(--muted);
  line-height: 1.4;
}

/* Divider */
.hs-divider {
  height: 1px;
  background: var(--border, rgba(128,128,128,0.15));
}

/* Specs */
.hs-specs { display: flex; flex-direction: column; gap: 8px; }
.hs-spec-row {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--border, rgba(128,128,128,0.12));
}
.hs-spec-label {
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--muted);
}
.hs-spec-value {
  font-size: 12.5px;
  color: var(--fg);
  opacity: 0.75;
  line-height: 1.4;
}

/* Powers */
.hs-powers {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.hs-power {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: var(--fg);
  opacity: 0.8;
}
.hs-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  flex-shrink: 0;
  opacity: 1;
}

/* CTA */
.hs-cta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 13px;
  font-weight: 600;
  margin-top: 4px;
  color: var(--muted);
  transition: color 0.18s ease;
}
.hs-cta svg { transition: transform 0.18s ease; }
.hs-arrow--go { transform: translateX(3px); }

/* Footer */
.hs-foot {
  margin-top: 32px;
  font-size: 13px;
  color: var(--muted);
  text-align: center;
}
`;