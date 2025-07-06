import { supabase } from '../auth/supabaseClient';
import logger from '../utils/logger';
import { scrapingQueue } from '../queues/scraping';

export async function processDatabaseBackup(job: any) {
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFileName = `backup-${timestamp}.sql`;
    
    logger.info(`Starting database backup: ${backupFileName}`);
    
    const { error } = await supabase
      .rpc('backup_database', { backup_name: backupFileName });

    if (error) throw error;

    logger.info(`Backup completed successfully: ${backupFileName}`);
    return { success: true, backupFileName };
  } catch (error) {
    logger.error('Database backup error:', error);
    throw error;
  }
}

export function scheduleBackupJobs() {
  scrapingQueue.add('database-backup', {}, {
    repeat: { pattern: '0 3 * * 0' }
  });
}