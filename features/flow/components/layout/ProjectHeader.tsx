'use client';

import { useState, useRef, useEffect } from 'react';
import { Sparkles, ChevronDown, Download, Upload, Trash2, Sun, Moon } from 'lucide-react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { useWorkflowStore, ColorMode } from '@/features/flow/store/workflowStore';
import { toast } from 'sonner';

export function ProjectHeader() {
  const { projectName, setProjectName, exportWorkflow, importWorkflow, clearWorkflow, colorMode, setColorMode } =
    useWorkflowStore();
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(projectName);
  const [inputWidth, setInputWidth] = useState(60);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const measureRef = useRef<HTMLSpanElement>(null);

  // Sync editValue when projectName changes
  useEffect(() => {
    setEditValue(projectName);
  }, [projectName]);

  // Update input width based on text content
  useEffect(() => {
    if (measureRef.current) {
      const width = Math.max(60, Math.min(200, measureRef.current.scrollWidth + 8));
      setInputWidth(width);
    }
  }, [editValue, projectName]);

  // Focus input when editing starts
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  // Apply theme class to document
  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('dark', colorMode === 'dark');
  }, [colorMode]);

  const handleNameClick = () => {
    setEditValue(projectName);
    setIsEditing(true);
  };

  const handleNameSave = () => {
    const trimmed = editValue.trim();
    if (trimmed) {
      setProjectName(trimmed);
    } else {
      setEditValue(projectName);
    }
    setIsEditing(false);
  };

  const handleNameKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleNameSave();
    } else if (e.key === 'Escape') {
      setEditValue(projectName);
      setIsEditing(false);
    }
  };

  const cycleTheme = () => {
    const nextMode: ColorMode = colorMode === 'dark' ? 'light' : 'dark';
    setColorMode(nextMode);
    toast.success(`Theme: ${nextMode}`);
  };

  const ThemeIcon = colorMode === 'dark' ? Moon : Sun;

  const handleExport = () => {
    try {
      const json = exportWorkflow();
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${projectName.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Workflow exported successfully');
    } catch (error) {
      toast.error('Failed to export workflow');
    }
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          importWorkflow(e.target?.result as string);
          toast.success('Workflow imported successfully');
        } catch (error) {
          toast.error('Failed to import workflow: Invalid file format');
        }
      };
      reader.readAsText(file);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClear = () => {
    if (window.confirm('Are you sure you want to clear the workflow? This cannot be undone.')) {
      clearWorkflow();
      toast.success('Workflow cleared');
    }
  };

  return (
    <div className="relative flex items-center gap-2 bg-surface-primary/95 backdrop-blur border border-node rounded-xl p-2">
      {/* Hidden span for measuring text width */}
      <span
        ref={measureRef}
        className="absolute invisible whitespace-pre font-normal text-sm"
        aria-hidden="true"
      >
        {isEditing ? editValue : projectName}
      </span>

      {/* Icon + Dropdown grouped */}
      <div className="flex items-center">
        <Sparkles className="w-5 h-5 text-primary" />
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button className="p-1 hover:bg-interactive-hover rounded transition-colors">
              <ChevronDown className="w-4 h-4 text-theme-text-secondary" />
            </button>
          </DropdownMenu.Trigger>

          <DropdownMenu.Portal>
            <DropdownMenu.Content
              className="z-50 min-w-[160px] bg-surface-primary border border-node rounded-xl p-1 shadow-xl animate-in fade-in-0 zoom-in-95"
              sideOffset={8}
              align="start"
              alignOffset={-8}
            >
              <DropdownMenu.Item
                onClick={handleExport}
                className="flex items-center gap-2 px-3 py-2 text-sm text-theme-text-primary hover:bg-interactive-hover rounded-lg cursor-pointer outline-none"
              >
                <Download className="w-4 h-4" />
                Export
              </DropdownMenu.Item>

              <DropdownMenu.Item
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 px-3 py-2 text-sm text-theme-text-primary hover:bg-interactive-hover rounded-lg cursor-pointer outline-none"
              >
                <Upload className="w-4 h-4" />
                Import
              </DropdownMenu.Item>

              <DropdownMenu.Separator className="h-px bg-interactive-active my-1" />

              <DropdownMenu.Item
                onClick={handleClear}
                className="flex items-center gap-2 px-3 py-2 text-sm text-status-error hover:bg-status-error/10 rounded-lg cursor-pointer outline-none"
              >
                <Trash2 className="w-4 h-4" />
                Clear
              </DropdownMenu.Item>

              <DropdownMenu.Separator className="h-px bg-interactive-active my-1" />

              <DropdownMenu.Item
                onClick={cycleTheme}
                className="flex items-center gap-2 px-3 py-2 text-sm text-theme-text-primary hover:bg-interactive-hover rounded-lg cursor-pointer outline-none"
              >
                <ThemeIcon className="w-4 h-4" />
                {colorMode === 'dark' ? 'Dark Mode' : 'Light Mode'}
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      </div>

      {/* Editable Project Name - normal weight, dynamic width */}
      {isEditing ? (
        <input
          ref={inputRef}
          type="text"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={handleNameSave}
          onKeyDown={handleNameKeyDown}
          style={{ width: inputWidth }}
          className="bg-transparent border-none outline-none text-theme-text-primary font-normal text-sm px-1"
        />
      ) : (
        <span
          onClick={handleNameClick}
          style={{ minWidth: inputWidth }}
          className="font-normal text-theme-text-primary text-sm cursor-text hover:text-theme-text-secondary transition-colors px-1"
        >
          {projectName}
        </span>
      )}

      {/* Hidden file input for import */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleImport}
        className="hidden"
      />
    </div>
  );
}
