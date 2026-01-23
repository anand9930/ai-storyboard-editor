'use client';

import { Type, Image as ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useWorkflowStore } from '@/store/workflowStore';
import { getDefaultNodeData, GENERATE_OPTIONS } from '@/types/nodes';

interface GenerateFromNodePopupProps {
  sourceNodeId: string;
  onClose: () => void;
}

const iconMap: Record<string, any> = {
  Type,
  ImageIcon,
};

export function GenerateFromNodePopup({
  sourceNodeId,
  onClose,
}: GenerateFromNodePopupProps) {
  const { addNode, addEdge, nodes, setSelectedNodeId } = useWorkflowStore();
  const sourceNode = nodes.find((n) => n.id === sourceNodeId);

  const handleSelect = (type: 'text' | 'image') => {
    if (!sourceNode) return;

    // Calculate position for new node (to the right of source)
    const newPosition = {
      x: sourceNode.position.x + 320,
      y: sourceNode.position.y,
    };

    // Create new node
    const newNodeId = `${type}-${Date.now()}`;
    const newNode = {
      id: newNodeId,
      type,
      position: newPosition,
      data: getDefaultNodeData(type),
    };

    addNode(newNode);

    // Create edge from source to new node
    const sourceHandle = sourceNode.type === 'text' ? 'text' : 'image';
    addEdge({
      id: `edge-${sourceNodeId}-${newNodeId}`,
      source: sourceNodeId,
      target: newNodeId,
      sourceHandle,
      targetHandle: 'any',
      type: 'smoothstep',
      style: {
        stroke: '#3f3f46',
        strokeWidth: 2,
      },
    });

    // Select the new node
    setSelectedNodeId(newNodeId);

    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40" onClick={onClose} />

      {/* Popup */}
      <div className="absolute z-50 bg-zinc-900 border border-zinc-800 rounded-xl p-2 w-56 shadow-xl left-full ml-2 top-0">
        <div className="text-xs text-zinc-500 px-2 py-1 mb-1">
          Generate from this node
        </div>

        {GENERATE_OPTIONS.map((option) => {
          const Icon = iconMap[option.icon] || Type;
          return (
            <button
              key={option.id}
              onClick={() => handleSelect(option.id as 'text' | 'image')}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left hover:bg-zinc-800 text-zinc-200 transition-colors"
            >
              <Icon className="w-5 h-5 text-zinc-400" />
              <div>
                <div className="text-sm font-medium">{option.label}</div>
                <div className="text-xs text-zinc-500">{option.description}</div>
              </div>
            </button>
          );
        })}
      </div>
    </>
  );
}
