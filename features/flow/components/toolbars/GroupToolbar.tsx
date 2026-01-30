'use client';

import { NodeToolbar, Position } from '@xyflow/react';
import {
  LayoutGrid,
  ArrowRight,
  Play,
  Workflow,
  Ungroup,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import { useWorkflowStore } from '@/features/flow/store/workflowStore';
import { useGroupExecution } from '@/features/flow/hooks/useGroupExecution';
import { GROUP_COLORS } from '../nodes/GroupNode';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface GroupToolbarProps {
  groupId: string;
  isVisible: boolean;
  backgroundColor?: string;
}

export function GroupToolbar({ groupId, isVisible, backgroundColor = '#3b82f6' }: GroupToolbarProps) {
  const { ungroupNode, updateGroupData, layoutGroupChildren } = useWorkflowStore();
  const { runGroup, isRunning, progress } = useGroupExecution({ groupId });

  const handleLayout = (layout: 'grid' | 'horizontal') => {
    layoutGroupChildren(groupId, layout);
  };

  const handleColorChange = (color: string) => {
    updateGroupData(groupId, { backgroundColor: color });
  };

  const handleUngroup = () => {
    ungroupNode(groupId);
  };

  const handleRunGroup = async () => {
    try {
      await runGroup();
      toast.success('Group execution completed!');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Group execution failed';
      toast.error(message);
    }
  };

  const handleCreateWorkflow = () => {
    // Stub - show alert for now
    alert('Create Workflow feature coming soon!');
  };

  return (
    <NodeToolbar
      nodeId={groupId}
      isVisible={isVisible}
      position={Position.Top}
      offset={20}
      className="flex items-center gap-1 rounded-lg border bg-card p-1 shadow-md"
    >
      {/* Color Picker */}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <div
              className="h-4 w-4 rounded-full border"
              style={{ backgroundColor }}
            />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-2" align="start">
          <div className="mb-2 text-xs text-muted-foreground whitespace-nowrap">
            Background Color
          </div>
          <div className="flex flex-col gap-1">
            {GROUP_COLORS.map((color) => (
              <button
                key={color.value}
                onClick={() => handleColorChange(color.value)}
                className={`h-6 w-6 rounded-full border-2 transition-transform hover:scale-110 ${
                  backgroundColor === color.value
                    ? 'border-background ring-2 ring-offset-1 ring-primary'
                    : 'border-transparent'
                }`}
                style={{ backgroundColor: color.value }}
                title={color.label}
              />
            ))}
          </div>
        </PopoverContent>
      </Popover>

      {/* Layout Menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8 gap-1 px-2">
            <LayoutGrid className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuItem onClick={() => handleLayout('grid')}>
            <LayoutGrid className="mr-2 h-4 w-4" />
            Grid Layout
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleLayout('horizontal')}>
            <ArrowRight className="mr-2 h-4 w-4" />
            Horizontal Layout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Separator orientation="vertical" className="mx-1 h-5" />

      {/* Run Group */}
      <Button
        variant="ghost"
        size="sm"
        onClick={handleRunGroup}
        disabled={isRunning}
        className="h-8 gap-1.5 px-2"
        title={isRunning ? `Running: ${progress.currentNode || '...'}` : 'Run Group'}
      >
        {isRunning ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            {progress.total > 0 ? `${progress.completed}/${progress.total}` : 'Running...'}
          </>
        ) : (
          <>
            <Play className="h-4 w-4" />
            Run Group
          </>
        )}
      </Button>

      {/* Create Workflow (Stub) */}
      <Button
        variant="ghost"
        size="sm"
        onClick={handleCreateWorkflow}
        className="h-8 gap-1.5 px-2"
        title="Create Workflow"
      >
        <Workflow className="h-4 w-4" />
        Create Workflow
      </Button>

      <Separator orientation="vertical" className="mx-1 h-5" />

      {/* Ungroup */}
      <Button
        variant="ghost"
        size="sm"
        onClick={handleUngroup}
        className="h-8 gap-1.5 px-2"
        title="Ungroup"
      >
        <Ungroup className="h-4 w-4" />
        Ungroup
      </Button>
    </NodeToolbar>
  );
}
