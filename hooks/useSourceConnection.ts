'use client';

import { useMemo } from 'react';
import { useNodeConnections, useNodesData } from '@xyflow/react';
import type { AppNode, SourceNodeData, ImageNodeData, TextNodeData, ConnectedImage, ConnectedText } from '@/types/nodes';

interface UseSourceConnectionOptions {
  nodeId: string;
}

interface UseSourceConnectionResult {
  sourceImages: ConnectedImage[];
  sourceTexts: ConnectedText[];
  isConnected: boolean;
  connectedNodeIds: string[];
  connectedNodeTypes: string[];
}

/**
 * Custom hook for tracking source image connections on nodes.
 * Returns all connected images from SourceNode and ImageNode sources,
 * plus connection info for auto-transition logic.
 *
 * Note: React Flow's useNodeConnections and useNodesData hooks already have
 * built-in equality checks (areConnectionMapsEqual and shallowNodeData),
 * so we don't need additional ref-based stability patterns.
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
  // useNodeConnections has built-in areConnectionMapsEqual for stability
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

  // useNodesData has built-in shallowNodeData equality for stability
  const connectedNodesData = useNodesData<AppNode>(connectedNodeIds);

  // Extract node types from connected nodes (for auto-transition logic)
  const connectedNodeTypes = useMemo(
    () => connectedNodesData.map((n) => n?.type).filter(Boolean) as string[],
    [connectedNodesData]
  );

  // Extract all source images and texts from connected nodes
  const { sourceImages, sourceTexts } = useMemo(() => {
    const images: ConnectedImage[] = [];
    const texts: ConnectedText[] = [];

    for (const node of connectedNodesData) {
      if (!node) continue;

      // Check if it's a source node with an image
      if (node.type === 'source') {
        const sourceData = node.data as SourceNodeData;
        const imageUrl = sourceData?.image?.url;
        if (imageUrl) {
          images.push({ id: node.id, url: imageUrl });
        }
      }
      // Check if it's an image node with a generated image
      else if (node.type === 'image') {
        const imageData = node.data as ImageNodeData;
        const imageUrl = imageData?.generatedImage;
        if (imageUrl) {
          images.push({ id: node.id, url: imageUrl });
        }
      }
      // Check if it's a text node with content
      else if (node.type === 'text') {
        const textData = node.data as TextNodeData;
        if (textData?.content) {
          texts.push({ id: node.id, content: textData.content });
        }
      }
    }

    return { sourceImages: images, sourceTexts: texts };
  }, [connectedNodesData]);

  return {
    sourceImages,
    sourceTexts,
    isConnected: connectedNodeIds.length > 0,
    connectedNodeIds,
    connectedNodeTypes,
  };
}
