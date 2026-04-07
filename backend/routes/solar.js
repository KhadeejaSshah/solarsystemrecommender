/**
 * Solar Sizing API Routes
 */

const express = require('express');
const multer = require('multer');
const router = express.Router();
const { calculateSolarSystem, billToKwh } = require('../services/solarCalculator');
const { generateAIInsight } = require('../services/geminiService');

// Multer setup for bill uploads (stored in memory, processing delegated to user's backend)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter: (req, file, cb) => {
    const allowed = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Only PDF and image files are allowed'));
  }
});

/**
 * POST /api/solar/calculate/units
 * Input: average monthly kWh
 */
router.post('/calculate/units', async (req, res) => {
  try {
    const { monthlyKwh, roofSqft } = req.body;

    if (!monthlyKwh || isNaN(monthlyKwh) || Number(monthlyKwh) <= 0) {
      return res.status(400).json({ success: false, error: 'Valid monthly kWh is required' });
    }

    const result = calculateSolarSystem(Number(monthlyKwh), roofSqft ? Number(roofSqft) : null);

    // Fetch AI insight
    const aiData = await generateAIInsight(result, 'Monthly kWh input');
    result.ai = aiData;

    res.json({ success: true, inputMethod: 'units', result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Calculation failed', details: err.message });
  }
});

/**
 * POST /api/solar/calculate/amount
 * Input: average monthly bill in PKR
 */
router.post('/calculate/amount', async (req, res) => {
  try {
    const { monthlyPkr, roofSqft } = req.body;

    if (!monthlyPkr || isNaN(monthlyPkr) || Number(monthlyPkr) <= 0) {
      return res.status(400).json({ success: false, error: 'Valid monthly PKR amount is required' });
    }

    const monthlyKwh = billToKwh(Number(monthlyPkr));
    const result = calculateSolarSystem(monthlyKwh, roofSqft ? Number(roofSqft) : null);
    result.inputPkr = Number(monthlyPkr);

    // Fetch AI insight
    const aiData = await generateAIInsight(result, `Monthly bill PKR ${monthlyPkr}`);
    result.ai = aiData;

    res.json({ success: true, inputMethod: 'amount', result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Calculation failed', details: err.message });
  }
});

/**
 * POST /api/solar/calculate/bill
 * Input: uploaded electricity bill (PDF/image)
 * NOTE: Scraping logic is intentionally left empty — plug in your own extractor
 */
router.post('/calculate/bill', upload.single('bill'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No bill file uploaded' });
    }

    // ─────────────────────────────────────────────────────────────
    // TODO: Add your bill scraper / OCR logic here
    // req.file.buffer  → the uploaded file buffer (PDF or image)
    // req.file.mimetype → 'application/pdf' | 'image/jpeg' | etc.
    //
    // Example:
    //   const monthlyKwh = await extractKwhFromBill(req.file.buffer, req.file.mimetype);
    //
    // Once extracted, uncomment and call:
    //   const roofSqft = req.body.roofSqft ? Number(req.body.roofSqft) : null;
    //   const result = calculateSolarSystem(monthlyKwh, roofSqft);
    //   const aiData = await generateAIInsight(result, 'Bill upload');
    //   result.ai = aiData;
    //   return res.json({ success: true, inputMethod: 'bill', result });
    // ─────────────────────────────────────────────────────────────

    return res.status(501).json({
      success: false,
      error: 'Bill extraction not yet implemented',
      message: 'Bill upload received successfully. Extraction backend pending integration.',
      fileReceived: {
        name: req.file.originalname,
        size: req.file.size,
        type: req.file.mimetype,
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Bill processing failed', details: err.message });
  }
});

module.exports = router;