import { GoogleGenAI } from '@google/genai';
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
async function run() {
  try {
    const res = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: 'Hello',
    });
    console.log('Success 3.6-flash:', res.text);
  } catch (err: any) {
    console.error('Error 3.6-flash:', err.message);
  }
}
run();
