'use client';

import { useEffect } from 'react';
import { useWorkflowStore } from '@/store/workflowStore';

/**
 * Hook that enables keyboard shortcuts for undo/redo operations.
 *
 * Shortcuts:
 * - Undo: Ctrl+Z (Windows/Linux) / Cmd+Z (Mac)
 * - Redo: Ctrl+Y or Ctrl+Shift+Z (Windows/Linux) / Cmd+Shift+Z (Mac)
 *
 * Note: Shortcuts are disabled when the user is typing in an input field,
 * textarea, or contenteditable element to allow native text editing undo.
 */
export function useUndoRedoShortcuts() {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Skip if user is typing in an input/textarea/contenteditable
      const target = e.target as HTMLElement;
      const isEditableElement =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable;

      if (isEditableElement) {
        return;
      }

      // Detect Mac vs Windows/Linux (using userAgent since platform is deprecated)
      const isMac = /Mac|iPhone|iPad|iPod/.test(navigator.userAgent);
      const modifier = isMac ? e.metaKey : e.ctrlKey;

      if (!modifier) return;

      // Undo: Ctrl+Z / Cmd+Z (without shift)
      if (e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        useWorkflowStore.temporal.getState().undo();
        return;
      }

      // Redo: Ctrl+Y (Windows) / Ctrl+Shift+Z / Cmd+Shift+Z
      if ((e.key === 'y' && !e.shiftKey) || (e.key === 'z' && e.shiftKey) || (e.key === 'Z' && e.shiftKey)) {
        e.preventDefault();
        useWorkflowStore.temporal.getState().redo();
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
}

/**
 * Hook that provides undo/redo state and actions.
 * Useful for creating UI buttons or displaying undo/redo availability.
 */
export function useUndoRedo() {
  const { undo, redo, pastStates, futureStates } = useWorkflowStore.temporal.getState();

  return {
    undo,
    redo,
    canUndo: pastStates.length > 0,
    canRedo: futureStates.length > 0,
    undoCount: pastStates.length,
    redoCount: futureStates.length,
  };
}
