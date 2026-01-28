'use client';

import { useState, useCallback } from 'react';

/**
 * Image metadata from upload
 */
export interface UploadedImageMetadata {
  width: number;
  height: number;
  format: string;
  size: number;
}

/**
 * Result of a successful upload
 */
export interface UploadResult {
  url: string;
  key: string;
  metadata: UploadedImageMetadata;
}

/**
 * Hook return type
 */
interface UseImageUploadResult {
  upload: (file: File) => Promise<UploadResult>;
  isUploading: boolean;
  error: string | null;
  reset: () => void;
}

/**
 * Options for the upload hook
 */
interface UseImageUploadOptions {
  folder?: string;
  onSuccess?: (result: UploadResult) => void;
  onError?: (error: Error) => void;
}

/**
 * Get image dimensions from a File
 */
async function getImageDimensions(
  file: File
): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(img.src);
      resolve({ width: img.width, height: img.height });
    };
    img.onerror = () => {
      URL.revokeObjectURL(img.src);
      reject(new Error('Failed to load image'));
    };
    img.src = URL.createObjectURL(file);
  });
}

/**
 * React hook for uploading images to R2 via presigned URLs
 *
 * @example
 * ```tsx
 * const { upload, isUploading, error } = useImageUpload({ folder: 'source' });
 *
 * const handleFileSelect = async (file: File) => {
 *   try {
 *     const result = await upload(file);
 *     console.log('Uploaded to:', result.url);
 *   } catch (err) {
 *     console.error('Upload failed:', err);
 *   }
 * };
 * ```
 */
export function useImageUpload(
  options: UseImageUploadOptions = {}
): UseImageUploadResult {
  const { folder = 'uploads', onSuccess, onError } = options;

  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reset = useCallback(() => {
    setIsUploading(false);
    setError(null);
  }, []);

  const upload = useCallback(
    async (file: File): Promise<UploadResult> => {
      setIsUploading(true);
      setError(null);

      try {
        // Step 1: Validate image and get dimensions first
        const dimensions = await getImageDimensions(file);

        // Step 2: Get presigned URL from our API
        const presignedRes = await fetch('/api/storage/presigned', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            folder,
            contentType: file.type,
          }),
        });

        if (!presignedRes.ok) {
          const errorData = await presignedRes.json().catch(() => ({}));
          throw new Error(
            errorData.error || `Failed to get upload URL (${presignedRes.status})`
          );
        }

        const { uploadUrl, publicUrl, key } = await presignedRes.json();

        // Step 3: Upload directly to R2 using presigned URL
        const uploadRes = await fetch(uploadUrl, {
          method: 'PUT',
          body: file,
          headers: {
            'Content-Type': file.type,
          },
        });

        if (!uploadRes.ok) {
          throw new Error(`Failed to upload file (${uploadRes.status})`);
        }

        const result: UploadResult = {
          url: publicUrl,
          key,
          metadata: {
            width: dimensions.width,
            height: dimensions.height,
            format: file.type.split('/')[1] || 'unknown',
            size: file.size,
          },
        };

        onSuccess?.(result);

        return result;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Upload failed';
        setError(errorMessage);
        const error = err instanceof Error ? err : new Error(errorMessage);
        onError?.(error);
        throw error;
      } finally {
        setIsUploading(false);
      }
    },
    [folder, onSuccess, onError]
  );

  return { upload, isUploading, error, reset };
}
