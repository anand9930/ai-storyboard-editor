'use client';

import { useEffect, useMemo } from 'react';
import { useNodeConnections, useNodesData } from '@xyflow/react';
import type { AppNode, SourceNodeData, ImageNodeData } from '@/types/nodes';

interface UseSourceConnectionOptions {
  nodeId: string;
  onSourceImageChange?: (sourceImage: string | undefined) => void;
}

interface UseSourceConnectionResult {
  sourceImage: string | undefined;
  isConnected: boolean;
  connectedNodeId: string | undefined;
}

/**
 * Custom hook for tracking source image connections on image nodes.
 * Replaces the deprecated useHandleConnections with useNodeConnections.
 *
 * @example
 * ```tsx
 * const { sourceImage, isConnected } = useSourceConnection({
 *   nodeId: id,
 *   onSourceImageChange: (image) => updateNodeData(id, { sourceImage: image }),
 * });
 * ```
 */
export function useSourceConnection({
  nodeId,
  onSourceImageChange,
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

  // Extract source image from the first connected node
  const { sourceImage, connectedNodeId } = useMemo(() => {
    if (connectedNodesData.length === 0) {
      return { sourceImage: undefined, connectedNodeId: undefined };
    }

    const firstNode = connectedNodesData[0];
    if (!firstNode) {
      return { sourceImage: undefined, connectedNodeId: undefined };
    }

    let image: string | undefined;

    // Check if it's a source node with an image
    if (firstNode.type === 'source') {
      const sourceData = firstNode.data as SourceNodeData;
      image = sourceData?.image?.url;
    }
    // Check if it's an image node with a generated image
    else if (firstNode.type === 'image') {
      const imageData = firstNode.data as ImageNodeData;
      image = imageData?.generatedImage;
    }

    return {
      sourceImage: image,
      connectedNodeId: firstNode.id
    };
  }, [connectedNodesData]);

  // Notify parent when source image changes
  useEffect(() => {
    if (onSourceImageChange) {
      onSourceImageChange(sourceImage);
    }
  }, [sourceImage, onSourceImageChange]);

  return {
    sourceImage,
    isConnected: connectedNodeIds.length > 0,
    connectedNodeId,
  };
}
