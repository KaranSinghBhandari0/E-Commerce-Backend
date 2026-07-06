import app from './app.js';
import { connectDatabase, disconnectDatabase } from './config/database.js';
import { env } from './config/env.js';
import { logger } from './config/logger.js';

const SHUTDOWN_TIMEOUT = 10_000;

let isShuttingDown = false;

const startServer = async (): Promise<void> => {
  try {
    await connectDatabase();

    const server = app.listen(env.PORT, () => {
      logger.info(
        {
          port: env.PORT,
          environment: env.NODE_ENV,
        },
        'Server started successfully'
      );
    });

    const gracefulShutdown = async (signal: string): Promise<void> => {
      if (isShuttingDown) {
        logger.warn(`Shutdown already in progress. Ignoring ${signal}.`);
        return;
      }

      isShuttingDown = true;

      logger.info(`${signal} received. Starting graceful shutdown...`);

      // Force shutdown if cleanup hangs
      const shutdownTimer = setTimeout(() => {
        logger.error('Graceful shutdown timed out. Force exiting.');
        process.exit(1);
      }, SHUTDOWN_TIMEOUT);

      server.close(async (error) => {
        try {
          if (error) {
            throw error;
          }

          logger.info('HTTP server closed.');
          await disconnectDatabase();
          clearTimeout(shutdownTimer);
          logger.info('Application shut down successfully.');
          process.exit(0);
        } catch (error) {
          clearTimeout(shutdownTimer);
          logger.error(error, 'Error during graceful shutdown.');
          process.exit(1);
        }
      });
    };

    process.on('SIGINT', () => {
      console.log('SIGINT received. Initiating graceful shutdown...');
      void gracefulShutdown('SIGINT');
    });

    process.on('SIGTERM', () => {
      void gracefulShutdown('SIGTERM');
    });

    process.on('uncaughtException', (error) => {
      logger.fatal(error, 'Uncaught Exception');
      void gracefulShutdown('uncaughtException');
    });

    process.on('unhandledRejection', (reason) => {
      logger.fatal(reason, 'Unhandled Promise Rejection');
      void gracefulShutdown('unhandledRejection');
    });
  } catch (error) {
    logger.fatal(error, 'Failed to start server.');
    process.exit(1);
  }
};

void startServer();
