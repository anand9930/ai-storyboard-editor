'use client';

import { ReactNode } from 'react';
import { Handle, Position } from '@xyflow/react';
import { cn } from '@/lib/utils';
import { NodeStatus } from '@/types/nodes';

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
}

export function BaseNode({
  children,
  handles = {},
  className,
  selected,
  status = 'idle',
}: BaseNodeProps) {
  const { inputs = [], outputs = [] } = handles;

  return (
    <div
      className={cn(
        'bg-zinc-900 border border-zinc-800 rounded-xl p-4 shadow-lg min-w-[240px]',
        'hover:border-zinc-700 transition-all duration-200',
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
    </div>
  );
}
