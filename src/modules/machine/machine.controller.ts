import { Request, Response, NextFunction } from 'express';
import { machineService } from './machine.service';
import { ValidationError } from '../../shared/errors/app-errors';

export class MachineController {
  async getMachines(req: Request, res: Response, next: NextFunction) {
    try {
      const machines = await machineService.getMachines();
      return res.status(200).json(machines);
    } catch (error) {
      return next(error);
    }
  }

  async getMachineDetail(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      if (!id) {
        throw new ValidationError('Machine ID is required');
      }
      // Narrow type and explicitly cast to string since runtime check validates it is defined
      const idStr = (Array.isArray(id) ? id[0] : id) as string;
      const machine = await machineService.getMachineDetail(idStr);
      return res.status(200).json(machine);
    } catch (error) {
      return next(error);
    }
  }

  async getMachineHistory(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      if (!id) {
        throw new ValidationError('Machine ID is required');
      }
      // Narrow type and explicitly cast to string since runtime check validates it is defined
      const idStr = (Array.isArray(id) ? id[0] : id) as string;
      const history = await machineService.getMachineHistory(idStr);
      return res.status(200).json(history);
    } catch (error) {
      return next(error);
    }
  }
}

export const machineController = new MachineController();
