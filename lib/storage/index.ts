/**
 * Storage module public API
 *
 * Usage:
 * ```typescript
 * import { storageService } from '@/lib/storage';
 *
 * // Upload base64 image
 * const result = await storageService.uploadBase64(dataUrl, { folder: 'generated' });
 * console.log(result.url);
 *
 * // Generate presigned URL for browser upload
 * const { uploadUrl, publicUrl } = await storageService.generatePresignedUploadUrl();
 * ```
 */

export { storageService } from './storage-service';
export { StorageError, StorageConfigError } from './errors';
export type {
  IStorageService,
  UploadResult,
  PresignedUploadUrl,
  ImageMetadata,
  UploadOptions,
  PresignedOptions,
} from './types';
