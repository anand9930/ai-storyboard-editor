'use client';

import { useRef, useState } from 'react';
import {
  Plus,
  Type,
  Image as ImageIcon,
  Upload,
  LayoutTemplate,
  Layers,
  MessageSquare,
  History,
  ImagePlay,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useWorkflowStore } from '@/features/flow/store/workflowStore';
import { getDefaultNodeData } from '@/features/flow/types/nodes';
import * as Tooltip from '@radix-ui/react-tooltip';

// Node types available for adding
const ADD_NODE_ITEMS = [
  {
    type: 'text' as const,
    label: 'Text',
    icon: Type,
    badge: 'Gemini3',
    description: 'Script, Ad copy, Brand text',
  },
  {
    type: 'image' as const,
    label: 'Image',
    icon: ImageIcon,
    badge: 'Banana Pro',
    description: 'Generate or transform images',
  },
];

// Selector for node count (stable reference, only changes when nodes are added/removed)
const selectNodeCount = (state: { nodes: unknown[] }) => state.nodes.length;

export function LeftSidebar() {
  const [showNodeMenu, setShowNodeMenu] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Only subscribe to node count for positioning, not full nodes array
  const nodeCount = useWorkflowStore(selectNodeCount);

  // Get addNode action separately
  const { addNode } = useWorkflowStore();

  // Calculate new node position
  const getNewNodePosition = () => {
    const offsetX = nodeCount * 20;
    const offsetY = nodeCount * 20;
    return {
      x: 250 + offsetX,
      y: 150 + offsetY,
    };
  };

  // Add a new node
  const handleAddNode = (type: string) => {
    const newNode = {
      id: `${type}-${Date.now()}`,
      type,
      position: getNewNodePosition(),
      data: getDefaultNodeData(type),
    };
    addNode(newNode);
    setShowNodeMenu(false);
  };

  // Handle file upload - creates a Source node
  const handleUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const dataUrl = e.target?.result as string;

      const img = new window.Image();
      img.onload = () => {
        const newNode = {
          id: `source-${Date.now()}`,
          type: 'source',
          position: getNewNodePosition(),
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
        setShowNodeMenu(false);
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="relative">
      {/* Main sidebar buttons */}
      <div className="flex flex-col gap-2 bg-surface-primary/95 backdrop-blur border border-node rounded-xl p-2">
        {/* Add Node Button */}
        <Tooltip.Root>
          <Tooltip.Trigger asChild>
            <button
              onClick={() => setShowNodeMenu(!showNodeMenu)}
              className={cn(
                'p-2 rounded-lg transition-colors',
                showNodeMenu
                  ? 'bg-interactive-active text-theme-text-primary'
                  : 'hover:bg-interactive-hover text-theme-text-secondary'
              )}
            >
              <Plus className="w-5 h-5" />
            </button>
          </Tooltip.Trigger>
          <Tooltip.Portal>
            <Tooltip.Content
              side="right"
              className="bg-surface-secondary text-theme-text-primary text-sm px-2 py-1 rounded shadow-lg"
            >
              Add Node
              <Tooltip.Arrow className="fill-surface-secondary" />
            </Tooltip.Content>
          </Tooltip.Portal>
        </Tooltip.Root>

        {/* Divider */}
        <div className="w-full h-px bg-interactive-active" />

        {/* Templates */}
        <Tooltip.Root>
          <Tooltip.Trigger asChild>
            <button className="p-2 hover:bg-interactive-hover rounded-lg transition-colors text-theme-text-secondary">
              <LayoutTemplate className="w-5 h-5" />
            </button>
          </Tooltip.Trigger>
          <Tooltip.Portal>
            <Tooltip.Content
              side="right"
              className="bg-surface-secondary text-theme-text-primary text-sm px-2 py-1 rounded shadow-lg"
            >
              Templates
              <Tooltip.Arrow className="fill-surface-secondary" />
            </Tooltip.Content>
          </Tooltip.Portal>
        </Tooltip.Root>

        {/* Layers */}
        <Tooltip.Root>
          <Tooltip.Trigger asChild>
            <button className="p-2 hover:bg-interactive-hover rounded-lg transition-colors text-theme-text-secondary">
              <Layers className="w-5 h-5" />
            </button>
          </Tooltip.Trigger>
          <Tooltip.Portal>
            <Tooltip.Content
              side="right"
              className="bg-surface-secondary text-theme-text-primary text-sm px-2 py-1 rounded shadow-lg"
            >
              Layers
              <Tooltip.Arrow className="fill-surface-secondary" />
            </Tooltip.Content>
          </Tooltip.Portal>
        </Tooltip.Root>

        {/* Chat */}
        <Tooltip.Root>
          <Tooltip.Trigger asChild>
            <button className="p-2 hover:bg-interactive-hover rounded-lg transition-colors text-theme-text-secondary">
              <MessageSquare className="w-5 h-5" />
            </button>
          </Tooltip.Trigger>
          <Tooltip.Portal>
            <Tooltip.Content
              side="right"
              className="bg-surface-secondary text-theme-text-primary text-sm px-2 py-1 rounded shadow-lg"
            >
              Chat
              <Tooltip.Arrow className="fill-surface-secondary" />
            </Tooltip.Content>
          </Tooltip.Portal>
        </Tooltip.Root>

        {/* History */}
        <Tooltip.Root>
          <Tooltip.Trigger asChild>
            <button className="p-2 hover:bg-interactive-hover rounded-lg transition-colors text-theme-text-secondary">
              <History className="w-5 h-5" />
            </button>
          </Tooltip.Trigger>
          <Tooltip.Portal>
            <Tooltip.Content
              side="right"
              className="bg-surface-secondary text-theme-text-primary text-sm px-2 py-1 rounded shadow-lg"
            >
              History
              <Tooltip.Arrow className="fill-surface-secondary" />
            </Tooltip.Content>
          </Tooltip.Portal>
        </Tooltip.Root>

        {/* Gallery */}
        <Tooltip.Root>
          <Tooltip.Trigger asChild>
            <button className="p-2 hover:bg-interactive-hover rounded-lg transition-colors text-theme-text-secondary">
              <ImagePlay className="w-5 h-5" />
            </button>
          </Tooltip.Trigger>
          <Tooltip.Portal>
            <Tooltip.Content
              side="right"
              className="bg-surface-secondary text-theme-text-primary text-sm px-2 py-1 rounded shadow-lg"
            >
              Gallery
              <Tooltip.Arrow className="fill-surface-secondary" />
            </Tooltip.Content>
          </Tooltip.Portal>
        </Tooltip.Root>
      </div>

      {/* Node Menu Dropdown */}
      {showNodeMenu && (
        <div className="absolute left-full ml-2 top-0 bg-surface-primary border border-node rounded-xl p-3 w-56 shadow-xl z-50">
          {/* Close button */}
          <button
            onClick={() => setShowNodeMenu(false)}
            className="absolute top-2 right-2 p-1 hover:bg-interactive-hover rounded"
          >
            <X className="w-4 h-4 text-theme-text-secondary" />
          </button>

          {/* Add Nodes Section */}
          <div className="mb-4">
            <div className="text-xs text-theme-text-secondary px-2 py-1 mb-2">Add Nodes</div>
            {ADD_NODE_ITEMS.map((item) => (
              <button
                key={item.type}
                onClick={() => handleAddNode(item.type)}
                className="w-full flex items-center gap-3 px-2 py-2 rounded-lg text-left hover:bg-interactive-hover text-theme-text-primary transition-colors"
              >
                <item.icon className="w-5 h-5 text-theme-text-secondary" />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{item.label}</span>
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

          {/* Add Source Section */}
          <div>
            <div className="text-xs text-theme-text-secondary px-2 py-1 mb-2">Add Source</div>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full flex items-center gap-3 px-2 py-2 rounded-lg text-left hover:bg-interactive-hover text-theme-text-primary transition-colors"
            >
              <Upload className="w-5 h-5 text-theme-text-secondary" />
              <span className="text-sm font-medium">Upload</span>
            </button>
          </div>

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
        </div>
      )}
    </div>
  );
}
