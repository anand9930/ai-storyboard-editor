'use client';

import { Editor } from '@tiptap/react';
import {
  List,
  ListOrdered,
  Minus,
  Copy,
  Maximize2,
  Pilcrow,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface TextFormattingToolbarProps {
  editor: Editor | null;
  onCopy: () => void;
  onFullScreen: () => void;
}

export function TextFormattingToolbar({ editor, onCopy, onFullScreen }: TextFormattingToolbarProps) {
  if (!editor) {
    return null;
  }

  return (
    <div className="flex items-center gap-0.5">
      {/* Headings */}
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={cn(
          'px-1 py-0.5 text-xs font-semibold rounded transition-colors',
          editor.isActive('heading', { level: 1 })
            ? 'bg-interactive-active text-theme-text-primary'
            : 'hover:bg-interactive-hover text-theme-text-secondary'
        )}
        title="Heading 1"
      >
        H1
      </button>
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={cn(
          'px-1 py-0.5 text-xs font-semibold rounded transition-colors',
          editor.isActive('heading', { level: 2 })
            ? 'bg-interactive-active text-theme-text-primary'
            : 'hover:bg-interactive-hover text-theme-text-secondary'
        )}
        title="Heading 2"
      >
        H2
      </button>
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        className={cn(
          'px-1 py-0.5 text-xs font-semibold rounded transition-colors',
          editor.isActive('heading', { level: 3 })
            ? 'bg-interactive-active text-theme-text-primary'
            : 'hover:bg-interactive-hover text-theme-text-secondary'
        )}
        title="Heading 3"
      >
        H3
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

      <div className="w-px h-5 bg-interactive-active mx-0.5" />

      {/* Text Formatting */}
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={cn(
          'p-1.5 rounded transition-colors font-bold text-xs',
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
          'p-1.5 rounded transition-colors italic text-xs',
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

      <div className="w-px h-5 bg-interactive-active mx-0.5" />

      {/* Actions */}
      <button
        onClick={onCopy}
        className="p-1.5 hover:bg-interactive-hover rounded transition-colors text-theme-text-secondary"
        title="Copy"
      >
        <Copy className="w-3.5 h-3.5" />
      </button>
      <button
        onClick={onFullScreen}
        className="p-1.5 hover:bg-interactive-hover rounded transition-colors text-theme-text-secondary"
        title="Full Screen"
      >
        <Maximize2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
