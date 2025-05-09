/**
 * @swagger
 * /translate:
 *   post:
 *     summary: Translate a Dutch medical report into another language
 *     description: Uses an LLM to translate Dutch clinical text into the specified target language.
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
 *               - language
 *             properties:
 *               text:
 *                 type: string
 *                 example: "De patiënt voelde zich vandaag rustiger dan gisteren."
 *               language:
 *                 type: string
 *                 example: "en"
 *                 description: The ISO code of the target language (e.g. "en" for English, "fr" for French)
 *     responses:
 *       200:
 *         description: Translated output from the model
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 content:
 *                   type: string
 *                 usage:
 *                   type: object
 *                 timings:
 *                   type: object
 */

import express from 'express';
import axios from 'axios';
import authMiddleware from '../middleware/auth.js';
import { buildPrompt } from '../utils/promptBuilder.js';

const router = express.Router();
const LLM_API_URL = process.env.LLM_API_URL || 'http://localhost:8080/completion';

router.post('/', authMiddleware, async (req, res) => {
    const requestType = "translation"
        
    const { text, language, temperature, top_p, top_k, max_tokens } = req.body;
    if (!text || !language) {
        return res.status(400).json({ error: 'Missing required fields: text and language' });
    }

    const metadata = { language };
    const prompt = buildPrompt(text, requestType, metadata);

    const payload = {
        prompt,
        temperature: temperature ?? 0.3,
        top_p: top_p ?? 1,
        top_k: top_k ?? 1,
        max_tokens: max_tokens ?? 2048,
        stop: ["<|END_TRANSLATION|>"]
    };

    try {
        const start = Date.now();
        const response = await axios.post(LLM_API_URL, payload);
        const duration = (Date.now() - start) / 1000;

        const result = response.data;

        const prompt_n = result?.usage?.prompt_tokens ?? 0;
        const predicted_n = result?.usage?.completion_tokens ?? 0;

        const prompt_time = duration * 0.1;
        const predicted_time = duration * 0.9;

        result.timings = {
            prompt_n,
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
