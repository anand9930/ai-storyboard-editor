'use client';

import { useRef, useEffect } from 'react';
import { Download, Upload, Trash2, Sparkles, Sun, Moon } from 'lucide-react';
import { useWorkflowStore, ColorMode } from '@/store/workflowStore';
import { toast } from 'sonner';

export function TopBar() {
  const { exportWorkflow, importWorkflow, clearWorkflow, colorMode, setColorMode } = useWorkflowStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Apply theme class to document
  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('dark', colorMode === 'dark');
  }, [colorMode]);

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
      a.download = `workflow-${Date.now()}.json`;
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
    <div className="flex items-center gap-2 bg-white/95 dark:bg-zinc-900/95 backdrop-blur border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2">
      {/* Logo */}
      <div className="flex items-center gap-2 pr-3 border-r border-zinc-200 dark:border-zinc-800">
        <Sparkles className="w-5 h-5 text-blue-500" />
        <span className="font-semibold text-zinc-800 dark:text-zinc-200">Storyboard</span>
      </div>

      {/* Actions */}
      <button
        onClick={handleExport}
        className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
      >
        <Download className="w-4 h-4" />
        Export
      </button>

      <button
        onClick={() => fileInputRef.current?.click()}
        className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
      >
        <Upload className="w-4 h-4" />
        Import
      </button>

      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleImport}
        className="hidden"
      />

      <div className="w-px h-6 bg-zinc-700 dark:bg-zinc-700" />

      <button
        onClick={handleClear}
        className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
      >
        <Trash2 className="w-4 h-4" />
        Clear
      </button>

      <div className="w-px h-6 bg-zinc-700 dark:bg-zinc-700" />

      <button
        onClick={cycleTheme}
        className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
        title={`Theme: ${colorMode}`}
      >
        <ThemeIcon className="w-4 h-4" />
      </button>
    </div>
  );
}
