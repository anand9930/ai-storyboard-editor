'use client';

import { useState, memo, useCallback } from 'react';
import { NodeProps } from '@xyflow/react';
import { Editor } from '@tiptap/react';
import { Pencil, ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { BaseNode } from './BaseNode';
import { TextNodeData, NODE_ACTIONS } from '@/types/nodes';
import { useWorkflowStore } from '@/store/workflowStore';
import { GenerateFromNodePopup } from '../ui/GenerateFromNodePopup';
import { RichTextEditor } from '../ui/RichTextEditor';
import { TextFormattingToolbar } from '../ui/TextFormattingToolbar';
import { FullScreenEditorModal } from '../ui/FullScreenEditorModal';

const iconMap: Record<string, any> = {
  Pencil,
  ImageIcon,
};

function TextNodeComponent({ data, id, selected }: NodeProps) {
  const nodeData = data as unknown as TextNodeData;
  const { updateNodeData, setSelectedNodeId } = useWorkflowStore();
  const [showGeneratePopup, setShowGeneratePopup] = useState(false);
  const [editor, setEditor] = useState<Editor | null>(null);
  const [showFullScreen, setShowFullScreen] = useState(false);

  // Handle action click
  const handleActionClick = (action: 'write' | 'prompt_from_image') => {
    updateNodeData(id, { selectedAction: action });
    setSelectedNodeId(id);
  };

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
        onPlusClick={() => setShowGeneratePopup(true)}
        toolbarContent={toolbarContent}
        nodeName={nodeData.name}
        onNameChange={handleNameChange}
      >
        <div className="space-y-3">
          {/* Action Options - only show when no content */}
          {!nodeData.content && (
            <div className="space-y-2">
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
                      nodeData.selectedAction === action.id
                        ? 'bg-zinc-200 dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100'
                        : 'hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{action.label}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Rich Text Editor - show when content exists */}
          {nodeData.content && (
            <RichTextEditor
              content={nodeData.content}
              onChange={handleContentChange}
              onEditorReady={handleEditorReady}
            />
          )}

          {/* Error Display */}
          {nodeData.error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-sm text-red-400">
              {nodeData.error}
            </div>
          )}
        </div>
      </BaseNode>

      {/* Generate from Node Popup */}
      {showGeneratePopup && (
        <GenerateFromNodePopup
          sourceNodeId={id}
          onClose={() => setShowGeneratePopup(false)}
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
