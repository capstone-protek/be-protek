import express from 'express';
import cors from 'cors';
import 'dotenv/config';

import swaggerUi from 'swagger-ui-express';
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

// Import legacy routes (until refactored)
import chatRoutes from './routes/chat.routes';

const app = express();

const swaggerDocument = YAML.load(path.join(__dirname, '../swagger.yaml'));

app.use(cors());
app.use(express.json());

// 1. Global Request Logging Middleware
app.use(loggingMiddleware);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// 2. Register Refactored Modular Routes
app.use('/api/machines', machineRoutes);
app.use('/api/predict', predictRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/simulation', simulationRoutes);

// Register Alert routes with dashboard aliases to fix Postman 404 errors
app.use('/api/alerts', alertRoutes);
app.use('/api/dashboard/alerts', alertRoutes);
app.use('/api/dashboard/alert', alertRoutes);

// 3. Register Legacy Routes
app.use('/api/chat', chatRoutes);

// 4. Global Error Handling Middleware (must be registered last)
app.use(errorMiddleware);

export default app;
