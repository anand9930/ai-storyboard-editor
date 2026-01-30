'use client';

import { useState, useRef, useEffect } from 'react';
import { NodeToolbar, Position } from '@xyflow/react';
import {
  LayoutGrid,
  ArrowRight,
  Play,
  Workflow,
  Ungroup,
  ChevronDown,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import { useWorkflowStore } from '@/store/workflowStore';
import { useGroupExecution } from '@/hooks/useGroupExecution';
import { GROUP_COLORS } from '../nodes/GroupNode';

interface GroupToolbarProps {
  groupId: string;
  isVisible: boolean;
  backgroundColor?: string;
}

export function GroupToolbar({ groupId, isVisible, backgroundColor = '#3b82f6' }: GroupToolbarProps) {
  const { ungroupNode, updateGroupData, layoutGroupChildren } = useWorkflowStore();
  const { runGroup, isRunning, progress } = useGroupExecution({ groupId });

  const [showLayoutMenu, setShowLayoutMenu] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);

  const layoutMenuRef = useRef<HTMLDivElement>(null);
  const colorPickerRef = useRef<HTMLDivElement>(null);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (layoutMenuRef.current && !layoutMenuRef.current.contains(event.target as Node)) {
        setShowLayoutMenu(false);
      }
      if (colorPickerRef.current && !colorPickerRef.current.contains(event.target as Node)) {
        setShowColorPicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLayout = (layout: 'grid' | 'horizontal') => {
    layoutGroupChildren(groupId, layout);
    setShowLayoutMenu(false);
  };

  const handleColorChange = (color: string) => {
    updateGroupData(groupId, { backgroundColor: color });
    setShowColorPicker(false);
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
      className="flex items-center gap-1 bg-surface-primary border border-node rounded-lg p-1 shadow-lg"
    >
      {/* Color Picker */}
      <div className="relative" ref={colorPickerRef}>
        <button
          onClick={() => setShowColorPicker(!showColorPicker)}
          className="p-1.5 hover:bg-interactive-hover rounded transition-colors flex items-center gap-1"
          title="Background Color"
        >
          <div
            className="w-4 h-4 rounded-full border border-node"
            style={{ backgroundColor }}
          />
        </button>

        {showColorPicker && (
          <div className="absolute top-full left-0 mt-1 p-2 bg-surface-primary border border-node rounded-lg shadow-lg z-50">
            <div className="text-xs text-theme-text-secondary mb-2 whitespace-nowrap">
              Background Color
            </div>
            <div className="flex flex-col gap-1">
              {GROUP_COLORS.map((color) => (
                <button
                  key={color.value}
                  onClick={() => handleColorChange(color.value)}
                  className={`w-6 h-6 rounded-full border-2 transition-transform hover:scale-110 ${
                    backgroundColor === color.value
                      ? 'border-white ring-2 ring-offset-1 ring-primary'
                      : 'border-transparent'
                  }`}
                  style={{ backgroundColor: color.value }}
                  title={color.label}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Layout Menu */}
      <div className="relative" ref={layoutMenuRef}>
        <button
          onClick={() => setShowLayoutMenu(!showLayoutMenu)}
          className="p-1.5 hover:bg-interactive-hover rounded transition-colors flex items-center gap-1 text-theme-text-secondary"
          title="Layout"
        >
          <LayoutGrid className="w-4 h-4" />
          <ChevronDown className="w-3 h-3" />
        </button>

        {showLayoutMenu && (
          <div className="absolute top-full left-0 mt-1 py-1 bg-surface-primary border border-node rounded-lg shadow-lg z-50 min-w-[150px]">
            <button
              onClick={() => handleLayout('grid')}
              className="w-full px-3 py-1.5 text-sm text-left text-theme-text-primary hover:bg-interactive-hover flex items-center gap-2"
            >
              <LayoutGrid className="w-4 h-4" />
              Grid Layout
            </button>
            <button
              onClick={() => handleLayout('horizontal')}
              className="w-full px-3 py-1.5 text-sm text-left text-theme-text-primary hover:bg-interactive-hover flex items-center gap-2"
            >
              <ArrowRight className="w-4 h-4" />
              Horizontal Layout
            </button>
          </div>
        )}
      </div>

      <div className="w-px h-5 bg-interactive-active mx-1" />

      {/* Run Group */}
      <button
        onClick={handleRunGroup}
        disabled={isRunning}
        className="flex items-center gap-1.5 px-2 py-1.5 text-sm text-theme-text-primary hover:bg-interactive-hover rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        title={isRunning ? `Running: ${progress.currentNode || '...'}` : 'Run Group'}
      >
        {isRunning ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            {progress.total > 0 ? `${progress.completed}/${progress.total}` : 'Running...'}
          </>
        ) : (
          <>
            <Play className="w-4 h-4" />
            Run Group
          </>
        )}
      </button>

      {/* Create Workflow (Stub) */}
      <button
        onClick={handleCreateWorkflow}
        className="flex items-center gap-1.5 px-2 py-1.5 text-sm text-theme-text-primary hover:bg-interactive-hover rounded transition-colors"
        title="Create Workflow"
      >
        <Workflow className="w-4 h-4" />
        Create Workflow
      </button>

      <div className="w-px h-5 bg-interactive-active mx-1" />

      {/* Ungroup */}
      <button
        onClick={handleUngroup}
        className="flex items-center gap-1.5 px-2 py-1.5 text-sm text-theme-text-primary hover:bg-interactive-hover rounded transition-colors"
        title="Ungroup"
      >
        <Ungroup className="w-4 h-4" />
        Ungroup
      </button>
    </NodeToolbar>
  );
}
