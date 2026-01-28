/**
 * Image Model Registry
 *
 * Central registry for all available image generation models.
 * New models can be added to the IMAGE_MODELS array.
 *
 * Provider-specific capabilities are derived from the model ID prefix.
 * See lib/modelProviders/types.ts for provider capabilities.
 */

export interface ImageModel {
  /** Runware model AIR ID (e.g., 'google:4@2') */
  id: string;
  /** Display name shown in UI */
  name: string;
  /** Default output width */
  defaultWidth: number;
  /** Default output height */
  defaultHeight: number;
}

/**
 * Available image generation models.
 */
export const IMAGE_MODELS: ImageModel[] = [
  {
    id: 'google:4@1',
    name: 'Nano Banana',
    defaultWidth: 1024,
    defaultHeight: 1024,
  },
  {
    id: 'google:4@2',
    name: 'Banana Pro',
    defaultWidth: 1024,
    defaultHeight: 1024,
  },
];

/** Default model used when creating new image nodes */
export const DEFAULT_IMAGE_MODEL = IMAGE_MODELS[0];
