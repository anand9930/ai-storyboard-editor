/**
 * Aspect Ratio Utilities
 *
 * Converts aspect ratio strings to pixel dimensions for image generation APIs
 * that require width/height instead of aspect ratio.
 */

import type { AspectRatio } from '@/types/nodes';

export interface Dimensions {
  width: number;
  height: number;
}

/**
 * Supported dimensions for Runware Google model (1K variants)
 * These are the only dimensions accepted by the API.
 */
const SUPPORTED_DIMENSIONS: Record<string, Dimensions> = {
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
};

const DEFAULT_DIMENSIONS: Dimensions = { width: 1024, height: 1024 };

/**
 * Convert an aspect ratio string to width and height dimensions.
 * Uses hardcoded values supported by Runware API.
 *
 * @param aspectRatio - Aspect ratio string like '16:9', '1:1', etc. Null means square.
 * @returns Object with width and height in pixels
 */
export function aspectRatioToDimensions(
  aspectRatio: AspectRatio | null
): Dimensions {
  if (!aspectRatio) {
    return DEFAULT_DIMENSIONS;
  }

  return SUPPORTED_DIMENSIONS[aspectRatio] ?? DEFAULT_DIMENSIONS;
}

/**
 * Get the aspect ratio as a decimal number
 * @param aspectRatio - Aspect ratio string
 * @returns Decimal ratio (e.g., 16:9 returns 1.777...)
 */
export function getAspectRatioDecimal(aspectRatio: AspectRatio | null): number {
  if (!aspectRatio) return 1;

  const parts = aspectRatio.split(':');
  if (parts.length !== 2) return 1;

  const w = parseInt(parts[0], 10);
  const h = parseInt(parts[1], 10);

  if (isNaN(w) || isNaN(h) || h === 0) return 1;

  return w / h;
}
