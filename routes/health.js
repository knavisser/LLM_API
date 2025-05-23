/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check for API and LLM service
 *     description: Returns the status of the API, the LLM backend, uptime, and a timestamp.
 *     responses:
 *       200:
 *         description: System status object
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 api:
 *                   type: string
 *                   example: "ok"
 *                 llm:
 *                   type: string
 *                   example: "online"
 *                 uptime:
 *                   type: number
 *                   example: 123.45
 *                 timestamp:
 *                   type: number
 *                   example: 1711990303030
 */



import express from 'express';
import axios from 'axios';

const router = express.Router();

const LLM_API_URL = process.env.LLM_API_URL || 'http://localhost:8080/completion';


router.get('/', async (req, res) => {
  const status = {
    api: 'ok',
    llm: 'offline',
    uptime: process.uptime(),
    timestamp: Date.now()
  };

  try {
    const response = await axios.post(process.env.LLM_API_URL || 'http://127.0.0.1:8080/completion', {
      prompt: ' ',
      n_predict: 0
    }, {
      timeout: 1000,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (response.status === 200) {
      status.llm = 'online';
    }
  } catch (err) {
    console.error('LLM error:', err.message);
  }

  res.json(status);
});


export default router;
