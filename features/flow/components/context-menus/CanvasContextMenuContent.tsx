'use client';

import { useRef, useCallback } from 'react';
import { Type, Image as ImageIcon, Upload } from 'lucide-react';
import {
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuShortcut,
  DropdownMenuPortal,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { useWorkflowStore } from '@/features/flow/store/workflowStore';
import { getDefaultNodeData } from '@/features/flow/types/nodes';

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

// Selector for clipboard existence (stable boolean)
const selectHasClipboard = (state: { clipboard: unknown }) => state.clipboard !== null;

interface CanvasContextMenuContentProps {
  flowPosition: { x: number; y: number };
  onClose: () => void;
}

export function CanvasContextMenuContent({ flowPosition, onClose }: CanvasContextMenuContentProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Only subscribe to whether clipboard exists, not the full clipboard object
  const hasClipboard = useWorkflowStore(selectHasClipboard);

  // Get actions separately
  const { addNode, pasteNode } = useWorkflowStore();
  const { undo, redo } = useWorkflowStore.temporal.getState();

  // Add a new node at the cursor position
  const handleAddNode = useCallback((type: string) => {
    const newNode = {
      id: `${type}-${Date.now()}`,
      type,
      position: flowPosition,
      data: getDefaultNodeData(type),
    };
    addNode(newNode);
    onClose();
  }, [addNode, flowPosition, onClose]);

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
          position: flowPosition,
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
  }, [addNode, flowPosition, onClose]);

  const handleUndo = useCallback(() => {
    undo();
    onClose();
  }, [undo, onClose]);

  const handleRedo = useCallback(() => {
    redo();
    onClose();
  }, [redo, onClose]);

  const handlePaste = useCallback(() => {
    pasteNode(flowPosition);
    onClose();
  }, [pasteNode, flowPosition, onClose]);

  return (
    <>
      {/* Upload */}
      <DropdownMenuItem onSelect={() => fileInputRef.current?.click()}>
        <Upload className="h-4 w-4" />
        Upload
      </DropdownMenuItem>

      {/* Add Nodes Submenu */}
      <DropdownMenuSub>
        <DropdownMenuSubTrigger>
          Add Node
        </DropdownMenuSubTrigger>
        <DropdownMenuPortal>
          <DropdownMenuSubContent className="min-w-[14rem]" sideOffset={4}>
            {ADD_NODE_ITEMS.map((item) => (
              <DropdownMenuItem
                key={item.id}
                className="gap-3 py-2"
                onSelect={() => handleAddNode(item.id)}
              >
                <item.icon className="h-4 w-4 text-muted-foreground" />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span>{item.label}</span>
                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                      {item.badge}
                    </Badge>
                  </div>
                  <span className="text-xs text-muted-foreground">{item.description}</span>
                </div>
              </DropdownMenuItem>
            ))}
          </DropdownMenuSubContent>
        </DropdownMenuPortal>
      </DropdownMenuSub>

      <DropdownMenuSeparator />

      {/* Undo */}
      <DropdownMenuItem onSelect={handleUndo}>
        Undo
        <DropdownMenuShortcut>{cmdKey}Z</DropdownMenuShortcut>
      </DropdownMenuItem>

      {/* Redo */}
      <DropdownMenuItem onSelect={handleRedo}>
        Redo
        <DropdownMenuShortcut>{shiftKey}{cmdKey}Z</DropdownMenuShortcut>
      </DropdownMenuItem>

      {/* Paste */}
      <DropdownMenuItem onSelect={handlePaste} disabled={!hasClipboard}>
        Paste
        <DropdownMenuShortcut>{cmdKey}V</DropdownMenuShortcut>
      </DropdownMenuItem>

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
