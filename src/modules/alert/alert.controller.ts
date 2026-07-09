import { Request, Response, NextFunction } from 'express';
import { alertService } from './alert.service';

export class AlertController {
  async getAlerts(req: Request, res: Response, next: NextFunction) {
    try {
      const alerts = await alertService.getAlerts();

      // Return both standardized JSON wrapper and legacy root-level keys
      // to ensure zero breakage in the frontend or API consumers.
      return res.status(200).json({
        success: true,
        message: 'Alerts retrieved successfully',
        alerts: alerts,
        data: alerts,
      });
    } catch (error) {
      return next(error);
    }
  }
}

export const alertController = new AlertController();
