import { Queue, Worker } from 'bullmq';
import IORedis from 'ioredis';
import { normalizeAllEvents } from '../pipelines/normalize';
import { logger } from '../utils/logger';

const connection = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379');

export const scrapingQueue = new Queue('scraping', {
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 5000
    }
  }
});

new Worker('scraping', async job => {
  logger.info(`Starting scraping job ${job.id}`);
  const startTime = Date.now();
  
  try {
    await normalizeAllEvents();
    const duration = Date.now() - startTime;
    logger.info(`Completed scraping job ${job.id} in ${duration}ms`);
    return { success: true, duration };
  } catch (error) {
    logger.error(`Scraping job ${job.id} failed`, error);
    throw error;
  }
}, { connection });