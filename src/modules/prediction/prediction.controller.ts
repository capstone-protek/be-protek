import { Request, Response, NextFunction } from 'express';
import { predictionService } from './prediction.service';

export class PredictionController {
  async predict(req: Request, res: Response, next: NextFunction) {
    try {
      // Body has already been validated and typed by Zod middleware
      const responseDTO = await predictionService.predict(req.body);

      // Determine alertCreated status for backward compatibility
      const isCritical =
        responseDTO.rulStatus?.includes('CRITICAL') ||
        responseDTO.status?.includes('FAILURE');

      return res.status(200).json({
        success: true,
        status: 'success',
        message: 'Prediction processed successfully',
        data: responseDTO,
        databaseSaved: true,
        alertCreated: isCritical,
      });
    } catch (error) {
      return next(error);
    }
  }
}

export const predictionController = new PredictionController();
