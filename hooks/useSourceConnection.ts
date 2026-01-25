'use client';

import { useEffect, useMemo } from 'react';
import { useNodeConnections, useNodesData } from '@xyflow/react';
import type { AppNode, SourceNodeData, ImageNodeData, ConnectedImage } from '@/types/nodes';

interface UseSourceConnectionOptions {
  nodeId: string;
  onSourceImagesChange?: (sourceImages: ConnectedImage[]) => void;
}

interface UseSourceConnectionResult {
  sourceImages: ConnectedImage[];
  isConnected: boolean;
  connectedNodeIds: string[];
}

/**
 * Custom hook for tracking source image connections on nodes.
 * Returns all connected images from SourceNode and ImageNode sources.
 *
 * @example
 * ```tsx
 * const { sourceImages, isConnected } = useSourceConnection({
 *   nodeId: id,
 *   onSourceImagesChange: (images) => updateNodeData(id, { connectedSourceImages: images }),
 * });
 * ```
 */
export function useSourceConnection({
  nodeId,
  onSourceImagesChange,
}: UseSourceConnectionOptions): UseSourceConnectionResult {
  // Use the new useNodeConnections hook (replaces deprecated useHandleConnections)
  const connections = useNodeConnections({
    id: nodeId,
    handleType: 'target',
    handleId: 'any',
  });

  // Get connected node IDs
  const connectedNodeIds = useMemo(
    () => connections.map((c) => c.source),
    [connections]
  );

  // Get data from connected nodes
  const connectedNodesData = useNodesData<AppNode>(connectedNodeIds);

  // Extract all source images from connected nodes
  const sourceImages = useMemo(() => {
    const images: ConnectedImage[] = [];

    for (const node of connectedNodesData) {
      if (!node) continue;

      let imageUrl: string | undefined;

      // Check if it's a source node with an image
      if (node.type === 'source') {
        const sourceData = node.data as SourceNodeData;
        imageUrl = sourceData?.image?.url;
      }
      // Check if it's an image node with a generated image
      else if (node.type === 'image') {
        const imageData = node.data as ImageNodeData;
        imageUrl = imageData?.generatedImage;
      }

      if (imageUrl) {
        images.push({ id: node.id, url: imageUrl });
      }
    }

    return images;
  }, [connectedNodesData]);

  // Notify parent when source images change
  useEffect(() => {
    if (onSourceImagesChange) {
      onSourceImagesChange(sourceImages);
    }
  }, [sourceImages, onSourceImagesChange]);

  return {
    sourceImages,
    isConnected: connectedNodeIds.length > 0,
    connectedNodeIds,
  };
}
