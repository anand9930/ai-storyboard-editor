/**
 * Model Provider Request Builder
 *
 * Builds provider-aware requests for the Runware API.
 * Automatically includes/excludes parameters based on provider capabilities.
 */

import type { IRequestImage } from '@runware/sdk-js';
import { getModelProviderCapabilities } from './utils';

/**
 * Parameters for image generation
 */
export interface ImageGenerationParams {
  /** The positive prompt describing the desired image */
  prompt: string;
  /** Model AIR ID (e.g., 'google:4@2') */
  model: string;
  /** Source image URL for image-to-image (R2 URL or public URL) */
  seedImage?: string;
  /** Output image width */
  width?: number;
  /** Output image height */
  height?: number;
  /** Number of inference steps */
  steps?: number;
  /** Strength for image-to-image (0-1) */
  strength?: number;
  /** Negative prompt */
  negativePrompt?: string;
  /** Presigned URL for direct upload (Runware uploads directly to this URL) */
  uploadEndpoint?: string;
}

/**
 * Build a provider-aware request for Runware API
 *
 * Automatically includes parameters only if the provider supports them.
 * Google uses referenceImages instead of seedImage/strength.
 *
 * @param params - Generation parameters
 * @returns Request object ready for Runware API
 */
export function buildModelProviderRequest(
  params: ImageGenerationParams
): IRequestImage {
  const capabilities = getModelProviderCapabilities(params.model);

  // Base request - always included
  const request: IRequestImage = {
    positivePrompt: params.prompt,
    model: params.model,
    width: params.width ?? 1024,
    height: params.height ?? 1024,
    outputType: 'URL',
    outputFormat: 'PNG',
    numberResults: 1,
  };

  // Add steps only if provider supports it
  if (capabilities.supportsSteps && params.steps) {
    request.steps = params.steps;
  }

  // Add negative prompt only if provider supports it
  if (capabilities.supportsNegativePrompt && params.negativePrompt) {
    request.negativePrompt = params.negativePrompt;
  }

  // Handle image-to-image based on provider mechanism
  if (params.seedImage) {
    if (capabilities.supportsReferenceImages) {
      // Google: uses referenceImages array instead of seedImage
      // Note: Google auto-matches aspect ratio from reference image
      request.referenceImages = [params.seedImage];
    } else if (capabilities.supportsSeedImage) {
      // FLUX/SDXL: uses standard seedImage + strength
      request.seedImage = params.seedImage;

      if (capabilities.supportsStrength) {
        const strength = params.strength ?? 0.8;
        // Apply minimum strength if provider requires it (e.g., FLUX needs >0.8)
        const effectiveStrength = capabilities.minStrength
          ? Math.max(strength, capabilities.minStrength)
          : strength;
        request.strength = effectiveStrength;
      }
    }
    // If provider supports neither, seedImage is silently ignored
  }

  // Pass through uploadEndpoint for direct storage upload
  if (params.uploadEndpoint) {
    request.uploadEndpoint = params.uploadEndpoint;
  }

  return request;
}
