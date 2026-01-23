'use client';

import { useState, memo, useEffect } from 'react';
import { NodeProps, useReactFlow } from '@xyflow/react';
import { RefreshCw, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { BaseNode } from './BaseNode';
import { ImageNodeData, NODE_ACTIONS } from '@/types/nodes';
import { useWorkflowStore } from '@/store/workflowStore';
import { StatusIndicator } from '../ui/StatusIndicator';
import { GenerateFromNodePopup } from '../ui/GenerateFromNodePopup';

function ImageNodeComponent({ data, id, selected }: NodeProps) {
  const nodeData = data as unknown as ImageNodeData;
  const { updateNodeData, setSelectedNodeId, edges, nodes } = useWorkflowStore();
  const [showGeneratePopup, setShowGeneratePopup] = useState(false);

  // Find connected source image
  useEffect(() => {
    const incomingEdge = edges.find((edge) => edge.target === id);
    if (incomingEdge) {
      const sourceNode = nodes.find((n) => n.id === incomingEdge.source);
      if (sourceNode) {
        let sourceImage: string | undefined;
        const sourceData = sourceNode.data as any;

        if (sourceNode.type === 'source' && sourceData.image) {
          sourceImage = sourceData.image.url;
        } else if (sourceNode.type === 'image' && sourceData.generatedImage) {
          sourceImage = sourceData.generatedImage;
        }

        if (sourceImage && sourceImage !== nodeData.sourceImage) {
          updateNodeData(id, { sourceImage });
        }
      }
    }
  }, [edges, nodes, id, nodeData.sourceImage, updateNodeData]);

  // Handle action click
  const handleActionClick = (action: 'image_to_image') => {
    updateNodeData(id, { selectedAction: action });
    setSelectedNodeId(id);
  };

  return (
    <>
      <BaseNode
        id={id}
        handles={{ inputs: ['any'], outputs: ['image'] }}
        selected={selected}
        status={nodeData.status}
      >
        <div className="space-y-3">
          {/* Header */}
          <div className="flex items-center justify-between">
            <span className="font-medium text-zinc-200">Image</span>
            <StatusIndicator status={nodeData.status} />
          </div>

          {/* Action Options */}
          <div className="space-y-2">
            <span className="text-xs text-zinc-500">Try to:</span>
            {NODE_ACTIONS.image.map((action) => (
              <button
                key={action.id}
                onClick={() => handleActionClick(action.id as 'image_to_image')}
                className={cn(
                  'w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-left transition-colors',
                  nodeData.selectedAction === action.id
                    ? 'bg-zinc-700 text-zinc-100'
                    : 'hover:bg-zinc-800 text-zinc-400'
                )}
              >
                <RefreshCw className="w-4 h-4" />
                <span>{action.label}</span>
              </button>
            ))}
          </div>

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
              <span className="absolute inset-0 flex items-center justify-center text-xs text-zinc-400 bg-zinc-900/50">
                Waiting for generation...
              </span>
            </div>
          ) : (
            <div className="aspect-square bg-zinc-950 rounded-lg flex items-center justify-center">
              <span className="text-zinc-600 text-xs">No image connected</span>
            </div>
          )}

          {/* Error Display */}
          {nodeData.error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-sm text-red-400">
              {nodeData.error}
            </div>
          )}

          {/* Plus Button */}
          <div className="flex justify-end">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowGeneratePopup(true);
              }}
              className="p-1.5 hover:bg-zinc-800 rounded-full transition-colors text-zinc-400"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>
      </BaseNode>

      {/* Generate from Node Popup */}
      {showGeneratePopup && (
        <GenerateFromNodePopup
          sourceNodeId={id}
          onClose={() => setShowGeneratePopup(false)}
        />
      )}
    </>
  );
}

export const ImageNode = memo(ImageNodeComponent);
