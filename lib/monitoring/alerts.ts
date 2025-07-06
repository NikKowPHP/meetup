import { monitoringLogger } from './logger';
import { supabase } from '../auth/supabaseClient';

type AlertChannel = 'email' | 'slack';
type AlertSeverity = 'low' | 'medium' | 'high' | 'critical';

interface AlertOptions {
  channels: AlertChannel[];
  severity: AlertSeverity;
  context?: Record<string, any>;
}

export class SecurityAlertSystem {
  private static instance: SecurityAlertSystem;
  private lastAlertTimestamps: Record<string, number> = {};

  private constructor() {}

  public static getInstance(): SecurityAlertSystem {
    if (!SecurityAlertSystem.instance) {
      SecurityAlertSystem.instance = new SecurityAlertSystem();
    }
    return SecurityAlertSystem.instance;
  }

  private shouldSendAlert(alertType: string): boolean {
    const now = Date.now();
    const lastSent = this.lastAlertTimestamps[alertType] || 0;
    
    // Rate limit: 1 alert per type per 5 minutes
    if (now - lastSent < 300000) {
      return false;
    }
    
    this.lastAlertTimestamps[alertType] = now;
    return true;
  }

  private async sendToChannel(channel: AlertChannel, message: string, severity: AlertSeverity) {
    try {
      // Store alert in database
      const { error } = await supabase
        .from('security_alerts')
        .insert({
          message,
          channel,
          severity,
          sent_at: new Date().toISOString()
        });

      if (error) {
        monitoringLogger.error('Failed to log alert to database:', error);
      }

      monitoringLogger.info(`[ALERT DISPATCH] Pretending to send to ${channel}: ${message}`, {
        severity,
        channel,
        message,
        timestamp: new Date().toISOString(),
        note: 'This is a simulation - actual channel integration would send via API'
      });
    } catch (err) {
      monitoringLogger.error('Failed to send alert:', err);
    }
  }

  public async triggerAlert(
    alertType: string, 
    message: string, 
    options: AlertOptions
  ) {
    if (!this.shouldSendAlert(alertType)) {
      monitoringLogger.info(`Alert suppressed due to rate limiting: ${alertType}`);
      return;
    }

    monitoringLogger.errorWithContext(
      new Error(`Security Alert: ${message}`), 
      { alertType, ...options.context }
    );

    for (const channel of options.channels) {
      await this.sendToChannel(channel, message, options.severity);
    }
  }
}

// Export singleton instance
export const securityAlerts = SecurityAlertSystem.getInstance();