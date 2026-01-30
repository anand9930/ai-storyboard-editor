'use client';

import { useCallback, useEffect, useRef } from 'react';
import { Type, Image as ImageIcon, LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useWorkflowStore } from '@/features/flow/store/workflowStore';
import { getDefaultNodeData, GENERATE_OPTIONS } from '@/features/flow/types/nodes';
import type { SourceNodeData, ImageNodeData, TextNodeData } from '@/features/flow/types/nodes';
import { defaultEdgeOptions } from '@/features/flow/lib/flowConfig';
import type { Node } from '@xyflow/react';

interface GenerateFromNodePopupProps {
  sourceNodeId: string;
  side: 'left' | 'right';
  onClose: () => void;
}

const iconMap: Record<string, LucideIcon> = {
  Type,
  ImageIcon,
};

export function GenerateFromNodePopup({
  sourceNodeId,
  side,
  onClose,
}: GenerateFromNodePopupProps) {
  const popupRef = useRef<HTMLDivElement>(null);

  // Only get the source node we need, not the entire nodes array
  const sourceNode = useWorkflowStore(
    useCallback(
      (state) => state.nodes.find((n: Node) => n.id === sourceNodeId),
      [sourceNodeId]
    )
  );

  // Get actions separately
  const { addNode, addEdge, setSelectedNodeIds } = useWorkflowStore();

  // Handle click outside to close
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popupRef.current && !popupRef.current.contains(event.target as HTMLElement)) {
        onClose();
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose();
      }
    }

    // Add listeners with slight delay to avoid immediate close
    const timeoutId = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }, 0);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  // Focus first button when opened
  useEffect(() => {
    const firstButton = popupRef.current?.querySelector('button');
    firstButton?.focus();
  }, []);

  const handleSelect = (type: 'text' | 'image') => {
    if (!sourceNode) return;

    // Calculate position for new node based on which side was clicked
    const newPosition = {
      x: side === 'right'
        ? sourceNode.position.x + 400  // To the right
        : sourceNode.position.x - 400, // To the left
      y: sourceNode.position.y,
    };

    // Check if source node has an image (for auto-transitioning TextNode)
    let sourceHasImage = false;
    if (sourceNode.type === 'source') {
      const sourceData = sourceNode.data as SourceNodeData;
      sourceHasImage = !!sourceData?.image?.url;
    } else if (sourceNode.type === 'image') {
      const imageData = sourceNode.data as ImageNodeData;
      sourceHasImage = !!imageData?.generatedImage;
    }

    // Create new node
    const newNodeId = `${type}-${Date.now()}`;
    const defaultData = getDefaultNodeData(type);

    // If creating TextNode or ImageNode from source with image, set selectedAction to skip initial state
    let nodeData = defaultData;
    if (sourceHasImage && side === 'right') {
      if (type === 'text') {
        nodeData = { ...(defaultData as TextNodeData), selectedAction: 'prompt_from_image' };
      } else if (type === 'image') {
        nodeData = { ...(defaultData as ImageNodeData), selectedAction: 'image_to_image' };
      }
    }

    const newNode = {
      id: newNodeId,
      type,
      position: newPosition,
      data: nodeData,
    };

    addNode(newNode);

    // Create edge - direction depends on which side
    // Right: current node → new node (current is source)
    // Left: new node → current node (new node is source)
    const sourceHandle = sourceNode.type === 'text' ? 'text' : 'image';
    const newNodeHandle = type === 'text' ? 'text' : 'image';

    if (side === 'right') {
      addEdge({
        id: `edge-${sourceNodeId}-${newNodeId}`,
        source: sourceNodeId,
        target: newNodeId,
        sourceHandle,
        targetHandle: 'any',
        ...defaultEdgeOptions,
      });
    } else {
      // Left side: new node is the source, current node is the target
      addEdge({
        id: `edge-${newNodeId}-${sourceNodeId}`,
        source: newNodeId,
        target: sourceNodeId,
        sourceHandle: newNodeHandle,
        targetHandle: 'any',
        ...defaultEdgeOptions,
      });
    }

    // Select the new node
    setSelectedNodeIds([newNodeId]);

    onClose();
  };

  return (
    <div
      ref={popupRef}
      role="dialog"
      aria-modal="true"
      aria-label="Generate from this node"
      className={cn(
        "absolute z-50 bg-popover border border-border rounded-xl p-2 w-56 shadow-lg top-1/2 -translate-y-1/2",
        "animate-in fade-in-0 zoom-in-95",
        side === 'right' ? 'left-full ml-2' : 'right-full mr-2'
      )}
    >
      <div className="text-xs text-muted-foreground px-2 py-1 mb-1">
        Generate from this node
      </div>

      {GENERATE_OPTIONS.map((option) => {
        const Icon = iconMap[option.icon] || Type;
        return (
          <button
            key={option.id}
            onClick={() => handleSelect(option.id as 'text' | 'image')}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left text-popover-foreground",
              "transition-colors hover:bg-accent focus:bg-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            )}
          >
            <Icon className="w-5 h-5 text-muted-foreground" />
            <div>
              <div className="text-sm font-medium">{option.label}</div>
              <div className="text-xs text-muted-foreground">{option.description}</div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
