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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Toggle } from '@/components/ui/toggle';
import { Separator } from '@/components/ui/separator';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

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
  const [open, setOpen] = useState(true);

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
    setOpen(false);
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

  if (!editor) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0 gap-0 overflow-hidden">
        {/* Header with Toolbar */}
        <DialogHeader className="p-4 border-b">
          <div className="flex items-center justify-between">
            <DialogTitle className="sr-only">Full Screen Editor</DialogTitle>
            <div className="flex items-center gap-0.5 rounded-md border bg-muted p-1">
              {/* Color Picker */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <div
                      className="h-4 w-4 rounded-full border"
                      style={{ backgroundColor: editor.getAttributes('textStyle').color || '#ffffff' }}
                    />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-2">
                  <div className="grid grid-cols-4 gap-1">
                    {COLORS.map((color) => (
                      <button
                        key={color}
                        onClick={() => {
                          editor.chain().focus().setColor(color).run();
                        }}
                        className="h-6 w-6 rounded-full border transition-transform hover:scale-110"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </PopoverContent>
              </Popover>

              <Separator orientation="vertical" className="mx-1 h-5" />

              {/* Headings */}
              <Toggle
                size="sm"
                pressed={editor.isActive('heading', { level: 1 })}
                onPressedChange={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                className="h-8 px-2 text-xs font-medium"
              >
                H<sub>1</sub>
              </Toggle>
              <Toggle
                size="sm"
                pressed={editor.isActive('heading', { level: 2 })}
                onPressedChange={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                className="h-8 px-2 text-xs font-medium"
              >
                H<sub>2</sub>
              </Toggle>
              <Toggle
                size="sm"
                pressed={editor.isActive('heading', { level: 3 })}
                onPressedChange={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                className="h-8 px-2 text-xs font-medium"
              >
                H<sub>3</sub>
              </Toggle>

              <Toggle
                size="sm"
                pressed={editor.isActive('paragraph') && !editor.isActive('heading')}
                onPressedChange={() => editor.chain().focus().setParagraph().run()}
              >
                <Pilcrow className="h-3.5 w-3.5" />
              </Toggle>

              <Separator orientation="vertical" className="mx-1 h-5" />

              {/* Text Formatting */}
              <Toggle
                size="sm"
                pressed={editor.isActive('bold')}
                onPressedChange={() => editor.chain().focus().toggleBold().run()}
                className="h-8 px-2 text-sm font-bold"
              >
                B
              </Toggle>
              <Toggle
                size="sm"
                pressed={editor.isActive('italic')}
                onPressedChange={() => editor.chain().focus().toggleItalic().run()}
                className="h-8 px-2 text-sm italic"
              >
                I
              </Toggle>

              {/* Lists */}
              <Toggle
                size="sm"
                pressed={editor.isActive('bulletList')}
                onPressedChange={() => editor.chain().focus().toggleBulletList().run()}
              >
                <List className="h-3.5 w-3.5" />
              </Toggle>
              <Toggle
                size="sm"
                pressed={editor.isActive('orderedList')}
                onPressedChange={() => editor.chain().focus().toggleOrderedList().run()}
              >
                <ListOrdered className="h-3.5 w-3.5" />
              </Toggle>

              {/* Horizontal Rule */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().setHorizontalRule().run()}
                className="h-8 w-8 p-0"
              >
                <Minus className="h-3.5 w-3.5" />
              </Button>

              <Separator orientation="vertical" className="mx-1 h-5" />

              {/* Copy */}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopy}
                className="h-8 w-8 p-0"
              >
                <Copy className="h-3.5 w-3.5" />
              </Button>
            </div>

            {/* Close Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClose}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close (Esc)</span>
            </Button>
          </div>
        </DialogHeader>

        {/* Editor Content */}
        <div className="flex-1 overflow-y-auto bg-background">
          <EditorContent editor={editor} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
