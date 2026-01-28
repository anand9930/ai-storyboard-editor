/**
 * Custom error class for storage operations
 * Provides meaningful error messages and preserves cause chain
 */
export class StorageError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = 'StorageError';
  }
}

/**
 * Error thrown when R2 configuration is invalid or missing
 */
export class StorageConfigError extends StorageError {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = 'StorageConfigError';
  }
}
