'use client';

import { NewProjectCard } from './NewProjectCard';
import { ProjectCard } from './ProjectCard';
import type { Project } from '../types';

interface ProjectsGridProps {
  projects: Project[];
  onNewProject: () => void;
  onOpenProject: (id: string) => void;
  onRenameProject: (project: Project) => void;
  onDeleteProject: (project: Project) => void;
}

export function ProjectsGrid({
  projects,
  onNewProject,
  onOpenProject,
  onRenameProject,
  onDeleteProject,
}: ProjectsGridProps) {
  return (
    <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4">
      <NewProjectCard onClick={onNewProject} />

      {projects.map((project) => (
        <ProjectCard
          key={project.id}
          project={project}
          onOpen={() => onOpenProject(project.id)}
          onRename={() => onRenameProject(project)}
          onDelete={() => onDeleteProject(project)}
        />
      ))}
    </div>
  );
}
