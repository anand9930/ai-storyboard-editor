'use client';

import { useRef, useState, memo, useCallback, useMemo } from 'react';
import { NodeProps } from '@xyflow/react';
import { Upload } from 'lucide-react';
import { BaseNode } from './BaseNode';
import type { SourceNode as SourceNodeType, SourceNodeData } from '@/types/nodes';
import { useWorkflowStore } from '@/store/workflowStore';
import { GenerateFromNodePopup } from '../ui/GenerateFromNodePopup';

// Minimum node dimension constant
const MIN_SIZE = 240;

function SourceNodeComponent({ data, id, selected }: NodeProps<SourceNodeType>) {
  // data is now properly typed as SourceNodeData
  const nodeData = data as SourceNodeData;
  const { updateNodeData } = useWorkflowStore();
  const [popupSide, setPopupSide] = useState<'left' | 'right' | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  // Handle file upload
  const handleUpload = async (file: File) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const dataUrl = e.target?.result as string;

      const img = new window.Image();
      img.onload = () => {
        updateNodeData(id, {
          image: {
            id: `src-${Date.now()}`,
            url: dataUrl,
            metadata: {
              width: img.width,
              height: img.height,
              format: file.type.split('/')[1] || 'unknown',
            },
          },
        });
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  };

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
              className="absolute top-2 right-2 flex items-center gap-1.5 px-2.5 py-1.5 bg-zinc-800/80 hover:bg-zinc-700/80 text-white text-xs font-medium rounded-md backdrop-blur-sm transition-colors"
            >
              <Upload className="w-3.5 h-3.5" />
              Upload
            </button>
          </div>
        ) : (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="w-full h-full bg-surface-secondary border-2 border-dashed border-zinc-300 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-500 rounded-xl flex flex-col items-center justify-center cursor-pointer transition-colors"
          >
            <Upload className="w-8 h-8 text-zinc-400 dark:text-zinc-600 mb-2" />
            <span className="text-xs text-zinc-500">Click to upload</span>
          </div>
        )}

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
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
