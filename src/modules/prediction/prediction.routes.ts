import { Router, Request, Response, NextFunction } from 'express';
import { predictionController } from './prediction.controller';
import { validate } from '../../shared/middlewares/validate.middleware';
import { predictRequestSchema } from './prediction.validation';

const router = Router();

/**
 * Middleware to normalize PascalCase request body to camelCase
 * This ensures 100% backward compatibility with legacy clients and Swagger documentation.
 */
const normalizePredictInput = (req: Request, res: Response, next: NextFunction) => {
  if (req.body) {
    if (req.body.Machine_ID !== undefined) req.body.machineId = req.body.Machine_ID;
    if (req.body.Type !== undefined) req.body.type = req.body.Type;
    if (req.body.Air_Temp !== undefined) req.body.airTemp = req.body.Air_Temp;
    if (req.body.Process_Temp !== undefined) req.body.processTemp = req.body.Process_Temp;
    if (req.body.RPM !== undefined) req.body.rpm = req.body.RPM;
    if (req.body.Torque !== undefined) req.body.torque = req.body.Torque;
    if (req.body.Tool_Wear !== undefined) req.body.toolWear = req.body.Tool_Wear;
  }
  next();
};

router.post(
  '/',
  normalizePredictInput,
  validate(predictRequestSchema),
  predictionController.predict.bind(predictionController)
);

export default router;
