import { Response } from 'express';

interface ApiResponse<T> {
  statusCode: number;
  message: string;
  data?: T;
}

export const sendResponse = <T>(
  res: Response,
  { statusCode, message, data }: ApiResponse<T>
): void => {
  res.status(statusCode).json({
    success: true,
    message,
    ...(data !== undefined && { data }),
  });
};
