import { getAIResponse } from '../services/ai.service.js';

export const getResponse = async (req, res) => {
  try {
    const { prompt } = req.query.prompt;
    if (!prompt) return res.status(400).json({ error: 'Prompt is required' });

    const text = await getAIResponse(prompt);
    res.json({ text });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'AI service failed' });
  }
};

export default { getResponse };