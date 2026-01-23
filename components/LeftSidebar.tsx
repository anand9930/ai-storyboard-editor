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
import { useWorkflowStore } from '@/store/workflowStore';
import { getDefaultNodeData } from '@/types/nodes';
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

export function LeftSidebar() {
  const [showNodeMenu, setShowNodeMenu] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { addNode, nodes } = useWorkflowStore();

  // Calculate new node position
  const getNewNodePosition = () => {
    const offsetX = nodes.length * 20;
    const offsetY = nodes.length * 20;
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
      <div className="flex flex-col gap-2 bg-white/95 dark:bg-zinc-900/95 backdrop-blur border border-zinc-200 dark:border-zinc-800 rounded-xl p-2">
        {/* Add Node Button */}
        <Tooltip.Root>
          <Tooltip.Trigger asChild>
            <button
              onClick={() => setShowNodeMenu(!showNodeMenu)}
              className={cn(
                'p-2 rounded-lg transition-colors',
                showNodeMenu
                  ? 'bg-zinc-200 dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100'
                  : 'hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
              )}
            >
              <Plus className="w-5 h-5" />
            </button>
          </Tooltip.Trigger>
          <Tooltip.Portal>
            <Tooltip.Content
              side="right"
              className="bg-zinc-800 text-zinc-200 text-sm px-2 py-1 rounded shadow-lg"
            >
              Add Node
              <Tooltip.Arrow className="fill-zinc-800" />
            </Tooltip.Content>
          </Tooltip.Portal>
        </Tooltip.Root>

        {/* Divider */}
        <div className="w-full h-px bg-zinc-200 dark:bg-zinc-800" />

        {/* Templates */}
        <Tooltip.Root>
          <Tooltip.Trigger asChild>
            <button className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors text-zinc-600 dark:text-zinc-400">
              <LayoutTemplate className="w-5 h-5" />
            </button>
          </Tooltip.Trigger>
          <Tooltip.Portal>
            <Tooltip.Content
              side="right"
              className="bg-zinc-800 text-zinc-200 text-sm px-2 py-1 rounded shadow-lg"
            >
              Templates
              <Tooltip.Arrow className="fill-zinc-800" />
            </Tooltip.Content>
          </Tooltip.Portal>
        </Tooltip.Root>

        {/* Layers */}
        <Tooltip.Root>
          <Tooltip.Trigger asChild>
            <button className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors text-zinc-600 dark:text-zinc-400">
              <Layers className="w-5 h-5" />
            </button>
          </Tooltip.Trigger>
          <Tooltip.Portal>
            <Tooltip.Content
              side="right"
              className="bg-zinc-800 text-zinc-200 text-sm px-2 py-1 rounded shadow-lg"
            >
              Layers
              <Tooltip.Arrow className="fill-zinc-800" />
            </Tooltip.Content>
          </Tooltip.Portal>
        </Tooltip.Root>

        {/* Chat */}
        <Tooltip.Root>
          <Tooltip.Trigger asChild>
            <button className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors text-zinc-600 dark:text-zinc-400">
              <MessageSquare className="w-5 h-5" />
            </button>
          </Tooltip.Trigger>
          <Tooltip.Portal>
            <Tooltip.Content
              side="right"
              className="bg-zinc-800 text-zinc-200 text-sm px-2 py-1 rounded shadow-lg"
            >
              Chat
              <Tooltip.Arrow className="fill-zinc-800" />
            </Tooltip.Content>
          </Tooltip.Portal>
        </Tooltip.Root>

        {/* History */}
        <Tooltip.Root>
          <Tooltip.Trigger asChild>
            <button className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors text-zinc-600 dark:text-zinc-400">
              <History className="w-5 h-5" />
            </button>
          </Tooltip.Trigger>
          <Tooltip.Portal>
            <Tooltip.Content
              side="right"
              className="bg-zinc-800 text-zinc-200 text-sm px-2 py-1 rounded shadow-lg"
            >
              History
              <Tooltip.Arrow className="fill-zinc-800" />
            </Tooltip.Content>
          </Tooltip.Portal>
        </Tooltip.Root>

        {/* Gallery */}
        <Tooltip.Root>
          <Tooltip.Trigger asChild>
            <button className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors text-zinc-600 dark:text-zinc-400">
              <ImagePlay className="w-5 h-5" />
            </button>
          </Tooltip.Trigger>
          <Tooltip.Portal>
            <Tooltip.Content
              side="right"
              className="bg-zinc-800 text-zinc-200 text-sm px-2 py-1 rounded shadow-lg"
            >
              Gallery
              <Tooltip.Arrow className="fill-zinc-800" />
            </Tooltip.Content>
          </Tooltip.Portal>
        </Tooltip.Root>
      </div>

      {/* Node Menu Dropdown */}
      {showNodeMenu && (
        <div className="absolute left-full ml-2 top-0 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 w-56 shadow-xl z-50">
          {/* Close button */}
          <button
            onClick={() => setShowNodeMenu(false)}
            className="absolute top-2 right-2 p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded"
          >
            <X className="w-4 h-4 text-zinc-500" />
          </button>

          {/* Add Nodes Section */}
          <div className="mb-4">
            <div className="text-xs text-zinc-500 px-2 py-1 mb-2">Add Nodes</div>
            {ADD_NODE_ITEMS.map((item) => (
              <button
                key={item.type}
                onClick={() => handleAddNode(item.type)}
                className="w-full flex items-center gap-3 px-2 py-2 rounded-lg text-left hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 transition-colors"
              >
                <item.icon className="w-5 h-5 text-zinc-500 dark:text-zinc-400" />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{item.label}</span>
                    {item.badge && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400">
                        {item.badge}
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-zinc-500">{item.description}</span>
                </div>
              </button>
            ))}
          </div>

          {/* Add Source Section */}
          <div>
            <div className="text-xs text-zinc-500 px-2 py-1 mb-2">Add Source</div>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full flex items-center gap-3 px-2 py-2 rounded-lg text-left hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 transition-colors"
            >
              <Upload className="w-5 h-5 text-zinc-500 dark:text-zinc-400" />
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
