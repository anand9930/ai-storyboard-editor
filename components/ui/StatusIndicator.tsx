'use client';

import { cn } from '@/lib/utils';
import { NodeStatus } from '@/types/nodes';
import { Loader2 } from 'lucide-react';

interface StatusIndicatorProps {
  status: NodeStatus;
}

export function StatusIndicator({ status }: StatusIndicatorProps) {
  if (status === 'idle' || status === 'completed') return null;

  const config = {
    processing: {
      color: 'bg-blue-500',
      label: 'Processing...',
      animate: true,
    },
    completed: {
      color: 'bg-green-500',
      label: 'Done',
      animate: false,
    },
    error: {
      color: 'bg-red-500',
      label: 'Error',
      animate: false,
    },
  };

  const { color, label, animate } = config[status] || config.processing;

  return (
    <div className="flex items-center gap-1.5">
      {animate ? (
        <Loader2 className="w-3 h-3 text-blue-400 animate-spin" />
      ) : (
        <div className={cn('w-2 h-2 rounded-full', color)} />
      )}
      <span className="text-xs text-zinc-400">{label}</span>
    </div>
  );
}
