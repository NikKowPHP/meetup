// @ts-ignore - Type declarations not found
import schedule from 'node-schedule';
import { scrapingQueue } from '../queues/scraping';
import logger from '../utils/logger';
import { scheduleBackupJobs } from '../infra/backups';
import { runSecurityAudit, SECURITY_AUDIT_SCHEDULE } from '../cron/securityAudit';

export function startEventScrapingScheduler() {
  // Schedule backups
  scheduleBackupJobs();

  // Schedule security audits
  schedule.scheduleJob(SECURITY_AUDIT_SCHEDULE, async () => {
    logger.info('Running scheduled security audit');
    await runSecurityAudit();
  });

  // Run scraping every 6 hours
  const job = schedule.scheduleJob('0 */6 * * *', async () => {
    logger.info('Queueing scheduled event scraping');
    await scrapingQueue.add('scheduled-scrape', {});
  });

  return job;
}