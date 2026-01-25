'use client';

import { useState, useCallback, useEffect } from 'react';
import { ArrowUp, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { FIXED_MODELS } from '@/types/nodes';
import type { ConnectedImage } from '@/types/nodes';

interface NodeInputPanelProps {
  nodeId: string;
  nodeType: 'text' | 'image';
  onSubmit: (prompt: string) => void;
  isGenerating: boolean;
  connectedImages?: ConnectedImage[];
  initialPrompt?: string;
}

export function NodeInputPanel({
  nodeId,
  nodeType,
  onSubmit,
  isGenerating,
  connectedImages,
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
    <div className="bg-surface-primary/95 backdrop-blur border border-node rounded-xl p-4 shadow-xl w-[500px]">
      {/* Connected Images Preview */}
      {connectedImages && connectedImages.length > 0 && (
        <div className="flex gap-2 mb-3 flex-wrap">
          {connectedImages.map((img, idx) => (
            <div
              key={img.id}
              className="relative w-12 h-12 rounded-lg overflow-hidden border border-node"
            >
              <img
                src={img.url}
                alt={`Connected ${idx + 1}`}
                className="w-full h-full object-cover"
              />
              <span className="absolute top-0 right-0 bg-interactive-active text-[10px] text-theme-text-secondary px-1 rounded-bl">
                {idx + 1}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Prompt Input */}
      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="w-full bg-transparent text-sm text-theme-text-primary placeholder:text-theme-text-muted resize-none focus:outline-none min-h-[60px]"
        rows={2}
        disabled={isGenerating}
      />

      {/* Bottom Controls */}
      <div className="flex items-center justify-between pt-3 border-t border-node mt-3">
        <div className="flex items-center gap-3">
          {/* Model Badge */}
          <div className="flex items-center gap-1.5 bg-surface-secondary px-2 py-1 rounded-lg">
            <span className="text-xs text-theme-text-secondary">G</span>
            <span className="text-sm text-theme-text-primary">{model.name}</span>
          </div>

          {/* Aspect Ratio (for image only) */}
          {nodeType === 'image' && (
            <div className="flex items-center gap-1 bg-surface-secondary px-2 py-1 rounded-lg">
              <Sparkles className="w-3 h-3 text-theme-text-secondary" />
              <span className="text-sm text-theme-text-primary">Auto</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* Generation Count */}
          <span className="text-sm text-theme-text-secondary">1x</span>
          <span className="text-sm text-theme-text-secondary">4</span>

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={isGenerating || !prompt.trim()}
            className={cn(
              'p-2 rounded-full transition-all',
              isGenerating || !prompt.trim()
                ? 'bg-interactive-active text-theme-text-muted cursor-not-allowed'
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
