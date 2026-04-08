import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // API Routes
  app.post("/api/calculate-from-appliances", (req, res) => {
    const { appliances, evCar, evBike, otherKwh } = req.body;
    
    // Basic load calculation (kW)
    let totalLoad = 0;
    const loads: Record<string, number> = {
      ac15: 1.8,
      ac20: 2.5,
      fan: 0.08,
      light: 0.02,
      fridge: 0.3,
      motor: 1.0
    };

    Object.entries(appliances).forEach(([key, count]) => {
      totalLoad += (loads[key] || 0) * (count as number);
    });

    if (evCar) totalLoad += 7;
    if (evBike) totalLoad += 1.5;
    totalLoad += (otherKwh || 0);

    // Estimate daily units (assuming 6 hours average run time for heavy loads)
    const dailyUnits = totalLoad * 6; 
    const monthlyUnits = dailyUnits * 30;

    res.json({
      monthlyUnits,
      dailyUnits,
      suggestedPv: Math.ceil(dailyUnits / 4), // ~4 sun hours
      suggestedInverter: Math.ceil(totalLoad * 1.2),
      suggestedBattery: Math.ceil(dailyUnits * 0.6) // 60% for night
    });
  });

  app.post("/api/calculate-from-units", (req, res) => {
    const { units } = req.body;
    const dailyUnits = units / 30;
    
    res.json({
      monthlyUnits: units,
      dailyUnits,
      suggestedPv: Math.ceil(dailyUnits / 4),
      suggestedInverter: Math.ceil((dailyUnits / 24) * 3), // Rough peak load estimate
      suggestedBattery: Math.ceil(dailyUnits * 0.6)
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
