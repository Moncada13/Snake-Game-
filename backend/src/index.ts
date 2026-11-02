import dotenv from 'dotenv';
import { createApp } from './app';
import { logger } from './infrastructure/logger';

dotenv.config();

const port = Number(process.env.PORT) || 3010;
const app = createApp();

export const server = app.listen(port, () => {
  logger.info(`Snake Game Leaderboard API listening on port ${port}`, {
    port,
    useInMemoryDb: process.env.USE_IN_MEMORY_DB === 'true',
  });
});

