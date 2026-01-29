/**
 * Runware SDK Error Extraction Utility
 *
 * Handles multiple error structures returned by the Runware SDK:
 * - TServerError: { error: { code, message, ... } }
 * - IErrorResponse: { code, message, ... }
 * - Standard Error instances
 * - Unknown error types
 */

interface RunwareNestedError {
  error?: {
    code?: string;
    message?: string;
    responseContent?: string;
  };
}

interface RunwareDirectError {
  code?: string;
  message?: string;
}

/**
 * Extracts a user-friendly error message from Runware SDK errors.
 *
 * The Runware SDK can throw errors in multiple formats:
 * 1. Nested: { error: { message: "..." } } - Content moderation, API errors
 * 2. Direct: { code: "...", message: "..." } - IErrorResponse format
 * 3. Standard: Error instance with message property
 * 4. String: Direct string throw
 *
 * @param error - The error caught in the catch block
 * @param fallbackMessage - Optional custom fallback message
 * @returns A user-friendly error message string
 */
export function extractRunwareErrorMessage(
  error: unknown,
  fallbackMessage = 'Failed to generate image'
): string {
  // Case 1: Nested Runware error structure { error: { message: "..." } }
  if (error && typeof error === 'object' && 'error' in error) {
    const nestedError = (error as RunwareNestedError).error;
    if (nestedError && typeof nestedError === 'object') {
      if (nestedError.message) {
        return nestedError.message;
      }
      // Fallback to responseContent if message is not available
      if (nestedError.responseContent) {
        return nestedError.responseContent;
      }
    }
  }

  // Case 2: Direct error response format { code: "...", message: "..." }
  if (
    error &&
    typeof error === 'object' &&
    'code' in error &&
    'message' in error &&
    typeof (error as RunwareDirectError).message === 'string'
  ) {
    return (error as RunwareDirectError).message!;
  }

  // Case 3: Standard Error instance
  if (error instanceof Error) {
    return error.message;
  }

  // Case 4: String error
  if (typeof error === 'string') {
    return error;
  }

  // Case 5: Fallback for unknown error types
  return fallbackMessage;
}
