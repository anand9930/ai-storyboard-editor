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
import { Toggle } from '@/components/ui/toggle';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

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
    <TooltipProvider delayDuration={300}>
      <div className="flex items-center gap-0.5">
        {/* Headings */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Toggle
              size="sm"
              pressed={editor.isActive('heading', { level: 1 })}
              onPressedChange={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
              className="h-7 px-1.5 text-xs font-semibold"
            >
              H1
            </Toggle>
          </TooltipTrigger>
          <TooltipContent>Heading 1</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Toggle
              size="sm"
              pressed={editor.isActive('heading', { level: 2 })}
              onPressedChange={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
              className="h-7 px-1.5 text-xs font-semibold"
            >
              H2
            </Toggle>
          </TooltipTrigger>
          <TooltipContent>Heading 2</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Toggle
              size="sm"
              pressed={editor.isActive('heading', { level: 3 })}
              onPressedChange={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
              className="h-7 px-1.5 text-xs font-semibold"
            >
              H3
            </Toggle>
          </TooltipTrigger>
          <TooltipContent>Heading 3</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Toggle
              size="sm"
              pressed={editor.isActive('paragraph') && !editor.isActive('heading')}
              onPressedChange={() => editor.chain().focus().setParagraph().run()}
            >
              <Pilcrow className="h-3.5 w-3.5" />
            </Toggle>
          </TooltipTrigger>
          <TooltipContent>Paragraph</TooltipContent>
        </Tooltip>

        <Separator orientation="vertical" className="mx-0.5 h-5" />

        {/* Text Formatting */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Toggle
              size="sm"
              pressed={editor.isActive('bold')}
              onPressedChange={() => editor.chain().focus().toggleBold().run()}
              className="h-7 px-1.5 text-xs font-bold"
            >
              B
            </Toggle>
          </TooltipTrigger>
          <TooltipContent>Bold</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Toggle
              size="sm"
              pressed={editor.isActive('italic')}
              onPressedChange={() => editor.chain().focus().toggleItalic().run()}
              className="h-7 px-1.5 text-xs italic"
            >
              I
            </Toggle>
          </TooltipTrigger>
          <TooltipContent>Italic</TooltipContent>
        </Tooltip>

        {/* Lists */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Toggle
              size="sm"
              pressed={editor.isActive('bulletList')}
              onPressedChange={() => editor.chain().focus().toggleBulletList().run()}
            >
              <List className="h-3.5 w-3.5" />
            </Toggle>
          </TooltipTrigger>
          <TooltipContent>Bullet List</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Toggle
              size="sm"
              pressed={editor.isActive('orderedList')}
              onPressedChange={() => editor.chain().focus().toggleOrderedList().run()}
            >
              <ListOrdered className="h-3.5 w-3.5" />
            </Toggle>
          </TooltipTrigger>
          <TooltipContent>Numbered List</TooltipContent>
        </Tooltip>

        {/* Horizontal Rule */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().setHorizontalRule().run()}
              className="h-7 w-7 p-0"
            >
              <Minus className="h-3.5 w-3.5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Horizontal Rule</TooltipContent>
        </Tooltip>

        <Separator orientation="vertical" className="mx-0.5 h-5" />

        {/* Actions */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={onCopy}
              className="h-7 w-7 p-0"
            >
              <Copy className="h-3.5 w-3.5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Copy</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={onFullScreen}
              className="h-7 w-7 p-0"
            >
              <Maximize2 className="h-3.5 w-3.5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Full Screen</TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}
