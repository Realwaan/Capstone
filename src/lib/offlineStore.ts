/**
 * CapStoneFlow IndexedDB Offline Storage & Sync Engine (Enterprise Scalability)
 * Ensures students with spotty campus Wi-Fi can view and draft tasks offline without losing progress.
 */

const DB_NAME = 'capstoneflow_offline_store';
const DB_VERSION = 1;
const STORE_NAME = 'workspace_cache';

export class OfflineStorage {
  private dbPromise: Promise<IDBDatabase> | null = null;

  constructor() {
    if (typeof window !== 'undefined' && 'indexedDB' in window) {
      this.dbPromise = this.openDatabase();
    }
  }

  private openDatabase(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      };

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Save a key-value pair to IndexedDB
   */
  public async set<T>(key: string, value: T): Promise<void> {
    if (!this.dbPromise) return;
    try {
      const db = await this.dbPromise;
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const req = store.put(value, key);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } catch (err) {
      console.warn('[OfflineStorage] Error writing to IndexedDB:', err);
    }
  }

  /**
   * Retrieve a key from IndexedDB
   */
  public async get<T>(key: string): Promise<T | null> {
    if (!this.dbPromise) return null;
    try {
      const db = await this.dbPromise;
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const req = store.get(key);
        req.onsuccess = () => resolve(req.result || null);
        req.onerror = () => reject(req.error);
      });
    } catch (err) {
      console.warn('[OfflineStorage] Error reading from IndexedDB:', err);
      return null;
    }
  }
}

export const offlineStore = new OfflineStorage();
