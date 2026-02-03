'use client';

import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface ProjectsHeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onNewProject: () => void;
}

export function ProjectsHeader({
  searchQuery,
  onSearchChange,
  onNewProject,
}: ProjectsHeaderProps) {
  return (
    <div className="flex items-center justify-between gap-4 pb-4">
      <div className="relative w-full max-w-sm">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search projects..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9 shadow-none"
        />
      </div>

      <Button onClick={onNewProject}>New Project</Button>
    </div>
  );
}
