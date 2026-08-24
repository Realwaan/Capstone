import { supabase, isSupabaseConfigured } from './supabase';
import { TaskAttachment } from '../types';

export const ATTACHMENTS_BUCKET = 'capstone-attachments';

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};

// ---------------------------------------------------------------------------
// Native IndexedDB Engine for Unlimited Local Offline Storage
// ---------------------------------------------------------------------------
const DB_NAME = 'capstoneflow_storage_db';
const STORE_NAME = 'attachments_store';

const openStorageDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB not supported'));
      return;
    }
    const request = window.indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = (e) => {
      const db = (e.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

export const saveFileToIndexedDB = async (id: string, file: File | Blob, name: string): Promise<string> => {
  try {
    const db = await openStorageDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const record = { id, file, name, uploadedAt: Date.now() };
      const req = store.put(record);
      req.onsuccess = () => {
        // Create an Object URL for instantaneous client preview & download
        const url = URL.createObjectURL(file);
        resolve(url);
      };
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('IndexedDB write failed, fallback to Data URL:', err);
    return URL.createObjectURL(file);
  }
};

export const getFileFromIndexedDB = async (id: string): Promise<File | Blob | null> => {
  try {
    const db = await openStorageDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(id);
      req.onsuccess = () => resolve(req.result?.file || null);
      req.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
};

// ---------------------------------------------------------------------------
// Unified Upload File Handler
// ---------------------------------------------------------------------------
export const uploadAttachmentFile = async (
  file: File,
  folder: 'tasks' | 'deliverables' | 'manuscripts' | 'revisions' = 'tasks',
  uploaderName: string = 'Team Member'
): Promise<TaskAttachment> => {
  const sanitizedName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const attachmentId = `att-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const filePath = `${folder}/${Date.now()}_${sanitizedName}`;
  const timestamp = new Date().toISOString().split('T')[0];

  // 1. Try Supabase Cloud Storage (if backend bucket exists)
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase.storage
        .from(ATTACHMENTS_BUCKET)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (!error && data) {
        const { data: publicUrlData } = supabase.storage
          .from(ATTACHMENTS_BUCKET)
          .getPublicUrl(data.path);

        return {
          id: attachmentId,
          name: file.name,
          url: publicUrlData.publicUrl,
          size: file.size,
          fileType: file.type || 'application/octet-stream',
          uploadedAt: timestamp,
          uploadedBy: uploaderName
        };
      } else {
        console.info('Supabase storage not accessible or bucket missing. Storing locally in high-capacity IndexedDB:', error?.message);
      }
    } catch (err) {
      console.info('Supabase storage offline. Storing locally in IndexedDB:', err);
    }
  }

  // 2. High-capacity local storage using native IndexedDB (supports large files without localStorage limits)
  const localUrl = await saveFileToIndexedDB(attachmentId, file, file.name);

  return {
    id: attachmentId,
    name: file.name,
    url: localUrl,
    size: file.size,
    fileType: file.type || 'application/octet-stream',
    uploadedAt: timestamp,
    uploadedBy: uploaderName
  };
};

export const deleteAttachmentFile = async (fileUrl: string): Promise<boolean> => {
  if (isSupabaseConfigured() && supabase && fileUrl.includes(ATTACHMENTS_BUCKET)) {
    try {
      const urlParts = fileUrl.split(`${ATTACHMENTS_BUCKET}/`);
      if (urlParts.length > 1) {
        const path = urlParts[1];
        const { error } = await supabase.storage.from(ATTACHMENTS_BUCKET).remove([path]);
        return !error;
      }
    } catch (err) {
      console.warn('Failed to delete file from Supabase storage:', err);
    }
  }
  return true;
};
