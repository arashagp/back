import { logger } from '../utils/logger.js';
import mongoose from 'mongoose';

export default async function connection(): Promise<void> {
  try {
    logger.info("Database connection ...");
    if (process.env.MONGO_URL == null) throw new Error('Mongo url path is empty');
    await mongoose.connect(process.env.MONGO_URL, {});
    logger.info('Database has connected');
  }
  catch (error) {
    logger.error(`Service can not connect to database: ${(error as Error).message}`);
  }
}
