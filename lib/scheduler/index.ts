import schedule from 'node-schedule';
import { scrapingQueue } from '../queues/scraping';
import { logger } from '../utils/logger';

export function startEventScrapingScheduler() {
  // Run every 6 hours
  const job = schedule.scheduleJob('0 */6 * * *', async () => {
    logger.info('Queueing scheduled event scraping');
    await scrapingQueue.add('scheduled-scrape', {});
  });

  return job;
}