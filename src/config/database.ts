import dns from 'dns';

import mongoose from 'mongoose';

import { env } from './env.js';
import { logger } from './logger.js';

if (env.NODE_ENV === 'development') {
  logger.info('Development mode: Using Google DNS to bypass ISP blocking');
  dns.setServers(['8.8.8.8', '8.8.4.4']);
}

export const connectDatabase = async (): Promise<void> => {
  try {
    await mongoose.connect(env.MONGODB_URI);
    logger.info('MongoDB connected successfully');
  } catch (error) {
    logger.fatal(error, 'Failed to connect to MongoDB');
    process.exit(1);
  }
};

export const disconnectDatabase = async (): Promise<void> => {
  try {
    await mongoose.disconnect();
    logger.info('MongoDB disconnected successfully');
  } catch (error) {
    logger.fatal(error, 'Failed to disconnect from MongoDB');
    process.exit(1);
  }
};

mongoose.connection.on('error', (error) => {
  logger.error(error, 'MongoDB connection error');
});

export const getDatabaseStatus = (): string => {
  switch (mongoose.connection.readyState) {
    case 0:
      return 'disconnected';

    case 1:
      return 'connected';

    case 2:
      return 'connecting';

    case 3:
      return 'disconnecting';

    default:
      return 'unknown';
  }
};
