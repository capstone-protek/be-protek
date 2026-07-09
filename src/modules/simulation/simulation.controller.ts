import { Request, Response, NextFunction } from 'express';
import { simulationService } from './simulation.service';

export class SimulationController {
  async startSimulation(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await simulationService.startSimulation(req.body);
      return res.status(200).json(data);
    } catch (error) {
      return next(error);
    }
  }

  async stopSimulation(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await simulationService.stopSimulation();
      return res.status(200).json(data);
    } catch (error) {
      return next(error);
    }
  }

  async getSimulationStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await simulationService.getSimulationStatus();
      return res.status(200).json(data);
    } catch (error) {
      return next(error);
    }
  }
}

export const simulationController = new SimulationController();
