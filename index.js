import 'dotenv/config';
import express from 'express';
import summarizeRoute from './routes/summarize.js';
import healthRoute from './routes/health.js';
import abstractionRoute from './routes/abstraction.js';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';

const swaggerSpec = swaggerJsdoc({
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'LLM Summarization API',
        version: '1.0.0'
      },
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer'
          }
        }
      },
      security: [{ bearerAuth: [] }]
    },
    apis: ['./routes/*.js'] // ← where your route comments live
  });

const app = express();
app.use(express.json());

// ROUTES
app.use('/summarize', summarizeRoute);
app.use('/health', healthRoute);
app.use('/abstraction', abstractionRoute);

// DOCS --> 3000/docs
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

const PORT = process.env.PORT || 3000;
console.log(`Checking LLM server on ${process.env.LLM_API_URL}`);
app.listen(PORT, () => console.log(`LLM API running on port ${PORT}`));
