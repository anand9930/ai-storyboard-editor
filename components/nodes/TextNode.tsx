'use client';

import { useState, memo, useCallback } from 'react';
import { NodeProps } from '@xyflow/react';
import { Editor } from '@tiptap/react';
import { Pencil, ImageIcon, LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { BaseNode } from './BaseNode';
import { NODE_ACTIONS, PLACEHOLDER_IMAGE } from '@/types/nodes';
import type { TextNode as TextNodeType, TextNodeData } from '@/types/nodes';
import { defaultEdgeOptions } from '@/lib/flowConfig';
import { useWorkflowStore } from '@/store/workflowStore';
import { GenerateFromNodePopup } from '../ui/GenerateFromNodePopup';
import { RichTextEditor } from '../ui/RichTextEditor';
import { TextFormattingToolbar } from '../ui/TextFormattingToolbar';
import { FullScreenEditorModal } from '../ui/FullScreenEditorModal';

const iconMap: Record<string, LucideIcon> = {
  Pencil,
  ImageIcon,
};

function TextNodeComponent({ data, id, selected }: NodeProps<TextNodeType>) {
  // data is now properly typed as TextNodeData
  const nodeData = data as TextNodeData;
  const { updateNodeData, setSelectedNodeIds, addNode, addEdge, nodes } = useWorkflowStore();
  const [popupSide, setPopupSide] = useState<'left' | 'right' | null>(null);
  const [editor, setEditor] = useState<Editor | null>(null);
  const [showFullScreen, setShowFullScreen] = useState(false);

  // Create a source node with placeholder image and connect it to this text node
  const createSourceNodeWithConnection = useCallback(() => {
    const currentNode = nodes.find((n) => n.id === id);
    if (!currentNode) return;

    const sourceNodeId = `source-${Date.now()}`;
    const newPosition = {
      x: currentNode.position.x - 400,
      y: currentNode.position.y,
    };

    // Create SourceNode with placeholder image
    addNode({
      id: sourceNodeId,
      type: 'source',
      position: newPosition,
      data: {
        name: 'Source',
        image: {
          id: `placeholder-${Date.now()}`,
          url: PLACEHOLDER_IMAGE.url,
          metadata: PLACEHOLDER_IMAGE.metadata,
        },
      },
    });

    // Create edge: SourceNode → TextNode
    addEdge({
      id: `edge-${sourceNodeId}-${id}`,
      source: sourceNodeId,
      target: id,
      sourceHandle: 'image',
      targetHandle: 'any',
      ...defaultEdgeOptions,
    });
  }, [id, nodes, addNode, addEdge]);

  // Handle action click - sets the action but doesn't start editing yet
  const handleActionClick = (action: 'write' | 'prompt_from_image') => {
    if (action === 'prompt_from_image') {
      // Create SourceNode with placeholder image
      createSourceNodeWithConnection();
    }
    // Just set the action - user needs to double-click to start editing
    updateNodeData(id, { selectedAction: action });
    setSelectedNodeIds([id]);
  };

  // Handle double-click to enter editing mode
  const handleDoubleClick = useCallback(() => {
    if (nodeData.selectedAction && !nodeData.content) {
      // Enter editing mode with empty content
      updateNodeData(id, { content: '<p></p>' });
    }
  }, [id, nodeData.selectedAction, nodeData.content, updateNodeData]);

  // Handle name change
  const handleNameChange = useCallback((newName: string) => {
    updateNodeData(id, { name: newName });
  }, [id, updateNodeData]);

  const handleContentChange = useCallback((newContent: string) => {
    updateNodeData(id, { content: newContent });
  }, [id, updateNodeData]);

  const handleEditorReady = useCallback((editorInstance: Editor) => {
    setEditor(editorInstance);
  }, []);

  const handleCopy = useCallback(() => {
    if (editor) {
      const text = editor.getText();
      navigator.clipboard.writeText(text);
    }
  }, [editor]);

  const handleFullScreenClose = useCallback((newContent: string) => {
    updateNodeData(id, { content: newContent });
    setShowFullScreen(false);
  }, [id, updateNodeData]);

  // Toolbar content for when we have content and an editor
  const toolbarContent = nodeData.content && editor ? (
    <TextFormattingToolbar
      editor={editor}
      onCopy={handleCopy}
      onFullScreen={() => setShowFullScreen(true)}
    />
  ) : null;

  return (
    <>
      <BaseNode
        id={id}
        handles={{ inputs: ['any'], outputs: ['text'] }}
        selected={selected}
        status={nodeData.status}
        onPlusClick={(side) => setPopupSide(side)}
        toolbarContent={toolbarContent}
        nodeName={nodeData.name}
        onNameChange={handleNameChange}
        noPadding={true}
      >
        <div className={cn("h-full flex flex-col p-2", !nodeData.content && !nodeData.selectedAction && "justify-center")}>
          {/* Action Options - only show when no action selected and no content */}
          {!nodeData.content && !nodeData.selectedAction && (
            <div className="space-y-2 flex-shrink-0">
              <span className="text-xs text-zinc-500">Try to:</span>
              {NODE_ACTIONS.text.map((action) => {
                const Icon = iconMap[action.icon] || Pencil;
                return (
                  <button
                    key={action.id}
                    onClick={() =>
                      handleActionClick(action.id as 'write' | 'prompt_from_image')
                    }
                    className={cn(
                      'w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-left transition-colors',
                      'hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{action.label}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Ready-to-edit state - show after action selected but before editing */}
          {!nodeData.content && nodeData.selectedAction && (
            <div
              onDoubleClick={handleDoubleClick}
              className="h-full flex items-center justify-center cursor-pointer"
            >
              <span className="text-sm text-zinc-500 dark:text-zinc-400">
                Double-click to start editing...
              </span>
            </div>
          )}

          {/* Rich Text Editor - show when content exists */}
          {nodeData.content && (
            <div className="flex-1 overflow-y-auto">
              <RichTextEditor
                content={nodeData.content}
                onChange={handleContentChange}
                onEditorReady={handleEditorReady}
              />
            </div>
          )}

          {/* Error Display */}
          {nodeData.error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-sm text-red-400 flex-shrink-0 mt-2">
              {nodeData.error}
            </div>
          )}
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

      {/* Full Screen Modal */}
      {showFullScreen && nodeData.content && (
        <FullScreenEditorModal
          content={nodeData.content}
          onClose={handleFullScreenClose}
        />
      )}
    </>
  );
}

export const TextNode = memo(TextNodeComponent);
