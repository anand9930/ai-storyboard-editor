import { PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { getR2Client } from './r2-client';
import { getR2Config } from './config';
import type {
  IStorageService,
  UploadResult,
  PresignedUploadUrl,
  UploadOptions,
  PresignedOptions,
} from './types';
import { StorageError } from './errors';

/**
 * R2 Storage Service implementation
 * Implements IStorageService interface for Cloudflare R2
 */
class R2StorageService implements IStorageService {
  /**
   * Generate a unique object key with timestamp and random suffix
   */
  private generateKey(folder: string, filename: string): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 9);
    // Sanitize filename to remove problematic characters
    const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
    return `${folder}/${timestamp}-${random}-${sanitizedFilename}`;
  }

  /**
   * Upload a base64 encoded image to R2
   */
  async uploadBase64(
    base64Data: string,
    options: UploadOptions = {}
  ): Promise<UploadResult> {
    // Parse base64 data URL
    const match = base64Data.match(/^data:image\/(\w+);base64,(.+)$/);
    if (!match) {
      throw new StorageError(
        'Invalid base64 image format. Expected data:image/[format];base64,[data]'
      );
    }

    const format = match[1];
    const data = match[2];
    const buffer = Buffer.from(data, 'base64');

    return this.uploadBuffer(buffer, {
      ...options,
      contentType: `image/${format}`,
      filename: options.filename || `image.${format}`,
    });
  }

  /**
   * Upload a buffer to R2
   */
  async uploadBuffer(
    buffer: Buffer,
    options: UploadOptions = {}
  ): Promise<UploadResult> {
    const config = getR2Config();
    const client = getR2Client();

    const folder = options.folder || 'uploads';
    const filename = options.filename || 'image.png';
    const key = this.generateKey(folder, filename);
    const contentType = options.contentType || 'image/png';

    try {
      await client.send(
        new PutObjectCommand({
          Bucket: config.bucketName,
          Key: key,
          Body: buffer,
          ContentType: contentType,
        })
      );

      // Construct public URL
      const publicUrl = config.publicUrl.endsWith('/')
        ? `${config.publicUrl}${key}`
        : `${config.publicUrl}/${key}`;

      return {
        url: publicUrl,
        key,
        metadata: {
          width: 0, // Caller should set these after loading the image
          height: 0,
          format: contentType.split('/')[1] || 'unknown',
          size: buffer.length,
        },
      };
    } catch (error) {
      throw new StorageError('Failed to upload to R2', { cause: error });
    }
  }

  /**
   * Generate a presigned URL for direct browser upload
   */
  async generatePresignedUploadUrl(
    options: PresignedOptions = {}
  ): Promise<PresignedUploadUrl> {
    const config = getR2Config();
    const client = getR2Client();

    const folder = options.folder || 'uploads';
    const key = this.generateKey(folder, 'upload');
    const expiresIn = options.expiresIn || 3600; // 1 hour default

    const command = new PutObjectCommand({
      Bucket: config.bucketName,
      Key: key,
      ContentType: options.contentType,
    });

    try {
      const uploadUrl = await getSignedUrl(client, command, { expiresIn });

      // Construct public URL
      const publicUrl = config.publicUrl.endsWith('/')
        ? `${config.publicUrl}${key}`
        : `${config.publicUrl}/${key}`;

      return {
        uploadUrl,
        publicUrl,
        key,
        expiresAt: new Date(Date.now() + expiresIn * 1000),
      };
    } catch (error) {
      throw new StorageError('Failed to generate presigned URL', {
        cause: error,
      });
    }
  }

  /**
   * Upload an image from a URL to R2
   * Fetches the image and re-uploads it to R2 for consistent storage
   */
  async uploadFromUrl(
    imageUrl: string,
    options: UploadOptions = {}
  ): Promise<UploadResult> {
    try {
      // Fetch the image from the URL
      const response = await fetch(imageUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
      }

      // Get the content type from the response
      const contentType = response.headers.get('content-type') || 'image/png';
      const format = contentType.split('/')[1] || 'png';

      // Read the response as a buffer
      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // Upload to R2
      return this.uploadBuffer(buffer, {
        ...options,
        contentType,
        filename: options.filename || `image.${format}`,
      });
    } catch (error) {
      if (error instanceof StorageError) {
        throw error;
      }
      throw new StorageError('Failed to upload image from URL', { cause: error });
    }
  }

  /**
   * Delete an object from R2
   */
  async delete(key: string): Promise<void> {
    const config = getR2Config();
    const client = getR2Client();

    try {
      await client.send(
        new DeleteObjectCommand({
          Bucket: config.bucketName,
          Key: key,
        })
      );
    } catch (error) {
      throw new StorageError('Failed to delete from R2', { cause: error });
    }
  }
}

// Export singleton instance
export const storageService: IStorageService = new R2StorageService();
