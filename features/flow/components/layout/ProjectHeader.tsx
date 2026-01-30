'use client';

import { useState, useRef, useEffect } from 'react';
import { Sparkles, ChevronDown, Download, Upload, Trash2, Sun, Moon } from 'lucide-react';
import { useWorkflowStore, ColorMode } from '@/features/flow/store/workflowStore';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

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
    <div className="relative flex items-center gap-2 rounded-lg border bg-card p-2 shadow-sm">
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
        <Sparkles className="h-5 w-5 text-primary" />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-7 w-7">
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="start" sideOffset={8}>
            <DropdownMenuItem onClick={handleExport}>
              <Download className="mr-2 h-4 w-4" />
              Export
            </DropdownMenuItem>

            <DropdownMenuItem onClick={() => fileInputRef.current?.click()}>
              <Upload className="mr-2 h-4 w-4" />
              Import
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              onClick={handleClear}
              className="text-destructive focus:text-destructive focus:bg-destructive/10"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Clear
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem onClick={cycleTheme}>
              <ThemeIcon className="mr-2 h-4 w-4" />
              {colorMode === 'dark' ? 'Dark Mode' : 'Light Mode'}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Editable Project Name - normal weight, dynamic width */}
      {isEditing ? (
        <Input
          ref={inputRef}
          type="text"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={handleNameSave}
          onKeyDown={handleNameKeyDown}
          aria-label="Project name"
          style={{ width: inputWidth }}
          className="h-7 border-none bg-transparent px-1 text-sm font-normal focus-visible:ring-0 focus-visible:ring-offset-0"
        />
      ) : (
        <span
          onClick={handleNameClick}
          style={{ minWidth: inputWidth }}
          className="cursor-text px-1 text-sm font-normal text-foreground transition-colors hover:text-muted-foreground"
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
