/**
 * Runware SDK Service
 *
 * Server-side wrapper for the Runware image generation API.
 * Uses a singleton pattern to maintain a single WebSocket connection.
 */

import { RunwareServer } from '@runware/sdk-js';
import type { ITextToImage } from '@runware/sdk-js';
import { buildModelProviderRequest, type ImageGenerationParams } from './modelProviders';

// Singleton instance for server-side use
let runwareInstance: RunwareServer | null = null;

/**
 * Get or create the Runware client instance.
 * Uses singleton pattern to reuse WebSocket connection.
 */
export async function getRunwareClient(): Promise<RunwareServer> {
  if (!process.env.RUNWARE_API_KEY) {
    throw new Error('RUNWARE_API_KEY environment variable is not set');
  }

  if (!runwareInstance) {
    runwareInstance = new RunwareServer({
      apiKey: process.env.RUNWARE_API_KEY,
      shouldReconnect: true,
      globalMaxRetries: 3,
      timeoutDuration: 120000, // 2 minutes
    });
    await runwareInstance.ensureConnection();
  }

  return runwareInstance;
}

/**
 * Generate an image using the Runware API.
 *
 * Supports both text-to-image (no seedImage) and image-to-image (with seedImage).
 * Automatically handles provider-specific parameters:
 * - Google: uses referenceImages instead of seedImage/strength
 * - FLUX/SDXL: uses seedImage + strength
 *
 * @param params - Generation parameters
 * @returns Array of generated images (typically 1)
 *
 * @example
 * // Text-to-image
 * const images = await generateImage({
 *   prompt: 'A beautiful sunset over mountains',
 *   model: 'google:4@2',
 * });
 *
 * // Image-to-image (Google uses referenceImages automatically)
 * const images = await generateImage({
 *   prompt: 'Make it more vibrant',
 *   model: 'google:4@2',
 *   seedImage: 'https://r2.example.com/source.png',
 * });
 */
export async function generateImage(
  params: ImageGenerationParams
): Promise<ITextToImage[]> {
  const client = await getRunwareClient();

  // Build provider-aware request (handles Google vs FLUX vs SDXL differences)
  const request = buildModelProviderRequest(params);

  // Make the API call
  const results = await client.imageInference(request);

  if (!results || results.length === 0) {
    throw new Error('No images returned from generation');
  }

  return results;
}

/**
 * Disconnect the Runware client.
 * Useful for cleanup during server shutdown.
 */
export async function disconnectRunware(): Promise<void> {
  if (runwareInstance) {
    await runwareInstance.disconnect();
    runwareInstance = null;
  }
}
