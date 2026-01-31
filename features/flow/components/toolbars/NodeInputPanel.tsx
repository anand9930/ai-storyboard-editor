'use client';

import { useState, useCallback, useEffect } from 'react';
import { ArrowUp, X } from 'lucide-react';
import { FIXED_MODELS } from '@/features/flow/types/nodes';
import type { ConnectedImage, AspectRatio, ImageQuality } from '@/features/flow/types/nodes';
import { AspectRatioPopover } from '../selectors/AspectRatioPopover';
import { ModelSelector } from '../selectors/ModelSelector';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';

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
    <Card className="w-panel-lg p-panel shadow-xl backdrop-blur bg-card/95">
      {/* Error Display */}
      {error && (
        <Alert variant="destructive" className="mb-3 py-2">
          <AlertDescription className="flex items-start gap-2">
            <span className="flex-1">{error}</span>
            {onErrorDismiss && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onErrorDismiss}
                className="h-5 w-5 shrink-0"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Connected Images Preview */}
      {connectedImages && connectedImages.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {connectedImages.map((img, idx) => (
            <div
              key={img.id}
              className="relative h-12 w-12 overflow-hidden rounded-lg border"
            >
              <img
                src={img.url}
                alt={`Connected ${idx + 1}`}
                className="h-full w-full object-cover"
              />
              <Badge
                variant="secondary"
                className="absolute right-0 top-0 h-4 rounded-bl px-1 text-[10px]"
              >
                {idx + 1}
              </Badge>
            </div>
          ))}
        </div>
      )}

      {/* Prompt Input */}
      <Textarea
        value={prompt}
        onChange={(e) => handlePromptChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="min-h-[60px] resize-none border-none bg-transparent p-0 text-sm shadow-none focus-visible:ring-0"
        rows={2}
        disabled={isGenerating}
      />

      <Separator className="my-3" />

      {/* Bottom Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Model Selection/Badge */}
          {nodeType === 'text' ? (
            // Text model is fixed - show badge
            <Badge variant="secondary" className="gap-1.5">
              <span className="text-xs opacity-70">G</span>
              {textModel.name}
            </Badge>
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
          <span className="text-sm text-muted-foreground">1x</span>
          <span className="text-sm text-muted-foreground">4</span>

          {/* Submit Button */}
          <Button
            size="icon"
            onClick={handleSubmit}
            disabled={isGenerating || !prompt.trim()}
            className="h-8 w-8 rounded-full"
          >
            <ArrowUp className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
