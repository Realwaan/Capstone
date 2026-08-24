/**
 * CapStoneFlow Object Storage & Artifact Manager (Phase 5 Scalability)
 * Integrates Cloudflare R2 / AWS S3 / Supabase Storage for large manuscripts, schematics, and ZIP attachments.
 */

export interface StorageUploadResult {
  url: string;
  key: string;
  size: number;
  mimeType: string;
  uploadedAt: string;
}

export class ObjectStorageClient {
  private endpoint: string | null = null;
  private bucket: string = 'capstoneflow-deliverables';

  constructor() {
    this.endpoint = (import.meta as any).env?.VITE_R2_STORAGE_ENDPOINT || null;
  }

  /**
   * Upload an academic artifact file (PDF manuscript, hardware diagram, ZIP repository archive)
   */
  public async uploadDeliverable(
    file: File | Blob, 
    fileName: string,
    projectId: string
  ): Promise<StorageUploadResult> {
    const timestamp = Date.now();
    const sanitizedName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
    const storageKey = `projects/${projectId}/${timestamp}_${sanitizedName}`;

    // If cloud storage endpoint is configured, upload via presigned URL
    if (this.endpoint) {
      try {
        const presignedRes = await fetch(`${this.endpoint}/presigned-url`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key: storageKey, mimeType: file.type || 'application/octet-stream' })
        });

        if (presignedRes.ok) {
          const { uploadUrl, publicUrl } = await presignedRes.json();
          await fetch(uploadUrl, {
            method: 'PUT',
            headers: { 'Content-Type': file.type || 'application/octet-stream' },
            body: file
          });

          return {
            url: publicUrl,
            key: storageKey,
            size: file.size,
            mimeType: file.type || 'application/octet-stream',
            uploadedAt: new Date().toISOString()
          };
        }
      } catch (err) {
        console.warn('[ObjectStorage] Cloud upload fallback to local URL:', err);
      }
    }

    // Fallback: Generate local object URL for offline/dev environments
    const localUrl = URL.createObjectURL(file);
    return {
      url: localUrl,
      key: storageKey,
      size: file.size,
      mimeType: file.type || 'application/octet-stream',
      uploadedAt: new Date().toISOString()
    };
  }
}

export const objectStorage = new ObjectStorageClient();
