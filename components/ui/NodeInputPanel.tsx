'use client';

import { useState, useCallback, useEffect } from 'react';
import { ArrowUp, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { FIXED_MODELS } from '@/types/nodes';

interface NodeInputPanelProps {
  nodeId: string;
  nodeType: 'text' | 'image';
  onSubmit: (prompt: string) => void;
  isGenerating: boolean;
  connectedImage?: string;
  initialPrompt?: string;
}

export function NodeInputPanel({
  nodeId,
  nodeType,
  onSubmit,
  isGenerating,
  connectedImage,
  initialPrompt = '',
}: NodeInputPanelProps) {
  const [prompt, setPrompt] = useState(initialPrompt);

  // Sync prompt when node changes or initialPrompt updates
  useEffect(() => {
    setPrompt(initialPrompt);
  }, [nodeId, initialPrompt]);

  const model = FIXED_MODELS[nodeType];
  const placeholder =
    nodeType === 'text'
      ? 'Describe what you want to generate and adjust parameters below. (Enter to generate, Shift+Enter for new line)'
      : 'Type a prompt or press "/" for commands (Enter to send, Shift+Enter for new line)';

  const handleSubmit = useCallback(() => {
    if (prompt.trim() && !isGenerating) {
      onSubmit(prompt.trim());
    }
  }, [prompt, isGenerating, onSubmit]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSubmit();
      }
    },
    [handleSubmit]
  );

  return (
    <div className="bg-white/95 dark:bg-zinc-900/95 backdrop-blur border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 shadow-xl w-[500px]">
      {/* Connected Image Preview */}
      {connectedImage && (
        <div className="flex gap-2 mb-3">
          <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-zinc-300 dark:border-zinc-700">
            <img
              src={connectedImage}
              alt="Connected"
              className="w-full h-full object-cover"
            />
            <span className="absolute top-0 right-0 bg-zinc-200 dark:bg-zinc-800 text-[10px] text-zinc-500 dark:text-zinc-400 px-1 rounded-bl">
              1
            </span>
          </div>
        </div>
      )}

      {/* Prompt Input */}
      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="w-full bg-transparent text-sm text-zinc-700 dark:text-zinc-300 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 resize-none focus:outline-none min-h-[60px]"
        rows={2}
        disabled={isGenerating}
      />

      {/* Bottom Controls */}
      <div className="flex items-center justify-between pt-3 border-t border-zinc-200 dark:border-zinc-800 mt-3">
        <div className="flex items-center gap-3">
          {/* Model Badge */}
          <div className="flex items-center gap-1.5 bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded-lg">
            <span className="text-xs text-zinc-500">G</span>
            <span className="text-sm text-zinc-700 dark:text-zinc-300">{model.name}</span>
          </div>

          {/* Aspect Ratio (for image only) */}
          {nodeType === 'image' && (
            <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded-lg">
              <Sparkles className="w-3 h-3 text-zinc-500" />
              <span className="text-sm text-zinc-700 dark:text-zinc-300">Auto</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* Generation Count */}
          <span className="text-sm text-zinc-500">1x</span>
          <span className="text-sm text-zinc-500">4</span>

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={isGenerating || !prompt.trim()}
            className={cn(
              'p-2 rounded-full transition-all',
              isGenerating || !prompt.trim()
                ? 'bg-zinc-200 dark:bg-zinc-700 text-zinc-500 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-500 text-white'
            )}
          >
            <ArrowUp className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
