'use client';

import { useState, memo, useEffect, useCallback } from 'react';
import { NodeProps } from '@xyflow/react';
import { RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { BaseNode } from './BaseNode';
import { NODE_ACTIONS } from '@/types/nodes';
import type { ImageNode as ImageNodeType, ImageNodeData } from '@/types/nodes';
import { useWorkflowStore } from '@/store/workflowStore';
import { GenerateFromNodePopup } from '../ui/GenerateFromNodePopup';
import { useSourceConnection } from '@/hooks/useSourceConnection';

function ImageNodeComponent({ data, id, selected }: NodeProps<ImageNodeType>) {
  // data is now properly typed as ImageNodeData
  const nodeData = data as ImageNodeData;
  const { updateNodeData, setSelectedNodeIds } = useWorkflowStore();
  const [popupSide, setPopupSide] = useState<'left' | 'right' | null>(null);

  // Use custom hook for source image tracking (replaces deprecated useHandleConnections)
  const { sourceImage: connectedSourceImage } = useSourceConnection({
    nodeId: id,
  });

  // Update source image when connection changes
  useEffect(() => {
    if (connectedSourceImage !== nodeData.sourceImage) {
      updateNodeData(id, { sourceImage: connectedSourceImage });
    }
  }, [connectedSourceImage, id, nodeData.sourceImage, updateNodeData]);

  // Handle action click
  const handleActionClick = (action: 'image_to_image') => {
    updateNodeData(id, { selectedAction: action });
    setSelectedNodeIds([id]);
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
        noPadding={true}
      >
        <div className={cn("h-full flex flex-col p-2", !nodeData.generatedImage && "justify-center")}>
          {/* Action Options - only show when no generated image */}
          {!nodeData.generatedImage && (
            <div className="space-y-2 flex-shrink-0">
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
          {nodeData.generatedImage && (
            <div className="relative rounded-lg overflow-hidden flex-1 flex items-center justify-center bg-surface-secondary">
              <img
                src={nodeData.generatedImage}
                alt="Generated"
                className="max-w-full max-h-full object-contain"
                draggable={false}
              />
            </div>
          )}

          {/* Error Display */}
          {nodeData.error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-sm text-red-400 flex-shrink-0 mt-2">
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
