'use client';

import { useCallback, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useWorkflowStore } from '@/features/flow/store/workflowStore';

// Detect if user is on Mac for keyboard shortcuts
const isMac = typeof window !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.userAgent);
const cmdKey = isMac ? '⌘' : 'Ctrl+';

interface NodeContextMenuProps {
  nodeId: string;
  x: number;
  y: number;
  onClose: () => void;
}

export function NodeContextMenu({ nodeId, x, y, onClose }: NodeContextMenuProps) {
  const { copyNode, duplicateNode, deleteNode } = useWorkflowStore();

  // Handle Escape key to close menu
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Handle copy action
  const handleCopy = useCallback(() => {
    copyNode(nodeId);
    onClose();
  }, [copyNode, nodeId, onClose]);

  // Handle duplicate action
  const handleDuplicate = useCallback(() => {
    duplicateNode(nodeId);
    onClose();
  }, [duplicateNode, nodeId, onClose]);

  // Handle delete action
  const handleDelete = useCallback(() => {
    deleteNode(nodeId);
    onClose();
  }, [deleteNode, nodeId, onClose]);

  // Close menu when clicking outside
  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }, [onClose]);

  // Calculate menu position to stay within viewport
  const menuWidth = 180;
  const menuHeight = 140;
  const adjustedX = Math.min(x, window.innerWidth - menuWidth - 16);
  const adjustedY = Math.min(y, window.innerHeight - menuHeight - 16);

  return (
    <>
      {/* Invisible backdrop to catch clicks outside */}
      <div
        className="fixed inset-0 z-40"
        onClick={handleBackdropClick}
        onContextMenu={(e) => {
          e.preventDefault();
          onClose();
        }}
      />

      {/* Context Menu */}
      <div
        className="fixed bg-surface-primary border border-node rounded-xl py-2 shadow-xl z-50"
        style={{
          left: adjustedX,
          top: adjustedY,
          minWidth: menuWidth,
        }}
      >
        {/* Copy */}
        <MenuItem
          label="Copy"
          shortcut={`${cmdKey}C`}
          onClick={handleCopy}
        />

        {/* Duplicate */}
        <MenuItem
          label="Duplicate"
          shortcut={`${cmdKey}D`}
          onClick={handleDuplicate}
        />

        {/* Divider */}
        <div className="my-2 h-px bg-node mx-2" />

        {/* Delete */}
        <MenuItem
          label="Delete"
          shortcut="⌫"
          onClick={handleDelete}
          variant="danger"
        />
      </div>
    </>
  );
}

// Reusable MenuItem component
interface MenuItemProps {
  label: string;
  shortcut?: string;
  onClick: () => void;
  variant?: 'default' | 'danger';
}

function MenuItem({
  label,
  shortcut,
  onClick,
  variant = 'default',
}: MenuItemProps) {
  return (
    <button
      className={cn(
        'w-full flex items-center px-4 py-2 text-left',
        'transition-colors',
        variant === 'danger'
          ? 'text-status-error hover:bg-status-error/10'
          : 'text-theme-text-primary hover:bg-interactive-hover'
      )}
      onClick={onClick}
    >
      <span className="text-sm flex-1">{label}</span>
      {shortcut && (
        <span className={cn(
          'text-xs ml-4',
          variant === 'danger' ? 'text-status-error/60' : 'text-theme-text-muted'
        )}>{shortcut}</span>
      )}
    </button>
  );
}
