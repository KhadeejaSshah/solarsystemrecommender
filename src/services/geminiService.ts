import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function analyzeBill(base64Data: string, mimeType: string) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        {
          parts: [
            {
              inlineData: {
                data: base64Data.split(',')[1] || base64Data,
                mimeType: mimeType
              }
            },
            {
              text: "Extract the monthly electricity units consumed (kWh) from this bill. Return ONLY the number. If multiple months are shown, return the most recent one."
            }
          ]
        }
      ],
      config: {
        temperature: 0.1,
      }
    });

    const text = response.text || "";
    const units = parseInt(text.replace(/[^0-9]/g, ""), 10);
    return isNaN(units) ? null : units;
  } catch (error) {
    console.error("Error analyzing bill:", error);
    return null;
  }
}
