interface PWAMetrics {
  installed: boolean;
  installationPromptShown: boolean;
  offlineSessions: number;
  serviceWorkerStatus: 'registered' | 'failed' | 'unsupported';
  backgroundSyncEnabled: boolean;
  cacheHitRate: number;
}

const metrics: PWAMetrics = {
  installed: false,
  installationPromptShown: false,
  offlineSessions: 0,
  serviceWorkerStatus: 'unsupported',
  backgroundSyncEnabled: false,
  cacheHitRate: 0,
};

export const trackPWAMetrics = () => {
  // Track installation events
  window.addEventListener('beforeinstallprompt', (e) => {
    metrics.installationPromptShown = true;
    e.userChoice.then((choice) => {
      metrics.installed = choice.outcome === 'accepted';
    });
  });

  window.addEventListener('appinstalled', () => {
    metrics.installed = true;
  });

  // Track service worker status
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready
      .then(() => {
        metrics.serviceWorkerStatus = 'registered';
      })
      .catch(() => {
        metrics.serviceWorkerStatus = 'failed';
      });
  }

  // Track offline usage
  window.addEventListener('offline', () => {
    metrics.offlineSessions += 1;
  });

  // Track background sync support
  metrics.backgroundSyncEnabled = 'SyncManager' in window;

  // Periodically report metrics
  setInterval(() => {
    // Send metrics to your analytics service
    console.log('PWA Metrics:', metrics);
  }, 30000);
};

export const getPWAMetrics = (): PWAMetrics => metrics;