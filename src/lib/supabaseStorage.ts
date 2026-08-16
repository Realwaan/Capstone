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

export const uploadAttachmentFile = async (
  file: File,
  folder: 'tasks' | 'deliverables' | 'manuscripts' | 'revisions' = 'tasks',
  uploaderName: string = 'Team Member'
): Promise<TaskAttachment> => {
  const sanitizedName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const filePath = `${folder}/${Date.now()}_${sanitizedName}`;
  const timestamp = new Date().toISOString().split('T')[0];

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
          id: `att-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          name: file.name,
          url: publicUrlData.publicUrl,
          size: file.size,
          fileType: file.type || 'application/octet-stream',
          uploadedAt: timestamp,
          uploadedBy: uploaderName
        };
      } else {
        console.warn('Supabase storage upload error, falling back to local encoding:', error?.message);
      }
    } catch (err) {
      console.warn('Supabase storage network error, falling back to local encoding:', err);
    }
  }

  // Offline / Local Data URL Fallback
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      resolve({
        id: `att-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        name: file.name,
        url: (e.target?.result as string) || '',
        size: file.size,
        fileType: file.type || 'application/octet-stream',
        uploadedAt: timestamp,
        uploadedBy: uploaderName
      });
    };
    reader.readAsDataURL(file);
  });
};

export const deleteAttachmentFile = async (fileUrl: string): Promise<boolean> => {
  if (!isSupabaseConfigured() || !supabase) return true;

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
  return true;
};
