import { Request, Response, NextFunction } from 'express';
import { z, ZodError } from 'zod';

export const validateRequest = (schema: z.ZodSchema) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      return next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          message: 'Validation failed',
          errors: (error as any).errors.map((err: any) => ({
            field: err.path.join('.'),
            message: err.message,
          })),
        });
      }
      return res.status(500).json({
        message: 'Internal server error',
      });
    }
  };
};

export const validateBody = (schema: z.ZodSchema) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      console.log(req.body)
      await schema.parseAsync(req.body);
      return next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          message: 'Validation failed',
          errors: (error as any).errors.map((err: any) => ({
            field: err.path.join('.'),
            message: err.message,
          })),
        });
      }
      return res.status(500).json({
        message: 'Internal server error',
      });
    }
  };
};

// Helper function to create request validation schema
export const createRequestSchema = (bodySchema: z.ZodSchema) => {
  return {
    body: bodySchema,
    query: {},
    params: {},
  };
};
