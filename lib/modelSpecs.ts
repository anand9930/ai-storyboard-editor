/**
 * Model Specifications Registry
 *
 * Central registry defining each image model's supported aspect ratios,
 * quality tiers, and pixel dimensions.
 *
 * Data sourced from Runware provider documentation.
 */

import type { AspectRatio } from '@/features/flow/types/nodes';

export type Quality = 'Auto' | '1K' | '2K' | '4K';

export interface Dimensions {
  width: number;
  height: number;
}

export interface ModelSpec {
  id: string;
  name: string;
  supportedQualities: Quality[];
  supportedAspectRatios: AspectRatio[];
  /** Dimensions indexed by quality, then aspect ratio */
  dimensions: Partial<Record<Quality, Partial<Record<AspectRatio, Dimensions>>>>;
  /** Default quality when creating new nodes */
  defaultQuality: Quality;
  /** Default aspect ratio when creating new nodes (null = Auto) */
  defaultAspectRatio: AspectRatio | null;
}

// ============================================================================
// Model Specifications
// ============================================================================

const NANO_BANANA: ModelSpec = {
  id: 'google:4@1',
  name: 'Nano Banana',
  supportedQualities: ['1K'],
  supportedAspectRatios: ['1:1', '3:2', '2:3', '4:3', '3:4', '5:4', '4:5', '16:9', '9:16', '21:9'],
  defaultQuality: '1K',
  defaultAspectRatio: null, // Auto
  dimensions: {
    '1K': {
      '1:1': { width: 1024, height: 1024 },
      '3:2': { width: 1248, height: 832 },
      '2:3': { width: 832, height: 1248 },
      '4:3': { width: 1184, height: 864 },
      '3:4': { width: 864, height: 1184 },
      '5:4': { width: 1152, height: 896 },
      '4:5': { width: 896, height: 1152 },
      '16:9': { width: 1344, height: 768 },
      '9:16': { width: 768, height: 1344 },
      '21:9': { width: 1536, height: 672 },
    },
  },
};

const BANANA_PRO: ModelSpec = {
  id: 'google:4@2',
  name: 'Banana Pro',
  supportedQualities: ['1K', '2K', '4K'],
  supportedAspectRatios: ['1:1', '3:2', '2:3', '4:3', '3:4', '4:5', '5:4', '9:16', '16:9', '21:9'],
  defaultQuality: '1K',
  defaultAspectRatio: null, // Auto
  dimensions: {
    '1K': {
      '1:1': { width: 1024, height: 1024 },
      '3:2': { width: 1264, height: 848 },
      '2:3': { width: 848, height: 1264 },
      '4:3': { width: 1200, height: 896 },
      '3:4': { width: 896, height: 1200 },
      '4:5': { width: 928, height: 1152 },
      '5:4': { width: 1152, height: 928 },
      '9:16': { width: 768, height: 1376 },
      '16:9': { width: 1376, height: 768 },
      '21:9': { width: 1548, height: 672 },
    },
    '2K': {
      '1:1': { width: 2048, height: 2048 },
      '3:2': { width: 2528, height: 1696 },
      '2:3': { width: 1696, height: 2528 },
      '4:3': { width: 2400, height: 1792 },
      '3:4': { width: 1792, height: 2400 },
      '4:5': { width: 1856, height: 2304 },
      '5:4': { width: 2304, height: 1856 },
      '9:16': { width: 1536, height: 2752 },
      '16:9': { width: 2752, height: 1536 },
      '21:9': { width: 3168, height: 1344 },
    },
    '4K': {
      '1:1': { width: 4096, height: 4096 },
      '3:2': { width: 5056, height: 3392 },
      '2:3': { width: 3392, height: 5056 },
      '4:3': { width: 4800, height: 3584 },
      '3:4': { width: 3584, height: 4800 },
      '4:5': { width: 3712, height: 4608 },
      '5:4': { width: 4608, height: 3712 },
      '9:16': { width: 3072, height: 5504 },
      '16:9': { width: 5504, height: 3072 },
      '21:9': { width: 6336, height: 2688 },
    },
  },
};

const FLUX: ModelSpec = {
  id: 'bfl:3@1',
  name: 'Flux',
  supportedQualities: ['1K'],
  supportedAspectRatios: ['1:1', '3:2', '2:3', '4:3', '3:4', '16:9', '9:16', '21:9', '9:21'],
  defaultQuality: '1K',
  defaultAspectRatio: null, // Auto
  dimensions: {
    '1K': {
      '1:1': { width: 1024, height: 1024 },
      '3:2': { width: 1248, height: 832 },
      '2:3': { width: 832, height: 1248 },
      '4:3': { width: 1184, height: 880 },
      '3:4': { width: 880, height: 1184 },
      '16:9': { width: 1392, height: 752 },
      '9:16': { width: 752, height: 1392 },
      '21:9': { width: 1568, height: 672 },
      '9:21': { width: 672, height: 1568 },
    },
  },
};

const FLUX_MAX: ModelSpec = {
  id: 'bfl:4@1',
  name: 'Flux Max',
  supportedQualities: ['1K'],
  supportedAspectRatios: ['1:1', '3:2', '2:3', '4:3', '3:4', '16:9', '9:16', '21:9', '9:21'],
  defaultQuality: '1K',
  defaultAspectRatio: null, // Auto
  dimensions: {
    '1K': {
      '1:1': { width: 1024, height: 1024 },
      '3:2': { width: 1248, height: 832 },
      '2:3': { width: 832, height: 1248 },
      '4:3': { width: 1184, height: 880 },
      '3:4': { width: 880, height: 1184 },
      '16:9': { width: 1392, height: 752 },
      '9:16': { width: 752, height: 1392 },
      '21:9': { width: 1568, height: 672 },
      '9:21': { width: 672, height: 1568 },
    },
  },
};

const SEEDREAM_4: ModelSpec = {
  id: 'bytedance:5@0',
  name: 'Seedream 4',
  supportedQualities: ['2K', '4K'],
  supportedAspectRatios: ['1:1', '4:3', '3:4', '16:9', '9:16', '3:2', '2:3', '21:9'],
  defaultQuality: '2K',
  defaultAspectRatio: null, // Auto
  dimensions: {
    '2K': {
      '1:1': { width: 2048, height: 2048 },
      '4:3': { width: 2304, height: 1728 },
      '3:4': { width: 1728, height: 2304 },
      '16:9': { width: 2560, height: 1440 },
      '9:16': { width: 1440, height: 2560 },
      '3:2': { width: 2496, height: 1664 },
      '2:3': { width: 1664, height: 2496 },
      '21:9': { width: 3024, height: 1296 },
    },
    '4K': {
      '1:1': { width: 4096, height: 4096 },
      '4:3': { width: 4608, height: 3456 },
      '3:4': { width: 3456, height: 4608 },
      '16:9': { width: 5120, height: 2880 },
      '9:16': { width: 2880, height: 5120 },
      '3:2': { width: 4992, height: 3328 },
      '2:3': { width: 3328, height: 4992 },
      '21:9': { width: 6048, height: 2592 },
    },
  },
};

const SEEDREAM_45: ModelSpec = {
  id: 'bytedance:seedream@4.5',
  name: 'Seedream 4.5',
  supportedQualities: ['2K', '4K'],
  supportedAspectRatios: ['1:1', '4:3', '3:4', '16:9', '9:16', '3:2', '2:3', '21:9'],
  defaultQuality: '2K',
  defaultAspectRatio: null, // Auto
  dimensions: {
    '2K': {
      '1:1': { width: 2048, height: 2048 },
      '4:3': { width: 2304, height: 1728 },
      '3:4': { width: 1728, height: 2304 },
      '16:9': { width: 2560, height: 1440 },
      '9:16': { width: 1440, height: 2560 },
      '3:2': { width: 2496, height: 1664 },
      '2:3': { width: 1664, height: 2496 },
      '21:9': { width: 3024, height: 1296 },
    },
    '4K': {
      '1:1': { width: 4096, height: 4096 },
      '4:3': { width: 4608, height: 3456 },
      '3:4': { width: 3456, height: 4608 },
      '16:9': { width: 5120, height: 2880 },
      '9:16': { width: 2880, height: 5120 },
      '3:2': { width: 4992, height: 3328 },
      '2:3': { width: 3328, height: 4992 },
      '21:9': { width: 6048, height: 2592 },
    },
  },
};

// ============================================================================
// Registry & Helper Functions
// ============================================================================

/** All model specifications indexed by model ID */
export const MODEL_SPECS: Record<string, ModelSpec> = {
  [NANO_BANANA.id]: NANO_BANANA,
  [BANANA_PRO.id]: BANANA_PRO,
  [FLUX.id]: FLUX,
  [FLUX_MAX.id]: FLUX_MAX,
  [SEEDREAM_4.id]: SEEDREAM_4,
  [SEEDREAM_45.id]: SEEDREAM_45,
};

/** Ordered list of all model specs for UI rendering */
export const MODEL_SPECS_LIST: ModelSpec[] = [
  NANO_BANANA,
  BANANA_PRO,
  FLUX,
  FLUX_MAX,
  SEEDREAM_4,
  SEEDREAM_45,
];

/** Default model spec */
export const DEFAULT_MODEL_SPEC = NANO_BANANA;

/**
 * Get the model specification for a given model ID
 */
export function getModelSpec(modelId: string): ModelSpec | undefined {
  return MODEL_SPECS[modelId];
}

/**
 * Get the pixel dimensions for a specific model, quality, and aspect ratio combination.
 * Falls back to model defaults if the exact combination is not found.
 * When aspectRatio is null (Auto), defaults to 1:1.
 */
export function getDimensions(
  modelId: string,
  quality: Quality | null,
  aspectRatio: AspectRatio | null
): Dimensions {
  const spec = MODEL_SPECS[modelId];
  if (!spec) {
    // Fallback for unknown models
    return { width: 1024, height: 1024 };
  }

  const effectiveQuality = quality ?? spec.defaultQuality;
  // When aspect ratio is null (Auto), default to 1:1
  const effectiveAspectRatio = aspectRatio ?? '1:1';

  const qualityDimensions = spec.dimensions[effectiveQuality];
  if (!qualityDimensions) {
    // Quality not supported, try default quality
    const defaultQualityDimensions = spec.dimensions[spec.defaultQuality];
    return defaultQualityDimensions?.[effectiveAspectRatio] ?? { width: 1024, height: 1024 };
  }

  const dimensions = qualityDimensions[effectiveAspectRatio];
  if (!dimensions) {
    // Aspect ratio not supported for this quality, return first available
    const firstRatio = spec.supportedAspectRatios[0];
    return qualityDimensions[firstRatio] ?? { width: 1024, height: 1024 };
  }

  return dimensions;
}

/**
 * Check if a quality option is supported by a model
 */
export function isQualitySupported(modelId: string, quality: Quality): boolean {
  const spec = MODEL_SPECS[modelId];
  return spec?.supportedQualities.includes(quality) ?? false;
}

/**
 * Check if an aspect ratio is supported by a model
 */
export function isAspectRatioSupported(modelId: string, aspectRatio: AspectRatio): boolean {
  const spec = MODEL_SPECS[modelId];
  return spec?.supportedAspectRatios.includes(aspectRatio) ?? false;
}

/**
 * Get the default quality and aspect ratio for a model.
 * Useful when switching models to reset to valid defaults.
 */
export function getModelDefaults(modelId: string): {
  quality: Quality;
  aspectRatio: AspectRatio | null;
} {
  const spec = MODEL_SPECS[modelId] ?? DEFAULT_MODEL_SPEC;
  return {
    quality: spec.defaultQuality,
    aspectRatio: spec.defaultAspectRatio,
  };
}
