interface SyncTask {
  url: string;
  options: RequestInit;
  timestamp: number;
}

const SYNC_TAG = 'meetup-aggregator-sync';
const SYNC_QUEUE_KEY = 'syncQueue';

export const registerBackgroundSync = async (): Promise<void> => {
  if (!('serviceWorker' in navigator) || !('SyncManager' in window)) {
    console.warn('Background Sync API not supported');
    return;
  }

  const registration = await navigator.serviceWorker.ready;
  try {
    await registration.sync.register(SYNC_TAG);
    console.log('Background Sync registered');
  } catch (error) {
    console.error('Background Sync registration failed:', error);
  }
};

export const addToSyncQueue = async (request: Request): Promise<void> => {
  if (!('serviceWorker' in navigator)) return;

  const queue = await getSyncQueue();
  queue.push({
    url: request.url,
    options: {
      method: request.method,
      headers: Array.from(request.headers.entries()),
      body: await request.clone().text(),
    },
    timestamp: Date.now(),
  });

  await setSyncQueue(queue);
};

const getSyncQueue = async (): Promise<SyncTask[]> => {
  const registration = await navigator.serviceWorker.ready;
  const cache = await caches.open(SYNC_QUEUE_KEY);
  const response = await cache.match(SYNC_QUEUE_KEY);
  return response ? await response.json() : [];
};

const setSyncQueue = async (queue: SyncTask[]): Promise<void> => {
  const registration = await navigator.serviceWorker.ready;
  const cache = await caches.open(SYNC_QUEUE_KEY);
  await cache.put(
    SYNC_QUEUE_KEY,
    new Response(JSON.stringify(queue), {
      headers: { 'Content-Type': 'application/json' },
    })
  );
};

export const processSyncQueue = async (): Promise<void> => {
  const queue = await getSyncQueue();
  if (queue.length === 0) return;

  const successfulRequests: SyncTask[] = [];
  const failedRequests: SyncTask[] = [];

  for (const task of queue) {
    try {
      const response = await fetch(task.url, task.options);
      if (response.ok) {
        successfulRequests.push(task);
      } else {
        failedRequests.push(task);
      }
    } catch (error) {
      failedRequests.push(task);
    }
  }

  await setSyncQueue(failedRequests);
};