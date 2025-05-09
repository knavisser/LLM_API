/**
 * @swagger
 * /abstraction:
 *   post:
 *     summary: Get a clinical abstraction from input text using LLM
 *     description: Generates a clinical abstraction from a Dutch medical report. Allows customization of LLM generation settings.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - text
 *             properties:
 *               text:
 *                 type: string
 *                 description: The input text to abstract.
 *                 example: "Dit is een testverslag."
 *               temperature:
 *                 type: number
 *                 description: Sampling temperature (optional).
 *                 example: 0.3
 *               top_p:
 *                 type: number
 *                 description: Nucleus sampling cutoff (optional).
 *                 example: 1
 *               top_k:
 *                 type: number
 *                 description: Top-k sampling (optional).
 *                 example: 1
 *               max_tokens:
 *                 type: integer
 *                 description: Maximum number of tokens to generate (optional).
 *                 example: 2048
 *     responses:
 *       200:
 *         description: Full LLM response with timing metadata
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 content:
 *                   type: string
 *                   description: The abstracted text result.
 *                 usage:
 *                   type: object
 *                   description: Token usage statistics.
 *                   properties:
 *                     prompt_tokens:
 *                       type: integer
 *                     completion_tokens:
 *                       type: integer
 *                     total_tokens:
 *                       type: integer
 *                 timings:
 *                   type: object
 *                   description: Detailed timing and performance metrics.
 *                   properties:
 *                     prompt_n:
 *                       type: integer
 *                     prompt_ms:
 *                       type: number
 *                     prompt_per_token_ms:
 *                       type: number
 *                     prompt_per_second:
 *                       type: number
 *                     predicted_n:
 *                       type: integer
 *                     predicted_ms:
 *                       type: number
 *                     predicted_per_token_ms:
 *                       type: number
 *                     predicted_per_second:
 *                       type: number
 */


import express from 'express';
import axios from 'axios';
import authMiddleware from '../middleware/auth.js';
import { buildPrompt } from '../utils/promptBuilder.js';

const router = express.Router();
const LLM_API_URL = process.env.LLM_API_URL || 'http://localhost:8080/completion';

router.post('/', authMiddleware, async (req, res) => {
    const requestType = "abstraction"

    const { text, temperature, top_p, top_k, max_tokens } = req.body;
    if (!text) return res.status(400).json({ error: 'Missing text input' });

    const full_prompt = buildPrompt(text, requestType);

    // Default payload
    const payload = {
        prompt: full_prompt,
        temperature: temperature ?? 0.3,
        top_p: top_p ?? 1,
        top_k: top_k ?? 1,
        max_tokens: max_tokens ?? 2048,
        stop: ["<|END_ABSTRACTIE|>"]
    };

    try {
        const start = Date.now();

        const response = await axios.post(LLM_API_URL, payload);
        const duration = (Date.now() - start) / 1000; // in seconds
        const result = response.data;

        const prompt_n = result?.usage?.prompt_tokens ?? 0;
        const predicted_n = result?.usage?.completion_tokens ?? 0;

        const prompt_time = duration * 0.1;
        const predicted_time = duration * 0.9;

        result.timings = {
            prompt_n,
            total_ms: duration,
            prompt_ms: +(prompt_time * 1000).toFixed(3),
            prompt_per_token_ms: prompt_n ? +(prompt_time * 1000 / prompt_n).toFixed(9) : null,
            prompt_per_second: prompt_time ? +(prompt_n / prompt_time).toFixed(9) : null,
            predicted_n,
            predicted_ms: +(predicted_time * 1000).toFixed(3),
            predicted_per_token_ms: predicted_n ? +(predicted_time * 1000 / predicted_n).toFixed(9) : null,
            predicted_per_second: predicted_time ? +(predicted_n / predicted_time).toFixed(9) : null
        };

        res.json(result);
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

