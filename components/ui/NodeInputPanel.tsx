'use client';

import { useState, useCallback, useEffect } from 'react';
import { ArrowUp, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { FIXED_MODELS } from '@/types/nodes';
import type { ConnectedImage, AspectRatio, ImageQuality } from '@/types/nodes';
import { AspectRatioPopover } from './AspectRatioPopover';
import { ModelSelector } from './ModelSelector';

interface NodeInputPanelProps {
  nodeId: string;
  nodeType: 'text' | 'image';
  onSubmit: (prompt: string) => void;
  isGenerating: boolean;
  connectedImages?: ConnectedImage[];
  initialPrompt?: string;
  aspectRatio?: AspectRatio | null;
  quality?: ImageQuality | null;
  model?: string; // Image model ID (for image nodes)
  onAspectRatioChange?: (value: AspectRatio | null) => void;
  onQualityChange?: (value: ImageQuality | null) => void;
  onModelChange?: (modelId: string) => void;
  onPromptChange?: (prompt: string) => void;
  error?: string;
  onErrorDismiss?: () => void;
}

export function NodeInputPanel({
  nodeId,
  nodeType,
  onSubmit,
  isGenerating,
  connectedImages,
  initialPrompt = '',
  aspectRatio,
  quality,
  model,
  onAspectRatioChange,
  onQualityChange,
  onModelChange,
  onPromptChange,
  error,
  onErrorDismiss,
}: NodeInputPanelProps) {
  const [prompt, setPrompt] = useState(initialPrompt);

  // Handle prompt change - update local state and persist to node data
  const handlePromptChange = useCallback(
    (value: string) => {
      setPrompt(value);
      onPromptChange?.(value);
    },
    [onPromptChange]
  );

  // Sync prompt when node changes or initialPrompt updates
  useEffect(() => {
    setPrompt(initialPrompt);
  }, [nodeId, initialPrompt]);

  // Text model is still fixed
  const textModel = FIXED_MODELS.text;
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
      {/* Error Display */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-sm text-red-400 mb-3 flex items-start gap-2">
          <span className="flex-1">{error}</span>
          {onErrorDismiss && (
            <button
              onClick={onErrorDismiss}
              className="p-0.5 hover:bg-red-500/20 rounded transition-colors flex-shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

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
        onChange={(e) => handlePromptChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="w-full bg-transparent text-sm text-theme-text-primary placeholder:text-theme-text-muted resize-none focus:outline-none min-h-[60px]"
        rows={2}
        disabled={isGenerating}
      />

      {/* Bottom Controls */}
      <div className="flex items-center justify-between pt-3 border-t border-node mt-3">
        <div className="flex items-center gap-3">
          {/* Model Selection/Badge */}
          {nodeType === 'text' ? (
            // Text model is fixed - show badge
            <div className="flex items-center gap-1.5 bg-surface-secondary px-2 py-1 rounded-lg">
              <span className="text-xs text-theme-text-secondary">G</span>
              <span className="text-sm text-theme-text-primary">{textModel.name}</span>
            </div>
          ) : (
            // Image model is selectable
            model && onModelChange && (
              <ModelSelector
                value={model}
                onChange={onModelChange}
                disabled={isGenerating}
              />
            )
          )}

          {/* Aspect Ratio Popover (for image only) */}
          {nodeType === 'image' && model && onAspectRatioChange && onQualityChange && (
            <AspectRatioPopover
              aspectRatio={aspectRatio ?? null}
              quality={quality ?? null}
              modelId={model}
              onAspectRatioChange={onAspectRatioChange}
              onQualityChange={onQualityChange}
            />
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
