'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { AspectRatio, ImageQuality } from '@/features/flow/types/nodes';
import { getModelSpec, DEFAULT_MODEL_SPEC } from '@/lib/modelSpecs';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface AspectRatioPopoverProps {
  aspectRatio: AspectRatio | null;
  quality: ImageQuality | null;
  modelId: string;
  onAspectRatioChange: (value: AspectRatio | null) => void;
  onQualityChange: (value: ImageQuality | null) => void;
}

// SVG icons for aspect ratios - colors inherit from text via currentColor
function AspectRatioIcon({ ratio, className }: { ratio: AspectRatio | 'auto'; className?: string }) {
  const getIconDimensions = (r: AspectRatio | 'auto'): { width: number; height: number } => {
    switch (r) {
      case 'auto':
        return { width: 12, height: 12 };
      case '1:1':
        return { width: 12, height: 12 };
      case '9:16':
        return { width: 8, height: 14 };
      case '16:9':
        return { width: 14, height: 8 };
      case '3:4':
        return { width: 10, height: 14 };
      case '4:3':
        return { width: 14, height: 10 };
      case '3:2':
        return { width: 12, height: 8 };
      case '2:3':
        return { width: 8, height: 12 };
      case '5:4':
        return { width: 12, height: 10 };
      case '4:5':
        return { width: 10, height: 12 };
      case '21:9':
        return { width: 14, height: 6 };
      case '9:21':
        return { width: 6, height: 14 };
      default:
        return { width: 12, height: 12 };
    }
  };

  if (ratio === 'auto') {
    // Scan/crop icon with corner brackets (like viewfinder)
    return (
      <svg className={className} width="16" height="16" viewBox="0 0 16 16" fill="none">
        {/* Top-left corner */}
        <path d="M1 5V2.5C1 1.67 1.67 1 2.5 1H5" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
        {/* Top-right corner */}
        <path d="M11 1H13.5C14.33 1 15 1.67 15 2.5V5" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
        {/* Bottom-left corner */}
        <path d="M1 11V13.5C1 14.33 1.67 15 2.5 15H5" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
        {/* Bottom-right corner */}
        <path d="M11 15H13.5C14.33 15 15 14.33 15 13.5V11" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
        {/* Center square */}
        <rect x="5.5" y="5.5" width="5" height="5" rx="0.5" stroke="currentColor" strokeWidth="1" />
      </svg>
    );
  }

  const { width, height } = getIconDimensions(ratio);
  const x = (16 - width) / 2;
  const y = (16 - height) / 2;

  return (
    <svg className={className} width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect x={x} y={y} width={width} height={height} rx="1" stroke="currentColor" strokeWidth="1" />
    </svg>
  );
}

export function AspectRatioPopover({
  aspectRatio,
  quality,
  modelId,
  onAspectRatioChange,
  onQualityChange,
}: AspectRatioPopoverProps) {
  const [open, setOpen] = useState(false);

  // Get model spec for supported options
  const modelSpec = getModelSpec(modelId) ?? DEFAULT_MODEL_SPEC;
  const supportedQualities = modelSpec.supportedQualities;
  const supportedAspectRatios = modelSpec.supportedAspectRatios;

  // For single-quality models, show quality as non-interactive
  const isSingleQuality = supportedQualities.length === 1;

  const displayAspectRatio = aspectRatio || 'Auto';
  const displayQuality = quality || supportedQualities[0] || 'Auto';

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className={cn(
            'flex items-center gap-1.5 bg-secondary px-2 py-1 rounded-lg',
            'hover:bg-accent transition-colors',
            'text-sm text-foreground'
          )}
        >
          <AspectRatioIcon ratio={aspectRatio || 'auto'} className="w-4 h-4" />
          <span>{displayAspectRatio}</span>
          <span className="text-muted-foreground">·</span>
          <span>{displayQuality}</span>
          <ChevronDown
            className={cn(
              'w-3 h-3 transition-transform duration-200',
              open && 'rotate-180'
            )}
          />
        </button>
      </PopoverTrigger>

      <PopoverContent
        className="w-panel-md p-4"
        side="top"
        align="start"
        sideOffset={8}
      >
        {/* Quality Section */}
        <div className="mb-4">
          <h4 className="text-xs text-muted-foreground mb-2 font-medium">Quality</h4>
          {isSingleQuality ? (
            <button
              className={cn(
                'w-full flex items-center justify-center px-3 py-2 rounded-lg text-sm',
                'bg-accent text-foreground cursor-default'
              )}
            >
              <span>{supportedQualities[0]}</span>
            </button>
          ) : (
            <div className="flex gap-1">
              {supportedQualities.map((q) => (
                <button
                  key={q}
                  onClick={() => onQualityChange(q as ImageQuality)}
                  className={cn(
                    'flex-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                    quality === q
                      ? 'bg-accent text-foreground'
                      : 'bg-secondary text-foreground hover:bg-accent'
                  )}
                >
                  {q}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Aspect Ratio Section */}
        <div>
          <h4 className="text-xs text-muted-foreground mb-2 font-medium">Aspect Ratio</h4>
          <div className="grid grid-cols-6 gap-1" style={{ gridTemplateRows: 'auto auto' }}>
            {/* Auto option - spans 2 rows */}
            <button
              onClick={() => onAspectRatioChange(null)}
              className={cn(
                'row-span-2 flex flex-col items-center justify-center p-2 rounded-lg transition-colors',
                aspectRatio === null
                  ? 'bg-accent text-foreground'
                  : 'bg-secondary text-foreground hover:bg-accent'
              )}
            >
              <AspectRatioIcon ratio="auto" className="w-5 h-5 mb-1" />
              <span className="text-[10px]">Auto</span>
            </button>

            {/* Supported aspect ratios only */}
            {supportedAspectRatios.map((ar) => (
              <button
                key={ar}
                onClick={() => onAspectRatioChange(ar)}
                className={cn(
                  'flex flex-col items-center justify-center p-2 rounded-lg transition-colors',
                  aspectRatio === ar
                    ? 'bg-accent text-foreground'
                    : 'bg-secondary text-foreground hover:bg-accent'
                )}
              >
                <AspectRatioIcon ratio={ar} className="w-4 h-4 mb-0.5" />
                <span className="text-[10px]">{ar}</span>
              </button>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
