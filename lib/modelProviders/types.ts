/**
 * Model Provider Types & Capabilities
 *
 * Defines the supported model providers in Runware and their capabilities.
 */

/**
 * Supported model providers in Runware
 * Model AIR ID format: source:id@version (e.g., google:4@2)
 */
export type ModelProviderType = 'google' | 'bfl' | 'bytedance' | 'default';

/**
 * Capabilities that define what parameters a model provider supports
 */
export interface ModelProviderCapabilities {
  /** Provider supports image-to-image workflows */
  supportsImageToImage: boolean;
  /** Uses standard seedImage parameter */
  supportsSeedImage: boolean;
  /** Uses referenceImages array (Google-specific) */
  supportsReferenceImages: boolean;
  /** Supports strength parameter for image-to-image */
  supportsStrength: boolean;
  /** Supports negative prompts */
  supportsNegativePrompt: boolean;
  /** Supports custom inference steps */
  supportsSteps: boolean;
  /** Maximum reference images allowed (for Google) */
  maxReferenceImages?: number;
  /** Minimum effective strength value */
  minStrength?: number;
}

/**
 * Capabilities for each model provider
 */
export const MODEL_PROVIDER_CAPABILITIES: Record<ModelProviderType, ModelProviderCapabilities> = {
  // Google Imagen models use referenceImages instead of seedImage/strength
  google: {
    supportsImageToImage: true,
    supportsSeedImage: false,
    supportsReferenceImages: true,
    supportsStrength: false,
    supportsNegativePrompt: false,
    supportsSteps: false,
    maxReferenceImages: 14,
  },

  // Black Forest Labs Flux Kontext models use referenceImages
  bfl: {
    supportsImageToImage: true,
    supportsSeedImage: false,
    supportsReferenceImages: true,
    supportsStrength: false,
    supportsNegativePrompt: false,
    supportsSteps: false,
    maxReferenceImages: 2,
  },

  // ByteDance Seedream models use referenceImages
  bytedance: {
    supportsImageToImage: true,
    supportsSeedImage: false,
    supportsReferenceImages: true,
    supportsStrength: false,
    supportsNegativePrompt: false,
    supportsSteps: false,
    maxReferenceImages: 14,
  },

  // Default fallback for unknown providers
  default: {
    supportsImageToImage: true,
    supportsSeedImage: true,
    supportsReferenceImages: false,
    supportsStrength: true,
    supportsNegativePrompt: true,
    supportsSteps: true,
  },
};
