import { createLogger, format, transports } from 'winston';
import { SupabaseClient } from '@supabase/supabase-js';
import { supabase } from '../auth/supabaseClient';

const { combine, timestamp, printf, errors } = format;

// Custom format that includes stack traces when available
const errorFormat = printf(({ level, message, timestamp, stack }) => {
  return `${timestamp} [${level}]: ${stack || message}`;
});

// Create base logger
const logger = createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: combine(
    errors({ stack: true }),
    timestamp(),
    errorFormat
  ),
  transports: [
    new transports.Console()
  ]
});

// Enhanced error logging to Supabase
export async function logErrorToDatabase(error: Error, context: Record<string, any> = {}) {
  try {
    const { error: dbError } = await supabase
      .from('error_logs')
      .insert({
        error_message: error.message,
        stack_trace: error.stack,
        context: JSON.stringify(context),
        environment: process.env.NODE_ENV
      });

    if (dbError) {
      logger.error('Failed to log error to database:', dbError);
    }
  } catch (err) {
    logger.error('Failed to log error:', err);
  }
}

// Export enhanced logger with additional methods
export const monitoringLogger = {
  ...logger,
  errorWithContext: (error: Error, context: Record<string, any>) => {
    logger.error(error.message, { stack: error.stack, ...context });
    logErrorToDatabase(error, context);
  }
};

export default monitoringLogger;