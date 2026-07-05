import app from './app.ts';
import { logger } from './config/logger.ts';

const PORT = process.env.PORT || 3000;
const ENV = process.env.NODE_ENV;

app.listen(PORT, () => {
  logger.info(
    {
      port: PORT,
      environment: ENV,
    },
    'Server started successfully'
  );
});
