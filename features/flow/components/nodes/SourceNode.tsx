'use client';

import { useRef, useState, memo, useCallback, useMemo } from 'react';
import { NodeProps } from '@xyflow/react';
import { Upload, Loader2 } from 'lucide-react';
import { BaseNode } from './BaseNode';
import type { SourceNode as SourceNodeType, SourceNodeData } from '@/features/flow/types/nodes';
import { useWorkflowStore } from '@/features/flow/store/workflowStore';
import { GenerateFromNodePopup } from '../popups/GenerateFromNodePopup';
import { useImageUpload } from '@/hooks/useImageUpload';
import { cn } from '@/lib/utils';

// Minimum node dimension constant
const MIN_SIZE = 240;

function SourceNodeComponent({ data, id, selected }: NodeProps<SourceNodeType>) {
  // data is now properly typed as SourceNodeData
  const nodeData = data as SourceNodeData;
  const { updateNodeData } = useWorkflowStore();
  const [popupSide, setPopupSide] = useState<'left' | 'right' | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Use the image upload hook for R2 uploads
  const { upload, isUploading, error } = useImageUpload({
    folder: 'source',
  });

  // Calculate node dimensions based on image aspect ratio
  // Portrait: width=240, height expands | Landscape: height=240, width expands
  const { calculatedWidth, calculatedHeight } = useMemo(() => {
    if (!nodeData.image?.metadata) return { calculatedWidth: MIN_SIZE, calculatedHeight: MIN_SIZE };
    const { width, height } = nodeData.image.metadata;
    const aspectRatio = width / height;

    if (aspectRatio >= 1) {
      // Landscape or square: height is 240, width expands
      return { calculatedWidth: Math.round(MIN_SIZE * aspectRatio), calculatedHeight: MIN_SIZE };
    } else {
      // Portrait: width is 240, height expands
      return { calculatedWidth: MIN_SIZE, calculatedHeight: Math.round(MIN_SIZE / aspectRatio) };
    }
  }, [nodeData.image?.metadata]);

  // Handle file upload to R2
  const handleUpload = useCallback(async (file: File) => {
    const result = await upload(file);

    updateNodeData(id, {
      image: {
        id: `src-${Date.now()}`,
        url: result.url,
        metadata: {
          width: result.metadata.width,
          height: result.metadata.height,
          format: result.metadata.format,
        },
      },
    });
  }, [id, updateNodeData, upload]);

  // Handle name change
  const handleNameChange = useCallback((newName: string) => {
    updateNodeData(id, { name: newName });
  }, [id, updateNodeData]);

  return (
    <>
      <BaseNode
        id={id}
        handles={{ outputs: ['image'] }}
        selected={selected}
        onPlusClick={(side) => setPopupSide(side)}
        plusDisabled={!nodeData.image}
        plusButtonSide="right"
        nodeName={nodeData.name}
        onNameChange={handleNameChange}
        noPadding={true}
        width={calculatedWidth}
        height={calculatedHeight}
      >
        {/* Image Display or Upload Zone */}
        {nodeData.image ? (
          <div
            className="relative w-full h-full overflow-hidden"
          >
            <img
              src={nodeData.image.url}
              alt="Source"
              className="w-full h-full object-cover"
              draggable={false}
            />
            {/* Upload button - always visible, top right */}
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              aria-label={isUploading ? "Uploading image" : "Upload new image"}
              aria-busy={isUploading}
              className={cn(
                "absolute top-2 right-2 flex items-center gap-1.5 px-2.5 py-1.5 text-foreground text-xs font-medium rounded-md backdrop-blur-sm transition-colors",
                isUploading
                  ? "bg-muted/80 cursor-not-allowed"
                  : "bg-background/80 hover:bg-accent/80"
              )}
            >
              {isUploading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <>
                  <Upload className="w-3.5 h-3.5" />
                  Upload
                </>
              )}
            </button>
          </div>
        ) : (
          <div
            role="button"
            tabIndex={isUploading ? -1 : 0}
            onClick={() => !isUploading && fileInputRef.current?.click()}
            onKeyDown={(e) => {
              if ((e.key === 'Enter' || e.key === ' ') && !isUploading) {
                e.preventDefault();
                fileInputRef.current?.click();
              }
            }}
            aria-label={isUploading ? "Uploading image" : "Click to upload image"}
            aria-busy={isUploading}
            className={cn(
              "w-full h-full bg-muted border-2 border-dashed rounded-xl flex flex-col items-center justify-center transition-colors",
              isUploading
                ? "border-muted-foreground cursor-not-allowed"
                : "border-border hover:border-primary cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            )}
          >
            {isUploading ? (
              <>
                <Loader2 className="w-8 h-8 text-muted-foreground mb-2 animate-spin" />
                <span className="text-xs text-muted-foreground">Uploading...</span>
              </>
            ) : (
              <>
                <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                <span className="text-xs text-muted-foreground">Click to upload</span>
              </>
            )}
          </div>
        )}

        {/* Error display */}
        {error && (
          <div className="absolute bottom-2 left-2 right-2 bg-destructive/90 text-destructive-foreground text-xs px-2 py-1 rounded">
            {error}
          </div>
        )}

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleUpload(file);
            e.target.value = '';
          }}
          className="hidden"
        />
      </BaseNode>

      {/* Generate from Node Popup */}
      {popupSide && (
        <GenerateFromNodePopup
          sourceNodeId={id}
          side={popupSide}
          onClose={() => setPopupSide(null)}
        />
      )}
    </>
  );
}

export const SourceNode = memo(SourceNodeComponent);
