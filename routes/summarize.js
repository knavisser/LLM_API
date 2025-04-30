/**
 * @swagger
 * /summarize:
 *   post:
 *     summary: Get a summary from input text
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               text:
 *                 type: string
 *                 example: "Dit is een testverslag."
 *     responses:
 *       200:
 *         description: Summary result
 */

import express from 'express';
import axios from 'axios';
import authMiddleware from '../middleware/auth.js';
import { buildPrompt } from '../utils/promptBuilder.js';
const LLM_API_URL = process.env.LLM_API_URL || 'http://localhost:8080/completion';

const router = express.Router();

router.post('/', authMiddleware, async (req, res) => {
  const { text } = req.body;
  console.log("text", text)
  if (!text) return res.status(400).json({ error: 'Missing text input' });

  const prompt = buildPrompt(text);

  try {
    const response = await axios.post(LLM_API_URL, {
      prompt,
      max_tokens: 512,
      temperature: 0.7
    });

    res.json({ summary: response.data.content || response.data });
    console.log(response.data);
  } catch (err) {
    if (err.response) {
      console.error('LLM error response:', err.response.data);
      res.status(500).json({ error: err.response.data });
    } else {
      console.error('LLM error:', err.message);
      res.status(500).json({ error: 'LLM call failed' });
    }
  }
  
});

export default router;
