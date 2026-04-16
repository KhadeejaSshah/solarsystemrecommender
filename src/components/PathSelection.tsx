import React, { useState } from "react";
import { EntryPath } from "../types";

/* ─────────────────────────────────────────────────────────────────
   Three ways to size a solar system — presented as large, rich
   selection cards. All colours via CSS variables → dark mode safe.
───────────────────────────────────────────────────────────────── */

const paths: {
  id: EntryPath;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  desc: string;
  badge: string;
  badgeAccent: string;
  accent: string;
  accentAlpha: string;
  bullets: string[];
}[] = [
  {
    id: "bill",
    badge: "Fastest",
    badgeAccent: "#0EA5E9",
    accent: "#0EA5E9",
    accentAlpha: "rgba(14,165,233,0.1)",
    title: "Enter My Bill",
    subtitle: "Upload or type your electricity bill",
    desc: "We extract your monthly units automatically and size your system from real consumption data — no guesswork.",
    bullets: ["Reads LESCO / FESCO / PESCO bills", "Analyses 12-month usage pattern", "Done in under 2 minutes"],
    icon: (
      <svg viewBox="0 0 36 36" fill="none" width={32} height={32}>
        <rect x="6" y="3" width="24" height="30" rx="3" stroke="currentColor" strokeWidth="1.5" />
        <path d="M11 10h14M11 15h14M11 20h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="26" cy="27" r="6" fill="currentColor" fillOpacity="0.12" stroke="currentColor" strokeWidth="1.5" />
        <path d="M24 27l1.5 1.5L28 25" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    id: "appliances",
    badge: "Most Accurate",
    badgeAccent: "#16A34A",
    accent: "#16A34A",
    accentAlpha: "rgba(22,163,74,0.1)",
    title: "Add My Appliances",
    subtitle: "Select what you use at home",
    desc: "Pick every appliance, set quantities and daily usage hours. We calculate your exact load and right-size the system.",
    bullets: ["100+ appliances in our library", "Set hours & quantities per room", "See live kWh estimate as you build"],
    icon: (
      <svg viewBox="0 0 36 36" fill="none" width={32} height={32}>
        <rect x="3" y="8" width="13" height="10" rx="2" stroke="currentColor" strokeWidth="1.5" />
        <rect x="20" y="8" width="13" height="10" rx="2" stroke="currentColor" strokeWidth="1.5" />
        <rect x="3" y="22" width="13" height="10" rx="2" stroke="currentColor" strokeWidth="1.5" />
        <rect x="20" y="22" width="13" height="10" rx="2" stroke="currentColor" strokeWidth="1.5" />
        <path d="M7 13h5M24 13h5M7 27h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M24 27l1.5 1.5L28 25" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    id: "modern-home",
    badge: "Premium",
    badgeAccent: "#7C3AED",
    accent: "#7C3AED",
    accentAlpha: "rgba(124,58,237,0.1)",
    title: "Modern Home",
    subtitle: "Switch to all-electric living",
    desc: "Explore smart electric upgrades — EV chargers, heat pumps, induction cooking — and layer on your existing appliances.",
    bullets: ["EV charging + solar integration", "Heat pump & smart HVAC", "Future-proof all-electric setup"],
    icon: (
      <svg viewBox="0 0 36 36" fill="none" width={32} height={32}>
        <path d="M18 3L4 14h4v19h8v-8h4v8h8V14h4L18 3z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        <circle cx="26" cy="10" r="4" stroke="currentColor" strokeWidth="1.5" />
        <path d="M26 8v2l1.2 1.2" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
      </svg>
    ),
  },
];

export default function PathSelectionStep({ onSelect }: { onSelect: (path: EntryPath) => void }) {
  const [hovered, setHovered] = useState<EntryPath | null>(null);

  return (
    <div className="screen ps-wrap">
      <style>{CSS}</style>

      {/* ── Header ── */}
      <div className="ps-header">
        <span className="ps-eyebrow">Solar Sizing Wizard · Step 2 of 4</span>
        <h1 className="ps-title display">How would you like to size your system?</h1>
        <p className="ps-sub">Choose the path that fits your household best.</p>
      </div>

      {/* ── Cards ── */}
      <div className="ps-stack">
        {paths.map((path, i) => {
          const active = hovered === path.id;
          return (
            <button
              key={path.id}
              type="button"
              className={["ps-card", active && "ps-card--active"].filter(Boolean).join(" ")}
              style={
                {
                  "--p-accent": path.accent,
                  "--p-alpha": path.accentAlpha,
                  borderLeftColor: active ? path.accent : "transparent",
                } as React.CSSProperties
              }
              onClick={() => onSelect(path.id)}
              onMouseEnter={() => setHovered(path.id)}
              onMouseLeave={() => setHovered(null)}
            >
              {/* Step number */}
              <div className="ps-num">{String(i + 1).padStart(2, "0")}</div>

              {/* Icon */}
              <div
                className="ps-icon"
                style={
                  active
                    ? { background: path.accentAlpha, color: path.accent, borderColor: `${path.accent}44` }
                    : undefined
                }
              >
                {path.icon}
              </div>

              {/* Body */}
              <div className="ps-body">
                <div className="ps-top">
                  <span className="ps-card-title">{path.title}</span>
                  <span
                    className="ps-badge"
                    style={{ background: path.accentAlpha, color: path.accent, borderColor: `${path.accent}44` }}
                  >
                    {path.badge}
                  </span>
                </div>
                <p className="ps-desc">{path.desc}</p>
                <ul className="ps-bullets">
                  {path.bullets.map((b) => (
                    <li key={b} className="ps-bullet">
                      <span className="ps-tick" style={{ color: path.accent }}>✓</span>
                      {b}
                    </li>
                  ))}
                </ul>
                <div className="ps-sub-line">{path.subtitle}</div>
              </div>

              {/* Arrow */}
              <div className="ps-arrow" style={active ? { color: path.accent } : undefined}>
                <svg viewBox="0 0 16 16" fill="none" width={16} height={16} className={active ? "ps-arrow--go" : ""}>
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
    </div>
  );
}

const CSS = `
.ps-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 48px 24px 72px;
}
.ps-header {
  text-align: center;
  max-width: 600px;
  margin-bottom: 40px;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.ps-eyebrow {
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
.ps-title {
  font-size: clamp(24px, 4.5vw, 44px) !important;
  font-weight: 700;
  color: var(--fg);
  letter-spacing: -0.5px;
  line-height: 1.15;
  margin: 0 0 14px !important;
}
.ps-sub {
  font-size: 16px;
  color: var(--muted);
  line-height: 1.6;
  margin: 0;
}

/* Stack of cards */
.ps-stack {
  width: 100%;
  max-width: 720px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* Card */
.ps-card {
  position: relative;
  background: var(--card, var(--surface, transparent));
  border: 1.5px solid var(--border, rgba(128,128,128,0.2));
  border-left: 4px solid transparent;
  border-radius: 14px;
  padding: 22px 20px 22px 20px;
  text-align: left;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
  display: flex;
  align-items: flex-start;
  gap: 18px;
  outline: none;
  color: inherit;
}
.ps-card:focus-visible {
  box-shadow: 0 0 0 3px var(--p-accent, rgba(128,128,128,0.4));
}
.ps-card--active {
  transform: translateX(3px);
  box-shadow: 0 6px 24px rgba(0,0,0,0.12);
}

/* Step number */
.ps-num {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  color: var(--muted);
  opacity: 0.5;
  min-width: 22px;
  padding-top: 3px;
}

/* Icon */
.ps-icon {
  width: 52px;
  height: 52px;
  flex-shrink: 0;
  border-radius: 12px;
  border: 1px solid var(--border, rgba(128,128,128,0.2));
  background: var(--input-bg, rgba(128,128,128,0.07));
  color: var(--muted);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s, color 0.2s, border-color 0.2s;
}

/* Body */
.ps-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.ps-top {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}
.ps-card-title {
  font-size: 18px;
  font-weight: 700;
  color: var(--fg);
  letter-spacing: -0.2px;
}
.ps-badge {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.09em;
  text-transform: uppercase;
  padding: 3px 10px;
  border-radius: 100px;
  border: 1px solid;
}
.ps-desc {
  font-size: 13.5px;
  color: var(--muted);
  line-height: 1.65;
  margin: 0;
}
.ps-bullets {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.ps-bullet {
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: 12.5px;
  color: var(--fg);
  opacity: 0.7;
}
.ps-tick {
  font-size: 11px;
  font-weight: 700;
  flex-shrink: 0;
}
.ps-sub-line {
  font-size: 11.5px;
  color: var(--muted);
  opacity: 0.65;
  margin-top: 2px;
}

/* Arrow */
.ps-arrow {
  color: var(--muted);
  opacity: 0.45;
  padding-top: 4px;
  flex-shrink: 0;
  transition: color 0.18s, opacity 0.18s;
}
.ps-card--active .ps-arrow { opacity: 1; }
.ps-arrow svg { transition: transform 0.18s ease; }
.ps-arrow--go { transform: translateX(3px); }
`;