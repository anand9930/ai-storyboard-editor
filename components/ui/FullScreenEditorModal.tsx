'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import { useState, useEffect, useCallback } from 'react';
import {
  List,
  ListOrdered,
  Minus,
  Copy,
  X,
  Pilcrow,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { createPortal } from 'react-dom';

interface FullScreenEditorModalProps {
  content: string;
  onClose: (content: string) => void;
}

const COLORS = [
  '#ffffff',
  '#ef4444',
  '#f97316',
  '#eab308',
  '#22c55e',
  '#3b82f6',
  '#8b5cf6',
  '#ec4899',
];

export function FullScreenEditorModal({ content, onClose }: FullScreenEditorModalProps) {
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [mounted, setMounted] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      TextStyle,
      Color,
    ],
    content,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: 'prose prose-lg prose-invert max-w-none focus:outline-none min-h-[400px] p-6',
      },
    },
  });

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  const handleCopy = useCallback(() => {
    if (editor) {
      const text = editor.getText();
      navigator.clipboard.writeText(text);
    }
  }, [editor]);

  const handleClose = useCallback(() => {
    if (editor) {
      onClose(editor.getHTML());
    }
  }, [editor, onClose]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleClose]);

  if (!editor || !mounted) {
    return null;
  }

  const modalContent = (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-4xl max-h-[90vh] m-4 bg-surface-primary border border-node rounded-xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header with Toolbar */}
        <div className="flex items-center justify-between p-4 border-b border-node">
          <div className="flex items-center gap-0.5 bg-surface-secondary border border-node rounded-lg p-1">
            {/* Color Picker */}
            <div className="relative">
              <button
                onClick={() => setShowColorPicker(!showColorPicker)}
                className="p-1.5 hover:bg-interactive-hover rounded transition-colors"
                title="Text Color"
              >
                <div
                  className="w-4 h-4 rounded-full border border-node"
                  style={{ backgroundColor: editor.getAttributes('textStyle').color || '#ffffff' }}
                />
              </button>
              {showColorPicker && (
                <div className="absolute top-full left-0 mt-1 p-2 bg-surface-secondary border border-node rounded-lg shadow-xl z-50 grid grid-cols-4 gap-1">
                  {COLORS.map((color) => (
                    <button
                      key={color}
                      onClick={() => {
                        editor.chain().focus().setColor(color).run();
                        setShowColorPicker(false);
                      }}
                      className="w-6 h-6 rounded-full border border-node hover:scale-110 transition-transform"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              )}
            </div>

            <div className="w-px h-5 bg-interactive-active mx-1" />

            {/* Headings */}
            <button
              onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
              className={cn(
                'px-1.5 py-1 text-xs font-medium rounded transition-colors',
                editor.isActive('heading', { level: 1 })
                  ? 'bg-interactive-active text-theme-text-primary'
                  : 'hover:bg-interactive-hover text-theme-text-secondary'
              )}
              title="Heading 1"
            >
              H<sub>1</sub>
            </button>
            <button
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
              className={cn(
                'px-1.5 py-1 text-xs font-medium rounded transition-colors',
                editor.isActive('heading', { level: 2 })
                  ? 'bg-interactive-active text-theme-text-primary'
                  : 'hover:bg-interactive-hover text-theme-text-secondary'
              )}
              title="Heading 2"
            >
              H<sub>2</sub>
            </button>
            <button
              onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
              className={cn(
                'px-1.5 py-1 text-xs font-medium rounded transition-colors',
                editor.isActive('heading', { level: 3 })
                  ? 'bg-interactive-active text-theme-text-primary'
                  : 'hover:bg-interactive-hover text-theme-text-secondary'
              )}
              title="Heading 3"
            >
              H<sub>3</sub>
            </button>

            <button
              onClick={() => editor.chain().focus().setParagraph().run()}
              className={cn(
                'p-1.5 rounded transition-colors',
                editor.isActive('paragraph') && !editor.isActive('heading')
                  ? 'bg-interactive-active text-theme-text-primary'
                  : 'hover:bg-interactive-hover text-theme-text-secondary'
              )}
              title="Paragraph"
            >
              <Pilcrow className="w-3.5 h-3.5" />
            </button>

            <div className="w-px h-5 bg-interactive-active mx-1" />

            {/* Text Formatting */}
            <button
              onClick={() => editor.chain().focus().toggleBold().run()}
              className={cn(
                'p-1.5 rounded transition-colors font-bold text-sm',
                editor.isActive('bold')
                  ? 'bg-interactive-active text-theme-text-primary'
                  : 'hover:bg-interactive-hover text-theme-text-secondary'
              )}
              title="Bold"
            >
              B
            </button>
            <button
              onClick={() => editor.chain().focus().toggleItalic().run()}
              className={cn(
                'p-1.5 rounded transition-colors italic text-sm',
                editor.isActive('italic')
                  ? 'bg-interactive-active text-theme-text-primary'
                  : 'hover:bg-interactive-hover text-theme-text-secondary'
              )}
              title="Italic"
            >
              I
            </button>

            {/* Lists */}
            <button
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              className={cn(
                'p-1.5 rounded transition-colors',
                editor.isActive('bulletList')
                  ? 'bg-interactive-active text-theme-text-primary'
                  : 'hover:bg-interactive-hover text-theme-text-secondary'
              )}
              title="Bullet List"
            >
              <List className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              className={cn(
                'p-1.5 rounded transition-colors',
                editor.isActive('orderedList')
                  ? 'bg-interactive-active text-theme-text-primary'
                  : 'hover:bg-interactive-hover text-theme-text-secondary'
              )}
              title="Numbered List"
            >
              <ListOrdered className="w-3.5 h-3.5" />
            </button>

            {/* Horizontal Rule */}
            <button
              onClick={() => editor.chain().focus().setHorizontalRule().run()}
              className="p-1.5 hover:bg-interactive-hover rounded transition-colors text-theme-text-secondary"
              title="Horizontal Rule"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>

            <div className="w-px h-5 bg-interactive-active mx-1" />

            {/* Copy */}
            <button
              onClick={handleCopy}
              className="p-1.5 hover:bg-interactive-hover rounded transition-colors text-theme-text-secondary"
              title="Copy"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Close Button */}
          <button
            onClick={handleClose}
            className="p-2 hover:bg-interactive-hover rounded-lg transition-colors text-theme-text-secondary hover:text-theme-text-primary"
            title="Close (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Editor Content */}
        <div className="flex-1 overflow-y-auto bg-background">
          <EditorContent editor={editor} />
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
