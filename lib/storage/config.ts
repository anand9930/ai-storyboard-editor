import { StorageConfigError } from './errors';

/**
 * R2 configuration interface
 */
export interface R2Config {
  accountId: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucketName: string;
  publicUrl: string;
}

/**
 * Get a required environment variable or throw
 */
function getRequiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new StorageConfigError(
      `Missing required environment variable: ${name}. ` +
        'Please add it to your .env.local file.'
    );
  }
  return value;
}

/**
 * Get validated R2 configuration
 * Throws StorageConfigError if any required env var is missing
 */
export function getR2Config(): R2Config {
  return {
    accountId: getRequiredEnv('CLOUDFLARE_R2_ACCOUNT_ID'),
    accessKeyId: getRequiredEnv('CLOUDFLARE_R2_ACCESS_KEY_ID'),
    secretAccessKey: getRequiredEnv('CLOUDFLARE_R2_SECRET_ACCESS_KEY'),
    bucketName: getRequiredEnv('CLOUDFLARE_R2_BUCKET_NAME'),
    publicUrl: getRequiredEnv('CLOUDFLARE_R2_PUBLIC_URL'),
  };
}
