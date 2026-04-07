/* ═══════════════════════════════════════
   SkyElectric Frontend App
   ═══════════════════════════════════════ */

const API_BASE = '/api';

/* ── State ──────────────────────────────── */
let currentResult = null;
let currentInputMethod = null;
let currentInputValues = {};
let uploadedFile = null;

/* ════════════════════════════
   TAB SWITCHING
════════════════════════════ */
function switchTab(tabId) {
  document.querySelectorAll('.mtab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
  document.querySelector(`[data-tab="${tabId}"]`).classList.add('active');
  document.getElementById(`panel-${tabId}`).classList.add('active');
  hideAllErrors();
}

/* ════════════════════════════
   FILE UPLOAD HANDLING
════════════════════════════ */
function handleFileSelect(input) {
  if (input.files && input.files[0]) {
    uploadedFile = input.files[0];
    showUploadSelected(uploadedFile.name);
  }
}

function handleDragOver(e) {
  e.preventDefault();
  document.getElementById('upload-zone').classList.add('dragover');
}

function handleDragLeave(e) {
  document.getElementById('upload-zone').classList.remove('dragover');
}

function handleDrop(e) {
  e.preventDefault();
  document.getElementById('upload-zone').classList.remove('dragover');
  const files = e.dataTransfer.files;
  if (files && files[0]) {
    uploadedFile = files[0];
    showUploadSelected(files[0].name);
  }
}

function showUploadSelected(name) {
  document.getElementById('upload-state-idle').style.display = 'none';
  document.getElementById('upload-state-selected').style.display = 'block';
  document.getElementById('upload-filename').textContent = name;
}

/* ════════════════════════════
   CALCULATIONS
════════════════════════════ */
async function submitCalculation(method) {
  hideAllErrors();
  const loaderId = `loader-${method}`;
  const btn = document.querySelector(`#panel-${method} .calc-btn`);

  let endpoint, body;

  if (method === 'units') {
    const val = parseFloat(document.getElementById('inp-units').value);
    const roof = parseFloat(document.getElementById('inp-units-roof').value) || null;
    if (!val || val <= 0) { showError('err-units'); return; }
    endpoint = '/solar/calculate/units';
    body = { monthlyKwh: val, roofSqft: roof };
    currentInputValues = { monthlyKwh: val, roofSqft: roof };
  } else if (method === 'amount') {
    const val = parseFloat(document.getElementById('inp-amount').value);
    const roof = parseFloat(document.getElementById('inp-amount-roof').value) || null;
    if (!val || val <= 0) { showError('err-amount'); return; }
    endpoint = '/solar/calculate/amount';
    body = { monthlyPkr: val, roofSqft: roof };
    currentInputValues = { monthlyPkr: val, roofSqft: roof };
  } else if (method === 'bill') {
    if (!uploadedFile) { showError('err-bill'); return; }
    const roof = parseFloat(document.getElementById('inp-bill-roof').value) || null;
    // Send bill to backend
    const formData = new FormData();
    formData.append('bill', uploadedFile);
    if (roof) formData.append('roofSqft', roof);

    setLoading(btn, loaderId, true);
    try {
      const res = await fetch(`${API_BASE}/solar/calculate/bill`, { method: 'POST', body: formData });
      const data = await res.json();
      setLoading(btn, loaderId, false);
      if (!data.success) {
        // Bill extraction not implemented yet — show friendly message
        showBillNotImplemented(data);
        return;
      }
      currentResult = data.result;
      currentInputMethod = 'bill';
      renderResult(data.result);
    } catch (err) {
      setLoading(btn, loaderId, false);
      console.error(err);
    }
    return;
  }

  setLoading(btn, loaderId, true);
  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    setLoading(btn, loaderId, false);

    if (!data.success) {
      console.error('API error:', data.error);
      return;
    }

    currentResult = data.result;
    currentInputMethod = method;
    renderResult(data.result);

  } catch (err) {
    setLoading(btn, loaderId, false);
    console.error('Network error:', err);
    alert('Could not connect to the server. Make sure the backend is running.');
  }
}

function showBillNotImplemented(data) {
  const zone = document.getElementById('upload-zone');
  zone.innerHTML = `
    <div style="color:#D97706;margin-bottom:8px">
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" style="margin:0 auto"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="1.8"/><path d="M12 8v4M12 16h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
    </div>
    <p style="font-weight:600;color:#92400E">Bill received — extraction pending</p>
    <p style="font-size:13px;color:#6B7280;margin-top:4px">File: ${data.fileReceived?.name || 'uploaded'} · Plug in your scraper in backend/routes/solar.js</p>
    <p style="font-size:11px;color:#9CA3AF;margin-top:6px">Use "Monthly Units" or "Bill Amount" tabs to calculate now</p>
  `;
}

/* ════════════════════════════
   RENDER RESULTS
════════════════════════════ */
function renderResult(r) {
  // Hide empty state, show results
  document.getElementById('empty-state').style.display = 'none';
  const container = document.getElementById('results-container');
  container.style.display = 'block';

  // Hero card
  document.getElementById('res-tier-badge').textContent = r.tierInfo?.tier || 'Custom';
  document.getElementById('res-headline').textContent =
    `${r.pvKw} kW Solar + ${r.batKwh} kWh Battery + ${r.invKw} kW Inverter`;
  document.getElementById('res-tierDesc').textContent = r.tierInfo?.description || '';
  document.getElementById('rc-pv').textContent = `${r.pvKw} kW`;
  document.getElementById('rc-bat').textContent = `${r.batKwh} kWh`;
  document.getElementById('rc-inv').textContent = `${r.invKw} kW`;

  // Metrics
  document.getElementById('m-offset').textContent = r.gridOffset || '~100%';
  document.getElementById('m-backup').textContent = `${r.backupDays} ${r.backupDays === 1 ? 'day' : 'days'}`;
  document.getElementById('m-savings').textContent = `PKR ${formatNum(r.annualSavings)}`;
  document.getElementById('m-co2').textContent = `${formatNum(r.co2Offset)} kg`;

  // Component detail
  document.getElementById('cdv-pv').textContent = `${r.pvKw} kW`;
  document.getElementById('cdv-bat').textContent = `${r.batKwh} kWh`;
  document.getElementById('cdv-inv').textContent = `${r.invKw} kW`;
  document.getElementById('cd-pv-sub').textContent = `${r.pvKw} kW · ~${r.roofRequired} sq ft required`;
  document.getElementById('cd-bat-sub').textContent = `${r.batKwh} kWh total · ${r.usableStorage} kWh usable (80% DoD)`;
  document.getElementById('cd-inv-sub').textContent = `${r.invKw} kW · handles up to ${(r.invKw * 0.9).toFixed(1)} kW peak load`;

  // Animate bars (after brief delay)
  setTimeout(() => {
    document.getElementById('bar-pv').style.width = Math.min(100, r.pvKw / 20 * 100) + '%';
    document.getElementById('bar-bat').style.width = Math.min(100, r.batKwh / 100 * 100) + '%';
    document.getElementById('bar-inv').style.width = Math.min(100, r.invKw / 20 * 100) + '%';
  }, 100);

  // Financials
  document.getElementById('fi-cost').textContent = r.costRange?.formatted || '—';
  document.getElementById('fi-savings').textContent = `PKR ${formatNum(r.annualSavings)}/yr`;
  document.getElementById('fi-payback').textContent = `${r.paybackYears} years`;

  // Payback bar (scale: 25 years = 100%)
  const paybackPct = Math.min(100, (r.paybackYears / 25) * 100);
  document.getElementById('payback-fill').style.width = paybackPct + '%';
  const mark = document.getElementById('payback-mark');
  mark.style.left = paybackPct + '%';
  document.getElementById('payback-mark-label').textContent = `${r.paybackYears} yrs`;

  // Environmental
  document.getElementById('env-co2').textContent = formatNum(r.co2Offset);
  document.getElementById('env-trees').textContent = formatNum(r.treesEquivalent);
  document.getElementById('env-kwh').textContent = formatNum(r.annualKwh);

  // AI Insight
  if (r.ai && r.ai.aiGenerated) {
    document.getElementById('res-ai-badge').style.display = 'flex';
    const aiCard = document.getElementById('ai-insight-card');
    aiCard.style.display = 'block';
    document.getElementById('ai-insight-text').textContent = r.ai.insight;
    if (r.ai.tip) {
      document.getElementById('ai-tip-row').style.display = 'flex';
      document.getElementById('ai-tip-text').textContent = r.ai.tip;
    }
  }

  // Scroll into view on mobile
  if (window.innerWidth < 960) {
    container.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

/* ════════════════════════════
   LEAD MODAL
════════════════════════════ */
function openLeadModal() {
  if (!currentResult) {
    alert('Please calculate your system first.');
    return;
  }
  document.getElementById('modal-step-1').style.display = 'block';
  document.getElementById('modal-step-2').style.display = 'none';
  document.getElementById('lead-modal').style.display = 'flex';
  document.body.style.overflow = 'hidden';
}

function closeLeadModal() {
  document.getElementById('lead-modal').style.display = 'none';
  document.body.style.overflow = '';
}

function closeLeadModalOutside(e) {
  if (e.target === document.getElementById('lead-modal')) closeLeadModal();
}

async function submitLead() {
  // Validate
  const name = document.getElementById('lead-name').value.trim();
  const email = document.getElementById('lead-email').value.trim();
  const phone = document.getElementById('lead-phone').value.trim();
  const address = document.getElementById('lead-address').value.trim();
  const city = document.getElementById('lead-city').value;
  const canContact = document.getElementById('chk-contact').checked;
  const termsAccepted = document.getElementById('chk-terms').checked;

  let valid = true;

  if (!name) { showError('err-lead-name'); valid = false; }
  else hideError('err-lead-name');

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    showError('err-lead-email'); valid = false;
  } else hideError('err-lead-email');

  if (!termsAccepted) { showError('err-lead-terms'); valid = false; }
  else hideError('err-lead-terms');

  if (!valid) return;

  const btn = document.getElementById('modal-submit-btn');
  btn.disabled = true;
  document.getElementById('submit-btn-text').style.display = 'none';
  document.getElementById('loader-submit').style.display = 'block';

  const payload = {
    name, email, phone, address, city,
    canContact, termsAccepted,
    inputMethod: currentInputMethod,
    monthlyKwh: currentResult?.monthlyKwh,
    monthlyPkr: currentInputValues?.monthlyPkr || null,
    roofSqft: currentInputValues?.roofSqft || null,
    recommendation: {
      pvKw: currentResult?.pvKw,
      batKwh: currentResult?.batKwh,
      invKw: currentResult?.invKw,
      backupDays: currentResult?.backupDays,
      annualSavings: currentResult?.annualSavings,
      costRange: currentResult?.costRange,
      paybackYears: currentResult?.paybackYears,
      co2Offset: currentResult?.co2Offset,
      tierInfo: currentResult?.tierInfo,
      aiGenerated: currentResult?.ai?.aiGenerated || false,
    }
  };

  try {
    const res = await fetch(`${API_BASE}/leads/save`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();

    btn.disabled = false;
    document.getElementById('submit-btn-text').style.display = 'block';
    document.getElementById('loader-submit').style.display = 'none';

    if (data.success) {
      document.getElementById('modal-step-1').style.display = 'none';
      document.getElementById('modal-step-2').style.display = 'block';
      document.getElementById('success-msg').textContent = data.message;
      document.getElementById('success-system').textContent =
        `${currentResult.pvKw} kW Solar + ${currentResult.batKwh} kWh Battery + ${currentResult.invKw} kW Inverter`;
    } else {
      alert('Error: ' + data.error);
    }
  } catch (err) {
    btn.disabled = false;
    document.getElementById('submit-btn-text').style.display = 'block';
    document.getElementById('loader-submit').style.display = 'none';
    alert('Could not save your information. Please try again.');
    console.error(err);
  }
}

/* ════════════════════════════
   TERMS MODAL
════════════════════════════ */
function showTerms(e) {
  e.preventDefault();
  document.getElementById('terms-modal').style.display = 'flex';
}

function closeTermsModal() {
  document.getElementById('terms-modal').style.display = 'none';
}

function closeTermsModalOutside(e) {
  if (e.target === document.getElementById('terms-modal')) closeTermsModal();
}

function acceptTermsAndClose() {
  document.getElementById('chk-terms').checked = true;
  // Trigger visual update for custom checkbox
  document.getElementById('chk-terms').dispatchEvent(new Event('change'));
  closeTermsModal();
}

/* ════════════════════════════
   UTILITIES
════════════════════════════ */
function setLoading(btn, loaderId, isLoading) {
  const loader = document.getElementById(loaderId);
  const span = btn.querySelector('span');
  const svg = btn.querySelector('svg');
  if (isLoading) {
    btn.disabled = true;
    if (span) span.textContent = 'Calculating...';
    if (svg) svg.style.display = 'none';
    if (loader) loader.style.display = 'block';
  } else {
    btn.disabled = false;
    if (span) span.textContent = 'Calculate my system';
    if (svg) svg.style.display = '';
    if (loader) loader.style.display = 'none';
  }
}

function showError(id) {
  const el = document.getElementById(id);
  if (el) el.style.display = 'block';
}

function hideError(id) {
  const el = document.getElementById(id);
  if (el) el.style.display = 'none';
}

function hideAllErrors() {
  document.querySelectorAll('.field-error').forEach(e => e.style.display = 'none');
}

function formatNum(n) {
  if (n === undefined || n === null) return '—';
  return Number(n).toLocaleString('en-PK');
}

/* ── Custom checkbox visual sync ─────── */
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.chk-input').forEach(input => {
    const box = input.nextElementSibling;
    const sync = () => {
      if (input.checked) {
        box.style.background = 'var(--blue)';
        box.style.borderColor = 'var(--blue)';
        box.innerHTML = `<svg width="10" height="10" viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17l-5-5" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
      } else {
        box.style.background = 'var(--surface)';
        box.style.borderColor = 'var(--border2)';
        box.innerHTML = '';
      }
    };
    input.addEventListener('change', sync);
    sync(); // initial state
  });
});