'use client';

import { useRef, useCallback, useEffect, useState } from 'react';
import {
  ChevronRight,
  Type,
  Image as ImageIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useWorkflowStore } from '@/store/workflowStore';
import { getDefaultNodeData } from '@/types/nodes';

// Node types for the submenu
const ADD_NODE_ITEMS = [
  {
    id: 'text',
    label: 'Text',
    icon: Type,
    badge: 'Gemini3',
    description: 'Script, Ad copy, Brand text',
  },
  {
    id: 'image',
    label: 'Image',
    icon: ImageIcon,
    badge: 'Banana Pro',
    description: 'Generate or transform images',
  },
];

// Detect if user is on Mac for keyboard shortcuts
const isMac = typeof window !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.userAgent);
const cmdKey = isMac ? '⌘' : 'Ctrl+';
const shiftKey = isMac ? '⇧' : 'Shift+';

interface CanvasContextMenuProps {
  x: number;
  y: number;
  canvasPosition: { x: number; y: number };
  onClose: () => void;
}

// Selector for clipboard existence (stable boolean)
const selectHasClipboard = (state: { clipboard: unknown }) => state.clipboard !== null;

export function CanvasContextMenu({ x, y, canvasPosition, onClose }: CanvasContextMenuProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Only subscribe to whether clipboard exists, not the full clipboard object
  const hasClipboard = useWorkflowStore(selectHasClipboard);

  // Get actions separately
  const { addNode, pasteNode } = useWorkflowStore();

  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null);
  const [submenuPosition, setSubmenuPosition] = useState({ x: 0, y: 0 });
  const submenuTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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

  // Clean up submenu timeout on unmount
  useEffect(() => {
    return () => {
      if (submenuTimeoutRef.current) {
        clearTimeout(submenuTimeoutRef.current);
      }
    };
  }, []);

  // Add a new node at the cursor position
  const handleAddNode = useCallback((type: string) => {
    const newNode = {
      id: `${type}-${Date.now()}`,
      type,
      position: canvasPosition,
      data: getDefaultNodeData(type),
    };
    addNode(newNode);
    onClose();
  }, [addNode, canvasPosition, onClose]);

  // Handle file upload - creates a Source node at cursor position
  const handleUpload = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const dataUrl = e.target?.result as string;

      const img = new window.Image();
      img.onload = () => {
        const newNode = {
          id: `source-${Date.now()}`,
          type: 'source',
          position: canvasPosition,
          data: {
            name: 'Source',
            image: {
              id: `src-${Date.now()}`,
              url: dataUrl,
              metadata: {
                width: img.width,
                height: img.height,
                format: file.type.split('/')[1] || 'unknown',
              },
            },
          },
        };
        addNode(newNode);
        onClose();
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  }, [addNode, canvasPosition, onClose]);

  // Close menu when clicking outside
  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }, [onClose]);

  // Handle submenu hover with delay
  const handleSubmenuEnter = useCallback((itemId: string, itemRect: DOMRect) => {
    if (submenuTimeoutRef.current) {
      clearTimeout(submenuTimeoutRef.current);
    }

    // Calculate submenu position
    const menuWidth = 220;
    const rightSpace = window.innerWidth - itemRect.right;
    const showOnRight = rightSpace >= menuWidth + 8;

    setSubmenuPosition({
      x: showOnRight ? itemRect.right + 4 : itemRect.left - menuWidth - 4,
      y: itemRect.top,
    });

    setActiveSubmenu(itemId);
  }, []);

  const handleSubmenuLeave = useCallback(() => {
    submenuTimeoutRef.current = setTimeout(() => {
      setActiveSubmenu(null);
    }, 100);
  }, []);

  const handleSubmenuStay = useCallback(() => {
    if (submenuTimeoutRef.current) {
      clearTimeout(submenuTimeoutRef.current);
    }
  }, []);

  // Calculate menu position to stay within viewport
  const menuWidth = 200;
  const menuHeight = 250; // Approximate
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

      {/* Main Context Menu */}
      <div
        className="fixed bg-surface-primary border border-node rounded-xl py-2 shadow-xl z-50"
        style={{
          left: adjustedX,
          top: adjustedY,
          minWidth: menuWidth,
        }}
      >
        {/* Upload */}
        <MenuItem
          label="Upload"
          onClick={() => fileInputRef.current?.click()}
        />

        {/* Add Nodes - with submenu */}
        <MenuItem
          label="Add Nodes"
          hasSubmenu
          onMouseEnter={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            handleSubmenuEnter('add-nodes', rect);
          }}
          onMouseLeave={handleSubmenuLeave}
        />

        {/* Divider */}
        <div className="my-2 h-px bg-node mx-2" />

        {/* Undo */}
        <MenuItem
          label="Undo"
          shortcut={`${cmdKey}Z`}
          onClick={() => {
            // TODO: Implement undo
            console.log('Undo clicked');
          }}
        />

        {/* Redo */}
        <MenuItem
          label="Redo"
          shortcut={`${shiftKey}${cmdKey}Z`}
          onClick={() => {
            // TODO: Implement redo
            console.log('Redo clicked');
          }}
        />

        {/* Paste */}
        <MenuItem
          label="Paste"
          shortcut={`${cmdKey}V`}
          onClick={() => {
            pasteNode(canvasPosition);
            onClose();
          }}
          disabled={!hasClipboard}
        />
      </div>

      {/* Add Nodes Submenu */}
      {activeSubmenu === 'add-nodes' && (
        <div
          className="fixed bg-surface-primary border border-node rounded-xl py-2 shadow-xl z-50"
          style={{
            left: submenuPosition.x,
            top: submenuPosition.y,
            minWidth: 220,
          }}
          onMouseEnter={handleSubmenuStay}
          onMouseLeave={handleSubmenuLeave}
        >
          {ADD_NODE_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => handleAddNode(item.id)}
              className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-interactive-hover text-theme-text-primary transition-colors"
            >
              <item.icon className="w-4 h-4 text-theme-text-secondary" />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm">{item.label}</span>
                  {item.badge && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-accent-blue/20 text-accent-blue">
                      {item.badge}
                    </span>
                  )}
                </div>
                <span className="text-xs text-theme-text-muted">{item.description}</span>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            handleUpload(file);
          }
          e.target.value = '';
        }}
        className="hidden"
      />
    </>
  );
}

// Reusable MenuItem component
interface MenuItemProps {
  label: string;
  shortcut?: string;
  hasSubmenu?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  onMouseEnter?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  onMouseLeave?: () => void;
}

function MenuItem({
  label,
  shortcut,
  hasSubmenu,
  disabled,
  onClick,
  onMouseEnter,
  onMouseLeave,
}: MenuItemProps) {
  return (
    <button
      className={cn(
        'w-full flex items-center gap-2 px-4 py-2 text-left transition-colors',
        disabled
          ? 'text-theme-text-muted cursor-not-allowed'
          : 'text-theme-text-primary hover:bg-interactive-hover'
      )}
      onClick={disabled ? undefined : onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      disabled={disabled}
    >
      <span className="text-sm flex-1">{label}</span>
      {shortcut && (
        <span className={cn(
          'text-xs ml-4',
          disabled ? 'text-theme-text-muted/50' : 'text-theme-text-muted'
        )}>{shortcut}</span>
      )}
      {hasSubmenu && (
        <ChevronRight className="w-4 h-4 text-theme-text-muted" />
      )}
    </button>
  );
}
