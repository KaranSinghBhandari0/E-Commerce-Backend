import { Request, Response } from 'express';

import { sendResponse } from '../utils/sendResponse.ts';

export const healthCheck = (_req: Request, res: Response): void => {
  sendResponse(res, {
    statusCode: 200,
    message: 'Service is healthy',
    data: {
      status: 'UP',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV,
    },
  });
};
