'use client';

import { ReactNode } from 'react';
import { Handle, Position, NodeResizer, NodeToolbar } from '@xyflow/react';
import { Trash2, Copy, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { NodeStatus } from '@/types/nodes';
import { useWorkflowStore } from '@/store/workflowStore';

interface BaseNodeProps {
  id: string;
  children: ReactNode;
  handles?: {
    inputs?: string[];
    outputs?: string[];
  };
  className?: string;
  selected?: boolean;
  status?: NodeStatus;
  resizable?: boolean;
  minWidth?: number;
  minHeight?: number;
  showToolbar?: boolean;
  onPlusClick?: () => void;
  plusDisabled?: boolean;
  toolbarContent?: ReactNode;
}

export function BaseNode({
  id,
  children,
  handles = {},
  className,
  selected,
  status = 'idle',
  resizable = false,
  minWidth = 240,
  minHeight = 100,
  showToolbar = true,
  onPlusClick,
  plusDisabled = false,
  toolbarContent,
}: BaseNodeProps) {
  const { inputs = [], outputs = [] } = handles;
  const { deleteNode, addNode, nodes } = useWorkflowStore();

  const handleDelete = () => {
    deleteNode(id);
  };

  const handleDuplicate = () => {
    const currentNode = nodes.find((n) => n.id === id);
    if (currentNode) {
      const newNode = {
        ...currentNode,
        id: `${currentNode.type}-${Date.now()}`,
        position: {
          x: currentNode.position.x + 50,
          y: currentNode.position.y + 50,
        },
        selected: false,
      };
      addNode(newNode);
    }
  };

  return (
    <>
      {showToolbar && (
        <NodeToolbar
          isVisible={selected}
          position={Position.Top}
          className="flex gap-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-1 shadow-lg"
        >
          {/* Custom toolbar content (e.g., formatting buttons) */}
          {toolbarContent}
          {toolbarContent && <div className="w-px h-5 bg-zinc-200 dark:bg-zinc-700 mx-1" />}
          <button
            onClick={handleDuplicate}
            className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded transition-colors text-zinc-600 dark:text-zinc-400"
            title="Duplicate"
          >
            <Copy className="w-4 h-4" />
          </button>
          <button
            onClick={handleDelete}
            className="p-1.5 hover:bg-red-100 dark:hover:bg-red-500/20 rounded transition-colors text-red-500 dark:text-red-400"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </NodeToolbar>
      )}
      {resizable && (
        <NodeResizer
          minWidth={minWidth}
          minHeight={minHeight}
          isVisible={selected}
          lineClassName="!border-blue-500"
          handleClassName="!w-2 !h-2 !bg-blue-500 !border-blue-500"
        />
      )}
      <div
        className={cn(
          'group relative bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 shadow-lg',
          resizable ? 'w-full h-full' : 'w-[240px]',
          'hover:border-zinc-300 dark:hover:border-zinc-700 transition-all duration-200',
          selected && 'border-blue-500/50 ring-2 ring-blue-500/20',
          status === 'processing' && 'border-blue-500/50',
          status === 'completed' && 'border-green-500/50',
          status === 'error' && 'border-red-500/50',
          className
        )}
      >
      {/* Input Handles */}
      {inputs.map((input, i) => (
        <Handle
          key={`input-${input}`}
          type="target"
          position={Position.Left}
          id={input}
          style={{
            top: `${((i + 1) / (inputs.length + 1)) * 100}%`,
            width: 12,
            height: 12,
            background: '#52525b',
            border: '2px solid #27272a',
          }}
        />
      ))}

      {children}

      {/* Output Handles */}
      {outputs.map((output, i) => (
        <Handle
          key={`output-${output}`}
          type="source"
          position={Position.Right}
          id={output}
          style={{
            top: `${((i + 1) / (outputs.length + 1)) * 100}%`,
            width: 12,
            height: 12,
            background: '#3b82f6',
            border: '2px solid #27272a',
          }}
        />
      ))}

      {/* Floating Plus Button - Right Edge */}
      {onPlusClick && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (!plusDisabled) onPlusClick();
          }}
          className={cn(
            'absolute -right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-full transition-all duration-200',
            'bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 shadow-md',
            'opacity-0 group-hover:opacity-100',
            plusDisabled
              ? 'text-zinc-400 dark:text-zinc-600 cursor-not-allowed'
              : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-700 hover:text-zinc-800 dark:hover:text-zinc-200'
          )}
        >
          <Plus className="w-4 h-4" />
        </button>
      )}
      </div>
    </>
  );
}
