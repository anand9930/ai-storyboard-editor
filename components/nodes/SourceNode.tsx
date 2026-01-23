'use client';

import { useRef, useState, memo, useCallback } from 'react';
import { NodeProps } from '@xyflow/react';
import { Upload, Crop, Download, Maximize2 } from 'lucide-react';
import { BaseNode } from './BaseNode';
import { SourceNodeData } from '@/types/nodes';
import { useWorkflowStore } from '@/store/workflowStore';
import { GenerateFromNodePopup } from '../ui/GenerateFromNodePopup';

function SourceNodeComponent({ data, id, selected }: NodeProps) {
  const nodeData = data as unknown as SourceNodeData;
  const { updateNodeData } = useWorkflowStore();
  const [popupSide, setPopupSide] = useState<'left' | 'right' | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  // Handle download
  const handleDownload = () => {
    if (nodeData.image) {
      const a = document.createElement('a');
      a.href = nodeData.image.url;
      a.download = `source-${nodeData.image.id}.png`;
      a.click();
    }
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
      >
        <div className="space-y-3">
          {/* Replace Button */}
          {nodeData.image && (
            <div className="flex items-center justify-end">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="text-xs text-blue-500 dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-300 transition-colors"
              >
                Replace
              </button>
            </div>
          )}

          {/* Image Display or Upload Zone */}
          {nodeData.image ? (
            <div className="relative rounded-lg overflow-hidden group">
              <img
                src={nodeData.image.url}
                alt="Source"
                className="w-full aspect-square object-cover"
                draggable={false}
              />
              {/* Toolbar - appears on hover */}
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 bg-white/90 dark:bg-zinc-900/90 backdrop-blur rounded-lg p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded transition-colors"
                  title="Crop"
                >
                  <Crop className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
                </button>
                <button
                  onClick={handleDownload}
                  className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded transition-colors"
                  title="Download"
                >
                  <Download className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
                </button>
                <button
                  className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded transition-colors"
                  title="Fullscreen"
                >
                  <Maximize2 className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
                </button>
              </div>
            </div>
          ) : (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="aspect-square bg-zinc-100 dark:bg-zinc-950 border-2 border-dashed border-zinc-300 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-500 rounded-lg flex flex-col items-center justify-center cursor-pointer transition-colors"
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
        </div>
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
