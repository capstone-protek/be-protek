import { Request, Response, NextFunction } from 'express';
import { z, ZodError } from 'zod';
import { ValidationError } from '../errors/app-errors';

export const validate = (schema: z.ZodTypeAny) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = (await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      })) as any;
      
      // Assign back the transformed/validated data safely using Object.assign
      // to avoid modifying read-only getters (req.query / req.params) directly.
      if (parsed.body !== undefined) {
        req.body = parsed.body;
      }
      if (parsed.query !== undefined) {
        Object.assign(req.query, parsed.query);
      }
      if (parsed.params !== undefined) {
        Object.assign(req.params, parsed.params);
      }
      
      return next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.issues.map((err) => ({
          field: err.path.slice(1).join('.'), // slice(1) removes 'body', 'query', or 'params' prefix
          message: err.message,
        }));
        return next(new ValidationError('Request validation failed', errors));
      }
      return next(error);
    }
  };
};
