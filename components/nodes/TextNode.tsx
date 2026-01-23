'use client';

import { useState, memo } from 'react';
import { NodeProps } from '@xyflow/react';
import { Pencil, ImageIcon, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { BaseNode } from './BaseNode';
import { TextNodeData, NODE_ACTIONS } from '@/types/nodes';
import { useWorkflowStore } from '@/store/workflowStore';
import { StatusIndicator } from '../ui/StatusIndicator';
import { GenerateFromNodePopup } from '../ui/GenerateFromNodePopup';

const iconMap: Record<string, any> = {
  Pencil,
  ImageIcon,
};

function TextNodeComponent({ data, id, selected }: NodeProps) {
  const nodeData = data as unknown as TextNodeData;
  const { updateNodeData, setSelectedNodeId } = useWorkflowStore();
  const [showGeneratePopup, setShowGeneratePopup] = useState(false);

  // Handle action click
  const handleActionClick = (action: 'write' | 'prompt_from_image') => {
    updateNodeData(id, { selectedAction: action });
    setSelectedNodeId(id);
  };

  return (
    <>
      <BaseNode
        id={id}
        handles={{ inputs: ['any'], outputs: ['text'] }}
        selected={selected}
        status={nodeData.status}
      >
        <div className="space-y-3">
          {/* Header */}
          <div className="flex items-center justify-between">
            <span className="font-medium text-zinc-200">Text</span>
            <StatusIndicator status={nodeData.status} />
          </div>

          {/* Action Options */}
          <div className="space-y-2">
            <span className="text-xs text-zinc-500">Try to:</span>
            {NODE_ACTIONS.text.map((action) => {
              const Icon = iconMap[action.icon] || Pencil;
              return (
                <button
                  key={action.id}
                  onClick={() =>
                    handleActionClick(action.id as 'write' | 'prompt_from_image')
                  }
                  className={cn(
                    'w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-left transition-colors',
                    nodeData.selectedAction === action.id
                      ? 'bg-zinc-700 text-zinc-100'
                      : 'hover:bg-zinc-800 text-zinc-400'
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span>{action.label}</span>
                </button>
              );
            })}
          </div>

          {/* Inline Output Display */}
          {nodeData.content && (
            <div className="bg-zinc-950 rounded-lg p-3 text-sm text-zinc-300 max-h-40 overflow-y-auto">
              <p className="whitespace-pre-wrap">{nodeData.content}</p>
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

export const TextNode = memo(TextNodeComponent);
