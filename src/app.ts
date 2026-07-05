import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';

import './config/env.ts';
import { errorMiddleware } from './middleware/error.middleware.ts';
import { requestLogger } from './middleware/requestLogger.middleware.ts';
import healthRoutes from './routes/health.routes.js';

const app = express();

// Always First
app.use(requestLogger);

app.use(express.json());
app.use(cors());
app.use(cookieParser());

app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'E-Commerce Backend API is running 🚀',
  });
});

app.use('/health', healthRoutes);

// Always last
app.use(errorMiddleware);

export default app;
