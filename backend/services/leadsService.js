/**
 * SkyElectric Leads Service
 * Manages lead capture and CSV storage
 */

const fs = require('fs');
const path = require('path');

const CSV_PATH = path.resolve(process.env.LEADS_CSV_PATH || './data/leads.csv');

const CSV_HEADERS = [
  'ID',
  'Timestamp',
  'Full Name',
  'Email',
  'Phone',
  'Address',
  'City',
  'Can Contact',
  'Terms Accepted',
  'Input Method',
  'Monthly kWh',
  'Monthly PKR',
  'Roof Sqft',
  'Recommended PV (kW)',
  'Recommended Battery (kWh)',
  'Recommended Inverter (kW)',
  'System Tier',
  'Backup Days',
  'Annual Savings (PKR)',
  'Estimated Cost Range',
  'Payback Years',
  'CO2 Offset (kg/yr)',
  'AI Insight Used',
];

function ensureCSV() {
  const dir = path.dirname(CSV_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  if (!fs.existsSync(CSV_PATH)) {
    const headerRow = CSV_HEADERS.map(h => `"${h}"`).join(',') + '\n';
    fs.writeFileSync(CSV_PATH, headerRow, 'utf8');
  }
}

function escapeCSV(val) {
  if (val === null || val === undefined) return '""';
  const str = String(val);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return '"' + str.replace(/"/g, '""') + '"';
  }
  return '"' + str + '"';
}

function generateId() {
  return 'SKY-' + Date.now().toString(36).toUpperCase();
}

/**
 * Save a lead to CSV
 */
function saveLead(leadData) {
  ensureCSV();

  const {
    name, email, phone, address, city,
    canContact, termsAccepted,
    inputMethod, monthlyKwh, monthlyPkr, roofSqft,
    recommendation,
  } = leadData;

  const rec = recommendation || {};

  const row = [
    generateId(),
    new Date().toISOString(),
    name,
    email,
    phone || '',
    address || '',
    city || '',
    canContact ? 'Yes' : 'No',
    termsAccepted ? 'Yes' : 'No',
    inputMethod || '',
    monthlyKwh ? parseFloat(monthlyKwh).toFixed(1) : '',
    monthlyPkr || '',
    roofSqft || '',
    rec.pvKw || '',
    rec.batKwh || '',
    rec.invKw || '',
    rec.tierInfo ? rec.tierInfo.tier : '',
    rec.backupDays || '',
    rec.annualSavings || '',
    rec.costRange ? rec.costRange.formatted : '',
    rec.paybackYears || '',
    rec.co2Offset || '',
    rec.aiGenerated ? 'Yes' : 'No',
  ].map(escapeCSV).join(',');

  fs.appendFileSync(CSV_PATH, row + '\n', 'utf8');

  return { success: true, csvPath: CSV_PATH };
}

/**
 * Get all leads as array of objects (for admin view if needed)
 */
function getAllLeads() {
  ensureCSV();
  const content = fs.readFileSync(CSV_PATH, 'utf8');
  const lines = content.trim().split('\n');
  if (lines.length <= 1) return [];

  const headers = lines[0].split(',').map(h => h.replace(/"/g, ''));
  return lines.slice(1).map(line => {
    const values = line.match(/(".*?"|[^,]+)/g) || [];
    const obj = {};
    headers.forEach((h, i) => {
      obj[h] = (values[i] || '').replace(/^"|"$/g, '').replace(/""/g, '"');
    });
    return obj;
  });
}

module.exports = { saveLead, getAllLeads, CSV_PATH };