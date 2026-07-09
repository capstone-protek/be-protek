import { Router } from 'express';
import { dashboardController } from './dashboard.controller';

const router = Router();

router.get('/summary', dashboardController.getSummary.bind(dashboardController));

export default router;
