import { Router } from 'express';
import { alertController } from './alert.controller';

const router = Router();

router.get('/', alertController.getAlerts.bind(alertController));

export default router;
