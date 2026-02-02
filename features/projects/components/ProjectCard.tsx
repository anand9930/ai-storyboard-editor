'use client';

import Image from 'next/image';
import { ImageIcon } from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { ProjectCardMenu } from './ProjectCardMenu';
import { formatRelativeTime } from '../data/mockProjects';
import type { Project } from '../types';

interface ProjectCardProps {
  project: Project;
  onOpen: () => void;
  onRename: () => void;
  onDelete: () => void;
}

export function ProjectCard({
  project,
  onOpen,
  onRename,
  onDelete,
}: ProjectCardProps) {
  return (
    <Card
      className="group cursor-pointer border border-border bg-transparent shadow-none transition-colors"
      onClick={onOpen}
    >
      <div className="p-sm">
        <div className="relative overflow-hidden rounded-lg border border-border">
          <AspectRatio ratio={4 / 3}>
            {project.thumbnailUrl ? (
              <Image
                src={project.thumbnailUrl}
                alt={project.title}
                fill
                className="object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center bg-muted">
                <ImageIcon className="size-8 text-muted-foreground" />
              </div>
            )}
          </AspectRatio>

          <div className="absolute right-1 top-1 opacity-0 transition-opacity group-hover:opacity-100">
            <ProjectCardMenu
              onOpen={onOpen}
              onRename={onRename}
              onDelete={onDelete}
            />
          </div>
        </div>
      </div>

      <CardContent className="px-md py-sm">
        <h3 className="truncate text-sm font-medium">{project.title}</h3>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {formatRelativeTime(project.updatedAt)}
        </p>
      </CardContent>
    </Card>
  );
}
