import { Router } from 'express';
import { machineController } from './machine.controller';

const router = Router();

router.get('/', machineController.getMachines.bind(machineController));
router.get('/:id', machineController.getMachineDetail.bind(machineController));
router.get('/:id/history', machineController.getMachineHistory.bind(machineController));

export default router;
