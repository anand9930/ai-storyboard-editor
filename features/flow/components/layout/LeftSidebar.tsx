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
} from 'lucide-react';
import { useWorkflowStore } from '@/features/flow/store/workflowStore';
import { getDefaultNodeData } from '@/features/flow/types/nodes';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

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
    <TooltipProvider delayDuration={300}>
      <div className="relative">
        {/* Main sidebar buttons */}
        <div className="flex flex-col gap-1 rounded-lg border bg-card p-1.5 shadow-sm">
          {/* Add Node Button with Popover */}
          <Popover open={showNodeMenu} onOpenChange={setShowNodeMenu}>
            <Tooltip>
              <TooltipTrigger asChild>
                <PopoverTrigger asChild>
                  <Button
                    variant={showNodeMenu ? 'secondary' : 'ghost'}
                    size="icon"
                  >
                    <Plus className="h-5 w-5" />
                  </Button>
                </PopoverTrigger>
              </TooltipTrigger>
              <TooltipContent side="right">
                Add Node
              </TooltipContent>
            </Tooltip>

            <PopoverContent side="right" align="start" className="w-56 p-2">
              {/* Add Nodes Section */}
              <div className="mb-3">
                <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                  Add Nodes
                </div>
                {ADD_NODE_ITEMS.map((item) => (
                  <button
                    key={item.type}
                    onClick={() => handleAddNode(item.type)}
                    className="relative flex w-full cursor-default select-none items-center gap-3 rounded-sm px-2 py-2 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <item.icon className="h-5 w-5 text-muted-foreground" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{item.label}</span>
                        {item.badge && (
                          <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                            {item.badge}
                          </Badge>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground">{item.description}</span>
                    </div>
                  </button>
                ))}
              </div>

              <Separator className="my-2" />

              {/* Add Source Section */}
              <div>
                <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                  Add Source
                </div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="relative flex w-full cursor-default select-none items-center gap-3 rounded-sm px-2 py-2 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <Upload className="h-5 w-5 text-muted-foreground" />
                  <span className="font-medium">Upload</span>
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
            </PopoverContent>
          </Popover>

          <Separator className="my-1" />

          {/* Templates */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon">
                <LayoutTemplate className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              Templates
            </TooltipContent>
          </Tooltip>

          {/* Layers */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon">
                <Layers className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              Layers
            </TooltipContent>
          </Tooltip>

          {/* Chat */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon">
                <MessageSquare className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              Chat
            </TooltipContent>
          </Tooltip>

          {/* History */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon">
                <History className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              History
            </TooltipContent>
          </Tooltip>

          {/* Gallery */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon">
                <ImagePlay className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              Gallery
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
    </TooltipProvider>
  );
}
