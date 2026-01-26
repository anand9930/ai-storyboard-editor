'use client';

import { useMemo } from 'react';
import { useNodeConnections, useNodesData } from '@xyflow/react';
import type { AppNode, SourceNodeData, ImageNodeData, ConnectedImage } from '@/types/nodes';

interface UseSourceConnectionOptions {
  nodeId: string;
}

interface UseSourceConnectionResult {
  sourceImages: ConnectedImage[];
  isConnected: boolean;
  connectedNodeIds: string[];
  connectedNodeTypes: string[];
}

/**
 * Custom hook for tracking source image connections on nodes.
 * Returns all connected images from SourceNode and ImageNode sources,
 * plus connection info for auto-transition logic.
 *
 * @example
 * ```tsx
 * const { sourceImages, isConnected, connectedNodeTypes } = useSourceConnection({
 *   nodeId: id,
 * });
 * ```
 */
export function useSourceConnection({
  nodeId,
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

  // Extract node types from connected nodes (for auto-transition logic)
  const connectedNodeTypes = useMemo(
    () => connectedNodesData.map((n) => n?.type).filter(Boolean) as string[],
    [connectedNodesData]
  );

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

  return {
    sourceImages,
    isConnected: connectedNodeIds.length > 0,
    connectedNodeIds,
    connectedNodeTypes,
  };
}
