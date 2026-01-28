/**
 * Image Validation Utility
 *
 * Validates images for compatibility with Runware API requirements:
 * - Format: PNG, JPG/JPEG, WEBP only
 * - File size: Max 25MB
 */

export interface ImageValidationResult {
  valid: boolean;
  error?: string;
}

// Supported MIME types for Runware API
export const SUPPORTED_FORMATS = [
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/webp',
] as const;

// Max file size in MB and bytes
export const MAX_FILE_SIZE_MB = 25;
export const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

/**
 * Validate image file format and size
 */
export function validateImageFile(file: File): ImageValidationResult {
  // Check format
  if (!SUPPORTED_FORMATS.includes(file.type as typeof SUPPORTED_FORMATS[number])) {
    const formatName = file.type.split('/')[1]?.toUpperCase() || 'Unknown';
    return {
      valid: false,
      error: `Unsupported format (${formatName}). Please use PNG, JPG, or WEBP.`,
    };
  }

  // Check file size
  if (file.size > MAX_FILE_SIZE_BYTES) {
    const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
    return {
      valid: false,
      error: `File too large (${sizeMB}MB). Maximum size is ${MAX_FILE_SIZE_MB}MB.`,
    };
  }

  return { valid: true };
}

/**
 * Full image validation (format and size)
 */
export async function validateImage(file: File): Promise<ImageValidationResult> {
  return validateImageFile(file);
}
