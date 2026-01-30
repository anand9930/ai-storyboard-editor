'use client';

import { useCallback } from 'react';
import { Copy, CopyPlus, Trash2 } from 'lucide-react';
import {
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
} from '@/components/ui/dropdown-menu';
import { useWorkflowStore } from '@/features/flow/store/workflowStore';

// Detect if user is on Mac for keyboard shortcuts
const isMac = typeof window !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.userAgent);
const cmdKey = isMac ? '⌘' : 'Ctrl+';

interface NodeContextMenuContentProps {
  nodeId: string;
  onClose: () => void;
}

export function NodeContextMenuContent({ nodeId, onClose }: NodeContextMenuContentProps) {
  const { copyNode, duplicateNode, deleteNode } = useWorkflowStore();

  const handleCopy = useCallback(() => {
    copyNode(nodeId);
    onClose();
  }, [copyNode, nodeId, onClose]);

  const handleDuplicate = useCallback(() => {
    duplicateNode(nodeId);
    onClose();
  }, [duplicateNode, nodeId, onClose]);

  const handleDelete = useCallback(() => {
    deleteNode(nodeId);
    onClose();
  }, [deleteNode, nodeId, onClose]);

  return (
    <>
      {/* Copy */}
      <DropdownMenuItem onSelect={handleCopy}>
        <Copy className="h-4 w-4" />
        Copy
        <DropdownMenuShortcut>{cmdKey}C</DropdownMenuShortcut>
      </DropdownMenuItem>

      {/* Duplicate */}
      <DropdownMenuItem onSelect={handleDuplicate}>
        <CopyPlus className="h-4 w-4" />
        Duplicate
        <DropdownMenuShortcut>{cmdKey}D</DropdownMenuShortcut>
      </DropdownMenuItem>

      <DropdownMenuSeparator />

      {/* Delete */}
      <DropdownMenuItem
        className="text-destructive focus:bg-destructive/10 focus:text-destructive"
        onSelect={handleDelete}
      >
        <Trash2 className="h-4 w-4" />
        Delete
        <DropdownMenuShortcut>⌫</DropdownMenuShortcut>
      </DropdownMenuItem>
    </>
  );
}
