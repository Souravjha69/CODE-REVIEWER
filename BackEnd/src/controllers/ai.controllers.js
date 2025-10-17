import { getAIResponse } from '../services/ai.service.js';

export const getReview = async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) {
      return res.status(400).json({ error: 'Code is required in the request body' });
    }

    const prompt = `
      You are a senior code reviewer AI. Analyze the following code and return your answer strictly in valid JSON.

      The JSON should have this structure:
      {
        "syntax": "Describe syntax errors or issues if any",
        "bestPractices": "Suggest improvements following best coding standards",
        "efficiency": "Comment on performance or optimization opportunities",
        "readability": "Advise on naming, structure, or readability improvements",
        "finalVerdict": "Summarize overall code quality in 1-2 lines"
      }

      Code to review:
      ${code}

      ⚠️ Important:
      - Return only JSON.
      - Do not include markdown, code fences, backticks, or explanations outside the JSON.
    `;

    const text = await getAIResponse(prompt);

    let structuredOutput;
    try {
      // 🧹 Clean the Gemini response before parsing
      const cleaned = text
        .replace(/```json/g, '')  // remove starting ```json
        .replace(/```/g, '')      // remove ending ```
        .trim();

      structuredOutput = JSON.parse(cleaned); // try parsing the cleaned response
    } catch (e) {
      console.warn('Response not valid JSON, returning raw text instead.');
      structuredOutput = { review: text }; // fallback
    }

    res.json(structuredOutput);
  } catch (err) {
    console.error('AI Error:', err);
    res.status(500).json({ error: 'AI service failed', details: err.message });
  }
};

export default { getReview };