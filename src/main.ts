import express from 'express';
import { logger } from './utils/logger.js';

const app = express();

const port = process.env.PORT ?? 3500;
app.listen(port, () => {
  logger.log({
    level: 'info',
    message: `service listen to port ${Number(port)}`,
    additional: 'properties',
    are: 'passed along',
  });
});
