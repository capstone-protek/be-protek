import express from 'express';
import cors from 'cors';
import 'dotenv/config';

import YAML from 'yamljs';
import path from 'path';

// Import shared middlewares
import { loggingMiddleware } from './shared/middlewares/logging.middleware';
import { errorMiddleware } from './shared/middlewares/error.middleware';

// Import modular refactored routes
import machineRoutes from './modules/machine/machine.routes';
import predictRoutes from './modules/prediction/prediction.routes';
import dashboardRoutes from './modules/dashboard/dashboard.routes';
import alertRoutes from './modules/alert/alert.routes';
import simulationRoutes from './modules/simulation/simulation.routes';
import chatbotRoutes from './modules/chatbot/chatbot.routes';

const app = express();

const swaggerDocument = YAML.load(path.join(__dirname, '../swagger.yaml'));

app.use(cors());
app.use(express.json());

// 1. Global Request Logging Middleware
app.use(loggingMiddleware);

// 2. Serve Swagger Spec JSON for Scalar to consume
app.get('/api-docs/json', (req, res) => {
  res.status(200).json(swaggerDocument);
});

// 3. Serve Scalar API Reference UI
app.get('/api-docs', (req, res) => {
  res.status(200).send(`
    <!doctype html>
    <html>
      <head>
        <title>Predictive Maintenance Copilot - API Reference</title>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style>
          body {
            margin: 0;
          }
        </style>
      </head>
      <body>
        <script
          id="api-reference"
          data-url="/api-docs/json"
          data-theme="purple"></script>
        <script src="https://cdn.jsdelivr.net/npm/@scalar/api-reference"></script>
      </body>
    </html>
  `);
});

// 4. Register Refactored Modular Routes
app.use('/api/machines', machineRoutes);
app.use('/api/predict', predictRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/simulation', simulationRoutes);
app.use('/api/chat', chatbotRoutes);

// Register Alert routes with dashboard aliases to fix Postman 404 errors
app.use('/api/alerts', alertRoutes);
app.use('/api/dashboard/alerts', alertRoutes);
app.use('/api/dashboard/alert', alertRoutes);

// 5. Global Error Handling Middleware (must be registered last)
app.use(errorMiddleware);

export default app;
