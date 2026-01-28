/**
 * Model Provider Utilities
 *
 * Helper functions for detecting model providers and getting their capabilities.
 */

import {
  ModelProviderType,
  MODEL_PROVIDER_CAPABILITIES,
  ModelProviderCapabilities,
} from './types';

/**
 * Detect model provider from model AIR ID
 *
 * AIR ID format: source:id@version
 * Example: google:4@2 → google
 *
 * @param modelId - The model AIR ID
 * @returns The provider type
 */
export function getModelProvider(modelId: string): ModelProviderType {
  const prefix = modelId.split(':')[0]?.toLowerCase();

  if (prefix === 'google') {
    return 'google';
  }
  return 'default';
}

/**
 * Get capabilities for a model based on its provider
 *
 * @param modelId - The model AIR ID
 * @returns The provider capabilities
 */
export function getModelProviderCapabilities(
  modelId: string
): ModelProviderCapabilities {
  const provider = getModelProvider(modelId);
  return MODEL_PROVIDER_CAPABILITIES[provider];
}
