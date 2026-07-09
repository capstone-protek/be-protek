import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/app-errors';
import logger from '../libs/logger';
import { env } from '../config/env.config';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const errorMiddleware = (err: Error, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof AppError) {
    logger.warn({
      message: err.message,
      statusCode: err.statusCode,
      errors: err.errors,
      path: req.path,
      method: req.method,
    });

    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      errors: err.errors || [],
    });
  }

  // Unhandled exception
  logger.error({
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  return res.status(500).json({
    success: false,
    message: env.NODE_ENV === 'development' ? err.message : 'Internal Server Error',
    errors: [],
  });
};
