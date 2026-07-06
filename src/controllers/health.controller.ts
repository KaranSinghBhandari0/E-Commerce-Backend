import { Request, Response } from 'express';

import { getDatabaseStatus } from '../config/database.js';
import { env } from '../config/env.js';
import { sendResponse } from '../utils/sendResponse.js';

export const healthCheck = (_req: Request, res: Response): void => {
  sendResponse(res, {
    statusCode: 200,
    message: 'Service is healthy',
    data: {
      status: 'UP',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: env.NODE_ENV,
      database: getDatabaseStatus(),
    },
  });
};
