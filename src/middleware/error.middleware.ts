import { NextFunction, Request, Response } from 'express';

import { logger } from '../config/logger.ts';
import { AppError } from '../errors/AppError.ts';

export const errorMiddleware = (
  error: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  logger.error(
    {
      err: error,
      req: {
        method: req.method,
        url: req.originalUrl,
        ip: req.ip,
      },
      statusCode: error instanceof AppError ? error.statusCode : 500,
    },
    error.message
  );

  if (error instanceof AppError) {
    res.status(error.statusCode).json({
      success: false,
      message: error.message,
    });

    return;
  }

  res.status(500).json({
    success: false,
    message: 'Internal Server Error',
  });
};
