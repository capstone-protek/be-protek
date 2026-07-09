import { Router } from 'express';
import { simulationController } from './simulation.controller';

const router = Router();

router.post('/start', simulationController.startSimulation.bind(simulationController));
router.get('/stop', simulationController.stopSimulation.bind(simulationController));
router.get('/status', simulationController.getSimulationStatus.bind(simulationController));

export default router;
