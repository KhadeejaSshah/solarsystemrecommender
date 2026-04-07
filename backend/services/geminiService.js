/**
 * SkyElectric Gemini AI Service
 * Uses Gemini 2.0 Flash to generate personalized solar recommendations
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');

let genAI = null;

function getClient() {
  if (!genAI) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'your_gemini_api_key_here') {
      return null;
    }
    genAI = new GoogleGenerativeAI(apiKey);
  }
  return genAI;
}

/**
 * Generate AI-powered personalized insight for the solar recommendation
 */
async function generateAIInsight(calcResult, inputMethod, userContext = {}) {
  const client = getClient();

  if (!client) {
    return {
      aiGenerated: false,
      insight: null,
      tip: null,
    };
  }

  try {
    const model = client.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const prompt = `You are a solar energy expert for Pakistan. A homeowner has used the SkyElectric solar sizing tool.

Here is their recommended system:
- Solar PV: ${calcResult.pvKw} kW
- Battery Storage: ${calcResult.batKwh} kWh (${calcResult.usableStorage} kWh usable)
- Inverter: ${calcResult.invKw} kW
- System Tier: ${calcResult.tierInfo.tier}
- Monthly Consumption: ${calcResult.monthlyKwh} kWh
- Daily Consumption: ${calcResult.dailyKwh} kWh
- Backup Duration: ${calcResult.backupDays} day(s)
- Annual Savings: PKR ${calcResult.annualSavings.toLocaleString()}
- Estimated Payback: ${calcResult.paybackYears} years
- CO₂ Offset: ${calcResult.co2Offset} kg/year
- Input Method: ${inputMethod}

Please provide:
1. A single personalized "AI Insight" paragraph (2-3 sentences) that explains WHY this specific system size makes sense for their usage pattern and what real-life difference it will make. Be specific, warm, and helpful. Reference Pakistan context (load shedding, WAPDA bills, etc.) where relevant.
2. One practical "Pro Tip" (1 sentence) specific to their system size — something actionable they should know about installation, usage, or maintenance in Pakistan.

Respond in this exact JSON format (no markdown, no backticks):
{
  "insight": "Your personalized insight here...",
  "tip": "Your pro tip here..."
}`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();

    // Clean potential markdown fences
    const clean = text.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(clean);

    return {
      aiGenerated: true,
      insight: parsed.insight,
      tip: parsed.tip,
      model: 'gemini-2.0-flash',
    };
  } catch (err) {
    console.error('Gemini AI error:', err.message);
    return {
      aiGenerated: false,
      insight: null,
      tip: null,
      error: err.message,
    };
  }
}

module.exports = { generateAIInsight };