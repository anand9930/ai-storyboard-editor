'use client';

import { useState, memo, useEffect, useCallback, useMemo } from 'react';
import { NodeProps } from '@xyflow/react';
import { RefreshCw, Download } from 'lucide-react';
import { cn } from '@/lib/utils';
import { BaseNode } from './BaseNode';
import { NODE_ACTIONS, PLACEHOLDER_IMAGE } from '@/types/nodes';
import type { ImageNode as ImageNodeType, ImageNodeData } from '@/types/nodes';
import { defaultEdgeOptions } from '@/lib/flowConfig';
import { useWorkflowStore } from '@/store/workflowStore';
import { GenerateFromNodePopup } from '../ui/GenerateFromNodePopup';
import { useSourceConnection } from '@/hooks/useSourceConnection';

// Minimum node dimension constant
const MIN_SIZE = 240;

function ImageNodeComponent({ data, id, selected }: NodeProps<ImageNodeType>) {
  // data is now properly typed as ImageNodeData
  const nodeData = data as ImageNodeData;

  // Get store values and actions
  // Note: nodes is only used inside callbacks, so it doesn't cause render issues
  const { updateNodeData, setSelectedNodeIds, addNode, addEdge, nodes } = useWorkflowStore();
  const [popupSide, setPopupSide] = useState<'left' | 'right' | null>(null);

  // Use custom hook for source image and text tracking
  const { sourceImages, sourceTexts, isConnected } = useSourceConnection({
    nodeId: id,
  });

  // Calculate node dimensions based on generated image aspect ratio
  // Portrait: width=240, height expands | Landscape: height=240, width expands
  const { calculatedWidth, calculatedHeight } = useMemo(() => {
    if (!nodeData.generatedImageMetadata) return { calculatedWidth: MIN_SIZE, calculatedHeight: MIN_SIZE };
    const { width, height } = nodeData.generatedImageMetadata;
    const aspectRatio = width / height;

    if (aspectRatio >= 1) {
      // Landscape or square: height is 240, width expands
      return { calculatedWidth: Math.round(MIN_SIZE * aspectRatio), calculatedHeight: MIN_SIZE };
    } else {
      // Portrait: width is 240, height expands
      return { calculatedWidth: MIN_SIZE, calculatedHeight: Math.round(MIN_SIZE / aspectRatio) };
    }
  }, [nodeData.generatedImageMetadata]);

  // Auto-transition to 'image_to_image' when ANY connection exists (even if source has no image yet)
  useEffect(() => {
    const shouldAutoTransition =
      nodeData.selectedAction === null &&
      !nodeData.generatedImage &&
      isConnected;

    if (shouldAutoTransition) {
      updateNodeData(id, { selectedAction: 'image_to_image' });
    }
  }, [isConnected, id, nodeData.selectedAction, nodeData.generatedImage, updateNodeData]);

  // Update source images when connections change (separate from auto-transition)
  // Uses JSON.stringify for deep comparison to detect changes to ANY connected image,
  // not just the first one or count changes
  useEffect(() => {
    const currentJson = JSON.stringify(nodeData.connectedSourceImages || []);
    const newJson = JSON.stringify(sourceImages);

    if (currentJson !== newJson) {
      updateNodeData(id, {
        connectedSourceImages: sourceImages,
      });
    }
  }, [sourceImages, id, nodeData.connectedSourceImages, updateNodeData]);

  // Update source texts when connections change (for TextNode -> ImageNode connections)
  useEffect(() => {
    const currentJson = JSON.stringify(nodeData.connectedSourceTexts || []);
    const newJson = JSON.stringify(sourceTexts);

    if (currentJson !== newJson) {
      updateNodeData(id, {
        connectedSourceTexts: sourceTexts,
      });
    }
  }, [sourceTexts, id, nodeData.connectedSourceTexts, updateNodeData]);

  // Create a source node with placeholder image and connect it to this image node
  const createSourceNodeWithConnection = useCallback(() => {
    const currentNode = nodes.find((n) => n.id === id);
    if (!currentNode) return;

    const sourceNodeId = `source-${Date.now()}`;
    const newPosition = {
      x: currentNode.position.x - 400,
      y: currentNode.position.y,
    };

    // Create SourceNode with placeholder image
    addNode({
      id: sourceNodeId,
      type: 'source',
      position: newPosition,
      data: {
        name: 'Source',
        image: {
          id: `placeholder-${Date.now()}`,
          url: PLACEHOLDER_IMAGE.url,
          metadata: PLACEHOLDER_IMAGE.metadata,
        },
      },
    });

    // Create edge: SourceNode → ImageNode
    addEdge({
      id: `edge-${sourceNodeId}-${id}`,
      source: sourceNodeId,
      target: id,
      sourceHandle: 'image',
      targetHandle: 'any',
      ...defaultEdgeOptions,
    });
  }, [id, nodes, addNode, addEdge]);

  // Handle action click - creates source node and sets action
  const handleActionClick = useCallback((action: 'image_to_image') => {
    // Create SourceNode with placeholder image
    createSourceNodeWithConnection();
    updateNodeData(id, { selectedAction: action });
    setSelectedNodeIds([id]);
  }, [createSourceNodeWithConnection, updateNodeData, setSelectedNodeIds, id]);

  // Handle name change
  const handleNameChange = useCallback((newName: string) => {
    updateNodeData(id, { name: newName });
  }, [id, updateNodeData]);

  // Handle download of generated image
  const handleDownload = useCallback(() => {
    if (!nodeData.generatedImage) return;

    const link = document.createElement('a');
    link.href = nodeData.generatedImage;
    link.download = `generated-image-${id}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [nodeData.generatedImage, id]);

  // Toolbar content - download button when image is generated
  const toolbarContent = nodeData.generatedImage ? (
    <button
      onClick={handleDownload}
      className="p-1.5 hover:bg-interactive-hover rounded transition-colors text-theme-text-secondary"
      title="Download image"
    >
      <Download className="w-4 h-4" />
    </button>
  ) : null;

  return (
    <>
      <BaseNode
        id={id}
        handles={{ inputs: ['any'], outputs: ['image'] }}
        selected={selected}
        status={nodeData.status}
        onPlusClick={(side) => setPopupSide(side)}
        toolbarContent={toolbarContent}
        nodeName={nodeData.name}
        onNameChange={handleNameChange}
        noPadding={true}
        width={calculatedWidth}
        height={calculatedHeight}
      >
        <div className={cn("h-full flex flex-col", !nodeData.generatedImage && "p-2", !nodeData.generatedImage && !nodeData.selectedAction && "justify-center")}>
          {/* Initial state - Action Options - only show when no action selected and no generated image */}
          {!nodeData.generatedImage && !nodeData.selectedAction && (
            <div className="space-y-2 flex-shrink-0">
              <span className="text-xs text-zinc-500">Try to:</span>
              {NODE_ACTIONS.image.map((action) => (
                <button
                  key={action.id}
                  onClick={() => handleActionClick(action.id as 'image_to_image')}
                  className={cn(
                    'w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-left transition-colors',
                    'hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                  )}
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>{action.label}</span>
                </button>
              ))}
            </div>
          )}

          {/* Active/Ready state - empty dark area waiting for prompt */}
          {!nodeData.generatedImage && nodeData.selectedAction && (
            <div className="h-full flex items-center justify-center bg-surface-secondary rounded-lg min-h-[120px]">
              {/* Empty state - user enters prompt in NodeInputPanel below */}
            </div>
          )}

          {/* Generated state - Image Display */}
          {nodeData.generatedImage && (
            <div className="relative h-full w-full overflow-hidden">
              <img
                src={nodeData.generatedImage}
                alt="Generated"
                className="w-full h-full object-cover"
                draggable={false}
              />
            </div>
          )}
        </div>
      </BaseNode>

      {/* Generate from Node Popup */}
      {popupSide && (
        <GenerateFromNodePopup
          sourceNodeId={id}
          side={popupSide}
          onClose={() => setPopupSide(null)}
        />
      )}
    </>
  );
}

export const ImageNode = memo(ImageNodeComponent);
