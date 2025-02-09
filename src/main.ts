import 'dotenv/config';
import connection from './database/main.js';
import express from 'express';
import { logger } from './utils/logger.js';
import userRoutes from './routes/user-route.js';


const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/v1/user', userRoutes);

connection();
const port = process.env.PORT ?? 3500;
app.listen(port, () => {
  logger.log({
    level: 'info',
    message: `service listen to port ${Number(port)}`,
    additional: 'properties',
    are: 'passed along',
  });
});
