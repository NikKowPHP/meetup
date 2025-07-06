interface TileCacheOptions {
  maxAge?: number; // in hours
  maxEntries?: number;
}

class TileCache {
  private dbName = 'leaflet-tile-cache';
  private storeName = 'tiles';
  private maxAge: number;
  private maxEntries: number;
  private dbPromise: Promise<IDBDatabase>;

  constructor(options: TileCacheOptions = {}) {
    this.maxAge = options.maxAge || 24; // Default 24 hours
    this.maxEntries = options.maxEntries || 1000; // Default 1000 tiles
    this.dbPromise = this.initDB();
  }

  private async initDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, 1);
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          const store = db.createObjectStore(this.storeName, { keyPath: 'key' });
          store.createIndex('timestamp', 'timestamp', { unique: false });
        }
      };

      request.onsuccess = (event) => {
        resolve((event.target as IDBOpenDBRequest).result);
      };

      request.onerror = (event) => {
        reject((event.target as IDBOpenDBRequest).error);
      };
    });
  }

  async getTile(key: string): Promise<Blob | null> {
    const db = await this.dbPromise;
    return new Promise((resolve) => {
      const transaction = db.transaction(this.storeName, 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.get(key);

      request.onsuccess = () => {
        const result = request.result;
        if (result && this.isValid(result.timestamp)) {
          resolve(result.data);
        } else {
          resolve(null);
        }
      };

      request.onerror = () => resolve(null);
    });
  }

  async setTile(key: string, data: Blob): Promise<void> {
    const db = await this.dbPromise;
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(this.storeName, 'readwrite');
      const store = transaction.objectStore(this.storeName);
      
      // Clean up old entries first
      this.cleanup();

      const entry = {
        key,
        data,
        timestamp: Date.now()
      };

      const request = store.put(entry);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  private isValid(timestamp: number): boolean {
    const ageInHours = (Date.now() - timestamp) / (1000 * 60 * 60);
    return ageInHours < this.maxAge;
  }

  private async cleanup(): Promise<void> {
    const db = await this.dbPromise;
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(this.storeName, 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const index = store.index('timestamp');
      const request = index.getAll();

      request.onsuccess = () => {
        const entries = request.result;
        if (entries.length > this.maxEntries) {
          // Delete oldest entries
          const toDelete = entries
            .sort((a, b) => a.timestamp - b.timestamp)
            .slice(0, entries.length - this.maxEntries);
          
          const deleteRequests = toDelete.map(entry => {
            return new Promise<void>((res, rej) => {
              const req = store.delete(entry.key);
              req.onsuccess = () => res();
              req.onerror = () => rej(req.error);
            });
          });

          Promise.all(deleteRequests).then(() => resolve()).catch(reject);
        } else {
          resolve();
        }
      };

      request.onerror = () => reject(request.error);
    });
  }
}

export function createCachedTileLayer(urlTemplate: string, options: TileCacheOptions = {}) {
  return {
    urlTemplate,
    cacheOptions: options,
    createCache: () => new TileCache(options)
  };
}