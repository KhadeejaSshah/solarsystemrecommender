/**
 * Leads API Routes
 */

const express = require('express');
const router = express.Router();
const { saveLead, getAllLeads } = require('../services/leadsService');

/**
 * POST /api/leads/save
 * Save a new lead with recommendation data
 */
router.post('/save', (req, res) => {
  try {
    const {
      name, email, phone, address, city,
      canContact, termsAccepted,
      inputMethod, monthlyKwh, monthlyPkr, roofSqft,
      recommendation
    } = req.body;

    // Validate required fields
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, error: 'Full name is required' });
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ success: false, error: 'Valid email is required' });
    }
    if (!termsAccepted) {
      return res.status(400).json({ success: false, error: 'Terms and conditions must be accepted' });
    }

    const result = saveLead({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone || '',
      address: address || '',
      city: city || '',
      canContact: Boolean(canContact),
      termsAccepted: Boolean(termsAccepted),
      inputMethod,
      monthlyKwh,
      monthlyPkr,
      roofSqft,
      recommendation,
    });

    res.json({
      success: true,
      message: canContact
        ? 'Thank you! Our team will reach out to you shortly.'
        : 'Thank you! Your recommendation has been saved.',
      ...result
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Failed to save lead', details: err.message });
  }
});

/**
 * GET /api/leads
 * Get all leads (basic admin endpoint — add auth in production)
 */
router.get('/', (req, res) => {
  try {
    const leads = getAllLeads();
    res.json({ success: true, count: leads.length, leads });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;