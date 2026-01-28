import { S3Client } from '@aws-sdk/client-s3';
import { getR2Config } from './config';

/**
 * Singleton S3 client instance for R2
 * Reused across requests to avoid connection overhead
 */
let client: S3Client | null = null;

/**
 * Get or create the singleton R2 client
 * Uses lazy initialization to avoid errors when env vars aren't set
 */
export function getR2Client(): S3Client {
  if (!client) {
    const config = getR2Config();
    client = new S3Client({
      region: 'auto',
      endpoint: `https://${config.accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
    });
  }
  return client;
}

