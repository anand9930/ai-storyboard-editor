'use client';

import { Plus } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface NewProjectCardProps {
  onClick: () => void;
}

export function NewProjectCard({ onClick }: NewProjectCardProps) {
  return (
    <Card
      className="flex h-full cursor-pointer flex-col items-center justify-center gap-2 border-0 bg-muted shadow-none"
      onClick={onClick}
    >
      <div className="flex size-12 items-center justify-center rounded-full bg-background">
        <Plus className="size-6 text-muted-foreground" />
      </div>
      <span className="text-sm font-medium text-muted-foreground">
        New Project
      </span>
    </Card>
  );
}
