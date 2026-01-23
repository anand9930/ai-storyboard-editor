'use client';

import { useState, memo, useEffect, useMemo, useCallback } from 'react';
import { NodeProps, useHandleConnections, useNodesData } from '@xyflow/react';
import { RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { BaseNode } from './BaseNode';
import { ImageNodeData, NODE_ACTIONS } from '@/types/nodes';
import { useWorkflowStore } from '@/store/workflowStore';
import { GenerateFromNodePopup } from '../ui/GenerateFromNodePopup';

function ImageNodeComponent({ data, id, selected }: NodeProps) {
  const nodeData = data as unknown as ImageNodeData;
  const { updateNodeData, setSelectedNodeId } = useWorkflowStore();
  const [popupSide, setPopupSide] = useState<'left' | 'right' | null>(null);

  // Use React Flow hooks for reactive connection tracking
  const connections = useHandleConnections({ type: 'target', id: 'any' });
  const connectedNodeIds = useMemo(
    () => connections.map((c) => c.source),
    [connections]
  );
  const connectedNodesData = useNodesData(connectedNodeIds);

  // Extract source image from connected nodes reactively
  useEffect(() => {
    if (connectedNodesData.length > 0) {
      const sourceNodeData = connectedNodesData[0];
      if (sourceNodeData) {
        let sourceImage: string | undefined;
        const nodeDataRaw = sourceNodeData.data as any;

        // Check if it's a source node with an image
        if (sourceNodeData.type === 'source' && nodeDataRaw?.image) {
          sourceImage = nodeDataRaw.image.url;
        }
        // Check if it's an image node with a generated image
        else if (sourceNodeData.type === 'image' && nodeDataRaw?.generatedImage) {
          sourceImage = nodeDataRaw.generatedImage;
        }

        if (sourceImage && sourceImage !== nodeData.sourceImage) {
          updateNodeData(id, { sourceImage });
        }
      }
    } else if (nodeData.sourceImage) {
      // Clear source image when disconnected
      updateNodeData(id, { sourceImage: undefined });
    }
  }, [connectedNodesData, id, nodeData.sourceImage, updateNodeData]);

  // Handle action click
  const handleActionClick = (action: 'image_to_image') => {
    updateNodeData(id, { selectedAction: action });
    setSelectedNodeId(id);
  };

  // Handle name change
  const handleNameChange = useCallback((newName: string) => {
    updateNodeData(id, { name: newName });
  }, [id, updateNodeData]);

  return (
    <>
      <BaseNode
        id={id}
        handles={{ inputs: ['any'], outputs: ['image'] }}
        selected={selected}
        status={nodeData.status}
        onPlusClick={(side) => setPopupSide(side)}
        nodeName={nodeData.name}
        onNameChange={handleNameChange}
      >
        <div className="space-y-3">
          {/* Action Options - only show when no generated image */}
          {!nodeData.generatedImage && (
            <div className="space-y-2">
              <span className="text-xs text-zinc-500">Try to:</span>
              {NODE_ACTIONS.image.map((action) => (
                <button
                  key={action.id}
                  onClick={() => handleActionClick(action.id as 'image_to_image')}
                  className={cn(
                    'w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-left transition-colors',
                    nodeData.selectedAction === action.id
                      ? 'bg-zinc-200 dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100'
                      : 'hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                  )}
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>{action.label}</span>
                </button>
              ))}
            </div>
          )}

          {/* Image Display */}
          {nodeData.generatedImage ? (
            <div className="relative rounded-lg overflow-hidden">
              <img
                src={nodeData.generatedImage}
                alt="Generated"
                className="w-full aspect-square object-cover"
                draggable={false}
              />
            </div>
          ) : nodeData.sourceImage ? (
            <div className="relative rounded-lg overflow-hidden opacity-50">
              <img
                src={nodeData.sourceImage}
                alt="Source"
                className="w-full aspect-square object-cover"
                draggable={false}
              />
              <span className="absolute inset-0 flex items-center justify-center text-xs text-zinc-500 dark:text-zinc-400 bg-white/50 dark:bg-zinc-900/50">
                Waiting for generation...
              </span>
            </div>
          ) : (
            <div className="aspect-square bg-zinc-100 dark:bg-zinc-950 rounded-lg flex items-center justify-center">
              <span className="text-zinc-500 dark:text-zinc-600 text-xs">No image connected</span>
            </div>
          )}

          {/* Error Display */}
          {nodeData.error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-sm text-red-400">
              {nodeData.error}
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
