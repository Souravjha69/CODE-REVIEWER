import 'dotenv/config';                     // ← add this line FIRST
import { GoogleGenerativeAI } from '@google/generative-ai';

const key = process.env.GOOGLE_GEMINI_KEY;
console.log('Gemini key loaded?', key ? `yes (len=${key.length})` : 'NO');  // temp

const genAI = new GoogleGenerativeAI(key);
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

export async function getAIResponse(prompt) {
  if (!prompt || typeof prompt !== 'string') throw new Error('Prompt must be a non-empty string');
  const result = await model.generateContent(prompt);
  return result.response.text();
}

export default { getAIResponse };