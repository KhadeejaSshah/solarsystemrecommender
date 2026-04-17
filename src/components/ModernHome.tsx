import React, { useMemo, useState, useEffect } from "react";
import { Appliance, APPLIANCES_LIST } from "../types";
import { getApplianceIcon } from "./ApplianceIcons";

// --- Data Constants ---
const MODERN_APPLIANCES = [
  { id: "e-stove", name: "Electric Stove", wattage: 2000, icon: "🍳", category: "kitchen", hours: 2, replaces: "Gas Stove", benefit: "No gas bills, precise temp control" },
  { id: "e-oven", name: "Electric Oven", wattage: 2200, icon: "🔥", category: "kitchen", hours: 1, replaces: "Gas Oven / Tandoor", benefit: "Consistent baking, safer indoors" },
  { id: "ev-charger", name: "EV Charger", wattage: 7400, icon: "⚡", category: "transport", hours: 3, replaces: "Petrol / CNG Car", benefit: "Zero fuel cost with solar charging" },
  { id: "heat-pump", name: "Heat Pump Water Heater", wattage: 500, icon: "♨️", category: "heating", hours: 3, replaces: "Gas Geyser", benefit: "3× more efficient than electric resistance" },
  { id: "induction", name: "Induction Cooktop", wattage: 1800, icon: "🔌", category: "kitchen", hours: 1.5, replaces: "Gas Burner", benefit: "80% more efficient than gas" },
  { id: "dishwasher", name: "Dishwasher", wattage: 1500, icon: "🍽️", category: "kitchen", hours: 1, replaces: "Manual washing", benefit: "Uses 6× less water than hand-washing" },
  { id: "robot-vacuum", name: "Robot Vacuum", wattage: 30, icon: "🤖", category: "cleaning", hours: 1, replaces: "Manual vacuuming", benefit: "Autonomous daily cleaning" },
  { id: "smart-panel", name: "Smart Breaker Panel", wattage: 5, icon: "📊", category: "control", hours: 24, replaces: "Traditional breaker box", benefit: "Real-time energy monitoring" },
  { id: "air-purifier", name: "Air Purifier", wattage: 45, icon: "🌬️", category: "health", hours: 12, replaces: "Nothing (new addition)", benefit: "Removes dust & allergens" },
  { id: "e-bbq", name: "Electric BBQ Grill", wattage: 1600, icon: "🥩", category: "kitchen", hours: 1, replaces: "Charcoal / Gas BBQ", benefit: "Clean grilling, no charcoal fumes" },
];

type ModernHomeScreenProps = {
  onComplete: (selectedAppliances: Appliance[]) => void;
  // optional onChange patch - App passes updateData via this
  onChange?: (patch: { appliances: Appliance[] }) => void;
};

// --- Animated House Component ---
const HouseScene = ({ modernCount, totalWattage }: { modernCount: number; totalWattage: number }) => {
  const showTruck = modernCount > 0;
  const workerCount = Math.min(Math.ceil(modernCount / 2), 3);
  const panelCount = Math.min(Math.floor(totalWattage / 1500), 8);

  return (
    <div className="house-container">
      <svg viewBox="0 0 500 300" className="house-svg" style={{ color: "var(--muted)" }}>
        {/* Ground */}
        <line x1="0" y1="260" x2="500" y2="260" stroke="#1e3560" strokeWidth="2" />
        {/* House Frame */}
        <path d="M120 260 L120 150 L250 80 L380 150 L380 260" fill="none" stroke="#1e3560" strokeWidth="2" />
        {/* Windows */}
        <rect x="150" y="170" width="40" height="35" fill="none" stroke="#1e3560" strokeWidth="1.5" />
        <rect x="310" y="170" width="40" height="35" fill="none" stroke="#1e3560" strokeWidth="1.5" />
        {/* Door */}
        <rect x="225" y="200" width="50" height="60" fill="none" stroke="#1e3560" strokeWidth="1.5" />
        <circle cx="265" cy="230" r="3" fill="#00c2bb" />

        {/* Solar Panels (Dynamic) */}
        {Array.from({ length: panelCount }).map((_, i) => (
          <rect key={i} x={150 + (i * 28)} y={130 - (Math.abs(i - 3.5) * 4)} width="22" height="12" rx="2" fill="#1a3a6e" stroke="#00c2bb" strokeWidth="1" className="fade-in" />
        ))}
      </svg>

      {/* Workers */}
      {workerCount > 0 && <div className="worker w1">👷</div>}
      {workerCount > 1 && <div className="worker w2">👷‍♀️</div>}
      
      {/* Animated Truck */}
      {showTruck && <div className="truck-anim">🚚</div>}
    </div>
  );
};

export default function ModernHome({ onComplete }: ModernHomeScreenProps) {
  const [step, setStep] = useState<"modern" | "existing">("modern");
  const [selectedModern, setSelectedModern] = useState<Record<string, boolean>>({});
  const [selectedExisting, setSelectedExisting] = useState<
    Record<string, { quantity: number; selectedOption?: number }>
  >({});
  // accept onChange from props
  const propsAny: any = arguments[0];
  const onChange = propsAny?.onChange as ModernHomeScreenProps["onChange"];

  const getExistingItemWattage = (item: Omit<Appliance, "quantity">, selectedOption?: number) =>
    item.options ? selectedOption ?? item.options[0]?.value : item.wattage;

  const getExistingOptionLabel = (item: Omit<Appliance, "quantity">, value?: number) =>
    item.options?.find((opt) => opt.value === value)?.label ?? `${value || item.wattage}W`;

  const modernSelection = useMemo(
    () => MODERN_APPLIANCES.filter((item) => selectedModern[item.id]),
    [selectedModern]
  );

  const existingSelection = useMemo(
    () =>
      Object.entries(selectedExisting)
        .map(([id, { quantity, selectedOption }]) => {
          const item = APPLIANCES_LIST.find((a) => a.id === id);
          if (!item) return null;
          return {
            ...item,
            quantity,
            wattage: getExistingItemWattage(item, selectedOption),
            selectedOption: item.options ? (selectedOption ?? item.options[0]?.value) : undefined,
          };
        })
        .filter(Boolean) as Appliance[],
    [selectedExisting]
  );

  // keep App in sync: whenever selections change, push appliances patch
  useEffect(() => {
    if (!onChange) return;
    const selectedAppliances = [
      ...modernSelection.map((item) => ({
        id: item.id,
        name: item.name,
        wattage: item.wattage,
        quantity: 1,
      })),
      ...existingSelection.map((item) => ({
        id: item.id,
        name: item.name,
        wattage: item.wattage,
        quantity: item.quantity,
        selectedOption: item.selectedOption,
      })),
    ];
    onChange({ appliances: selectedAppliances });
  }, [modernSelection, existingSelection, onChange]);

  const totalWattage =
    modernSelection.reduce((sum, item) => sum + item.wattage, 0) +
    existingSelection.reduce((sum, item) => sum + item.wattage * item.quantity, 0);

  const modernCount = modernSelection.length;

  const toggleModern = (id: string) => {
    setSelectedModern((prev) => {
      const next = { ...prev };
      if (next[id]) delete next[id];
      else next[id] = true;
      return next;
    });
  };

  const updateExistingQuantity = (id: string, delta: number) => {
    setSelectedExisting((prev) => {
      const item = APPLIANCES_LIST.find((a) => a.id === id);
      if (!item) return prev;

      const next = { ...prev };
      const current = next[id] ?? {
        quantity: 0,
        selectedOption: item.options?.[0]?.value,
      };
      const nextQty = current.quantity + delta;

      if (nextQty <= 0) {
        delete next[id];
      } else {
        next[id] = {
          quantity: nextQty,
          selectedOption: current.selectedOption ?? item.options?.[0]?.value,
        };
      }
      return next;
    });
  };

  const updateExistingOption = (id: string, selectedOption: number) => {
    setSelectedExisting((prev) => {
      if (!prev[id]) return prev;
      return {
        ...prev,
        [id]: {
          ...prev[id],
          selectedOption,
        },
      };
    });
  };

  const handleComplete = () => {
    const selectedAppliances = [
      ...modernSelection.map((item) => ({
        id: item.id,
        name: item.name,
        wattage: item.wattage,
        quantity: 1,
      })),
      ...existingSelection.map((item) => ({
        id: item.id,
        name: item.name,
        wattage: item.wattage,
        quantity: item.quantity,
        selectedOption: item.selectedOption,
      })),
    ];
    // ensure App gets the final patch as well
    if (onChange) onChange({ appliances: selectedAppliances });
    onComplete(selectedAppliances);
  };

  return (
    <div className="container">
      <style>{`
        .container {
          min-height: 100vh;
          padding: 60px 10%;
          color: inherit;
          background: inherit;
          font-family: Inter, sans-serif;
        }
        .display { font-size: 64px; font-weight: 900; letter-spacing: -2px; margin: 0; color: var(--fg); }
        .muted { color: var(--muted); font-size: 16px; margin-bottom: 30px; }
        .trail { display: flex; align-items: center; gap: 8px; margin-bottom: 40px; }
        .dot { width: 8px; height: 8px; border-radius: 50%; background: var(--border); }
        .dot.active, .dot.done { background: #00c2bb; box-shadow: 0 0 10px #00c2bb; }
        .line { height: 1px; width: 60px; background: var(--border); }
        .line.done { background: #00c2bb; }
        .layout { display: grid; grid-template-columns: 1fr 380px; gap: 60px; align-items: start; }
        .scroll { max-height: 520px; overflow-y: auto; padding-right: 15px; }
        .scroll::-webkit-scrollbar { width: 4px; }
        .scroll::-webkit-scrollbar-thumb { background: var(--border); border-radius: 10px; }
        .card {
          background: var(--input-bg);
          border: 1px solid var(--border);
          border-radius: 20px;
          padding: 30px 20px;
          text-align: center;
          position: relative;
          cursor: pointer;
          transition: transform 0.2s, border-color 0.2s, background 0.2s;
        }
        .card.active {
          border-color: #00c2bb;
          background: rgba(0, 194, 187, 0.08);
        }
        .card:hover { transform: translateY(-2px); }
        .badge {
          position: absolute;
          top: 12px;
          right: 12px;
          background: rgba(0, 194, 187, 0.15);
          color: #00c2bb;
          font-size: 9px;
          font-weight: 800;
          padding: 3px 8px;
          border-radius: 4px;
        }
        .check {
          position: absolute;
          top: 12px;
          left: 12px;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: #f59e0b;
          color: black;
          font-size: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 900;
        }
        .chip {
          background: var(--input-bg);
          border: 1px solid var(--border);
          border-radius: 14px;
          padding: 12px 16px;
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 8px;
          cursor: pointer;
          transition: border-color 0.2s, transform 0.2s;
        }
        .chip.active { border-color: #00c2bb; }
        .chip:hover { transform: translateY(-1px); }
        .qty-ctrl { display: flex; align-items: center; gap: 10px; margin-left: auto; }
        .qty-btn {
          width: 24px;
          height: 24px;
          border-radius: 6px;
          border: none;
          background: var(--surface);
          color: var(--fg);
          cursor: pointer;
          font-weight: bold;
        }
        .house-container { position: relative; }
        .truck-anim {
          position: absolute;
          bottom: 35px;
          left: 0;
          font-size: 30px;
          animation: drive 4s infinite linear;
        }
        @keyframes drive { 0% { left: -50px; } 100% { left: 400px; } }
        .worker { position: absolute; bottom: 40px; font-size: 20px; animation: bounce 1s infinite alternate; }
        .w1 { left: 100px; } .w2 { right: 80px; }
        @keyframes bounce { from { transform: translateY(0); } to { transform: translateY(-5px); } }
        .fade-in { animation: fadeIn 0.5s ease-in forwards; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .sidebar-box {
          background: var(--input-bg);
          border: 1px solid var(--border);
          border-radius: 24px;
          padding: 24px;
        }
        .btn {
          width: 100%;
          padding: 18px;
          border-radius: 14px;
          font-weight: 800;
          background: #00c2bb;
          color: black;
          border: none;
          cursor: pointer;
          margin-top: 24px;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .btn:hover { transform: translateY(-2px); box-shadow: 0 4px 20px rgba(0, 194, 187, 0.3); }
        .footer {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 10px;
          margin-top: 60px;
          color: var(--muted);
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 2px;
        }
        .step-bar {
          width: 35px;
          height: 4px;
          border-radius: 2px;
          background: var(--border);
        }
        .step-bar.active { background: #f59e0b; }
      `}</style>

      {/* Top Navigation Progress */}
      <div className="trail">
        <div className="dot done"></div><div className="line done"></div>
        <div className="dot done"></div><div className="line done"></div>
        <div className={`dot ${step === "modern" ? "active" : "done"}`}></div>
        <div className={`line ${step !== "modern" ? "done" : ""}`}></div>
        <div className={`dot ${step === "existing" ? "active" : ""}`}></div>
        <div className="line"></div>
        <div className="dot"></div>
      </div>

      <div className="layout">
        <div>
          {step === "modern" ? (
            <>
              <h1 className="display">Go All-Electric ✨</h1>
              <p className="muted">Replace gas & traditional appliances with modern electric alternatives.</p>
              <div className="scroll">
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  {MODERN_APPLIANCES.map((item) => (
                    <div key={item.id} className={`card ${selectedModern[item.id] ? "active" : ""}`} onClick={() => toggleModern(item.id)}>
                      <div className="badge">SAVE</div>
                      {selectedModern[item.id] && <div className="check">✓</div>}
                      <div style={{ fontSize: 34, marginBottom: 10 }}>{item.icon}</div>
                      <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>{item.name}</div>
                      <div style={{ fontSize: 11, color: "var(--muted)", marginBottom: 10 }}>Replaces: {item.replaces}</div>
                      <div style={{ fontSize: 11, color: "#00f2a1", fontWeight: 600 }}>✓ {item.benefit}</div>
                      <div style={{ marginTop: 12, fontSize: 10, color: "var(--muted)" }}>{item.wattage}W · {item.hours}h/day</div>
                    </div>
                  ))}
                </div>
              </div>
              <button className="btn" onClick={() => setStep("existing")}>Continue to Existing →</button>
            </>
          ) : (
            <>
              <h1 className="display">Existing Home</h1>
              <p className="muted">Add the items currently in your home for an accurate load calculation.</p>
              <div className="scroll">
                {APPLIANCES_LIST.map((item) => {
                  const qty = selectedExisting[item.id]?.quantity || 0;
                  const selectedOption = selectedExisting[item.id]?.selectedOption ?? item.options?.[0]?.value;
                  return (
                    <div
                      key={item.id}
                      className={`chip ${qty > 0 ? "active" : ""}`}
                      onClick={() => qty === 0 && updateExistingQuantity(item.id, 1)}
                    >
                      <span style={{ width: 28, height: 28, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                        {getApplianceIcon(item.id, "", true)}
                      </span>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 15 }}>{item.name}</div>
                        <div style={{ fontSize: 11, color: "var(--muted)" }}>
                          {item.options
                            ? `${getExistingOptionLabel(item, selectedOption)}`
                            : `${item.wattage}W load`}
                        </div>
                      </div>
                      {qty > 0 && (
                        <div className="qty-ctrl" onClick={(e) => e.stopPropagation()}>
                          <button className="qty-btn" onClick={() => updateExistingQuantity(item.id, -1)}>−</button>
                          <span style={{ minWidth: 20, textAlign: "center", fontWeight: 900 }}>{qty}</span>
                          <button className="qty-btn" onClick={() => updateExistingQuantity(item.id, 1)}>+</button>
                        </div>
                      )}
                      {qty > 0 && item.options && (
                        <select
                          value={selectedOption}
                          onChange={(e) => updateExistingOption(item.id, Number(e.target.value))}
                          style={{
                            marginLeft: 12,
                            borderRadius: 10,
                            border: "1px solid var(--border)",
                            background: "var(--input-bg)",
                            color: "var(--fg)",
                            padding: "6px 10px",
                            fontSize: 12,
                          }}
                        >
                          {item.options.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                  );
                })}
              </div>
              <button className="btn" style={{ background: "#f59e0b", color: "#0f172a" }} onClick={handleComplete}>Complete Setup →</button>
            </>
          )}
        </div>

        <div style={{ position: "sticky", top: 60 }}>
          <HouseScene modernCount={modernCount} totalWattage={totalWattage} />

          <div className="sidebar-box">
            <div style={{ color: "#f59e0b", fontWeight: 800, fontSize: 13, marginBottom: 16 }}>✨ SELECTED MODERN ITEMS</div>
            {modernSelection.length === 0 ? (
              <div style={{ textAlign: "center", color: "var(--muted)", padding: "20px 0", fontSize: 13 }}>Select items on the left</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {modernSelection.map((item) => (
                  <div key={item.id} style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 14 }}>
                    <span>{item.icon}</span>
                    <span style={{ flex: 1 }}>{item.name}</span>
                    <span style={{ color: "var(--muted)", fontSize: 12 }}>{item.wattage}W</span>
                  </div>
                ))}
              </div>
            )}

            <div style={{ borderTop: "1px solid var(--border)", marginTop: 20, paddingTop: 15, display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--muted)", fontSize: 12 }}>Total Load Est.</span>
              <span style={{ fontWeight: 800, color: "#00c2bb" }}>{(totalWattage / 1000).toFixed(1)} kW</span>
            </div>
          </div>
        </div>
      </div>

      <div className="footer">
        STEP
        <div className={`step-bar ${step === "modern" ? "active" : ""}`}></div>
        <div className={`step-bar ${step === "existing" ? "active" : ""}`}></div>
        <div className="step-bar"></div>
        <div className="step-bar"></div>
      </div>
    </div>
  );
}

// also provide named export to help editors/runtime resolution
export { ModernHome };