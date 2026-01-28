/**
 * Storage module type definitions
 * Provides interface abstraction for storage operations
 */

// Image metadata returned with uploads
export interface ImageMetadata {
  width: number;
  height: number;
  format: string;
  size: number;
}

// Result returned after successful upload
export interface UploadResult {
  url: string; // Public URL to access the image
  key: string; // R2 object key for deletion/management
  metadata: ImageMetadata;
}

// Presigned URL for direct browser uploads
export interface PresignedUploadUrl {
  uploadUrl: string; // URL to PUT the file to
  publicUrl: string; // URL to access after upload
  key: string; // Object key in R2
  expiresAt: Date;
}

// Options for upload operations
export interface UploadOptions {
  folder?: string; // e.g., "generated", "source"
  filename?: string; // Custom filename
  contentType?: string;
}

// Options for presigned URL generation
export interface PresignedOptions {
  folder?: string;
  expiresIn?: number; // Seconds, default 3600
  contentType?: string;
}

/**
 * Storage service interface
 * Enables mocking for tests and swapping implementations (e.g., R2 -> S3 -> local)
 */
export interface IStorageService {
  /**
   * Upload a base64 encoded image
   * @param base64Data - Data URL format: data:image/png;base64,...
   * @param options - Upload options
   */
  uploadBase64(base64Data: string, options?: UploadOptions): Promise<UploadResult>;

  /**
   * Upload a buffer directly
   * @param buffer - Image buffer
   * @param options - Upload options
   */
  uploadBuffer(buffer: Buffer, options?: UploadOptions): Promise<UploadResult>;

  /**
   * Upload an image from a URL
   * Fetches the image and re-uploads it to storage
   * @param imageUrl - URL of the image to fetch and upload
   * @param options - Upload options
   */
  uploadFromUrl(imageUrl: string, options?: UploadOptions): Promise<UploadResult>;

  /**
   * Generate a presigned URL for direct browser upload
   * @param options - Presigned URL options
   */
  generatePresignedUploadUrl(options?: PresignedOptions): Promise<PresignedUploadUrl>;

  /**
   * Delete an object by key
   * @param key - Object key to delete
   */
  delete(key: string): Promise<void>;
}
