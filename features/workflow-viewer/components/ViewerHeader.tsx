'use client';

import { ArrowLeft, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { WorkflowAuthor } from '../types';

interface ViewerHeaderProps {
  projectName: string;
  author: WorkflowAuthor;
  onBack: () => void;
  onClone: () => void;
}

export function ViewerHeader({ projectName, author, onBack, onClone }: ViewerHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      {/* Left: Back button + Title */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          className="h-9 w-9"
        >
          <ArrowLeft className="h-5 w-5" />
          <span className="sr-only">Back</span>
        </Button>
        <div>
          <h1 className="text-base font-semibold">{projectName}</h1>
          <p className="text-xs text-muted-foreground">by {author.name}</p>
        </div>
      </div>

      {/* Right: Clone button */}
      <Button onClick={onClone} size="sm">
        <Copy className="h-4 w-4 mr-2" />
        Clone to My Projects
      </Button>
    </div>
  );
}
