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
      className="group cursor-pointer border-0 bg-transparent shadow-none transition-colors"
      onClick={onOpen}
    >
      <div>
        <div className="relative overflow-hidden rounded-lg">
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

      <CardContent className="mt-2 p-0">
        <h3 className="truncate text-sm font-medium">{project.title}</h3>
        <p className="mt-0 text-xs text-muted-foreground">
          {formatRelativeTime(project.updatedAt)}
        </p>
      </CardContent>
    </Card>
  );
}
