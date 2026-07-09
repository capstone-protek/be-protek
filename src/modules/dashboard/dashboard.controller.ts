import { Request, Response, NextFunction } from 'express';
import { dashboardService } from './dashboard.service';

export class DashboardController {
  async getSummary(req: Request, res: Response, next: NextFunction) {
    try {
      const summaryDTO = await dashboardService.getSummary();

      // Return both standardized JSON wrapper and legacy root-level keys
      // to ensure zero breakage in the frontend.
      return res.status(200).json({
        success: true,
        message: 'Dashboard summary retrieved successfully',
        summary: summaryDTO.summary,
        recentAlerts: summaryDTO.recentAlerts,
        data: summaryDTO,
      });
    } catch (error) {
      return next(error);
    }
  }
}

export const dashboardController = new DashboardController();
