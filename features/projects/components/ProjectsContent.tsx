'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';

import { ProjectsHeader } from './ProjectsHeader';
import { ProjectsGrid } from './ProjectsGrid';
import { RenameProjectDialog } from './RenameProjectDialog';
import { DeleteProjectDialog } from './DeleteProjectDialog';
import { mockProjects } from '../data/mockProjects';
import type { Project } from '../types';

export function ProjectsContent() {
  const router = useRouter();

  const [projects, setProjects] = useState<Project[]>(mockProjects);
  const [searchQuery, setSearchQuery] = useState('');
  const [renameDialog, setRenameDialog] = useState<{
    open: boolean;
    project: Project | null;
  }>({
    open: false,
    project: null,
  });
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    project: Project | null;
  }>({
    open: false,
    project: null,
  });

  const filteredProjects = useMemo(() => {
    if (!searchQuery.trim()) return projects;
    const query = searchQuery.toLowerCase();
    return projects.filter((p) => p.title.toLowerCase().includes(query));
  }, [projects, searchQuery]);

  const handleNewProject = () => {
    router.push('/flow');
  };

  const handleOpenProject = (id: string) => {
    router.push('/flow');
  };

  const handleRename = (id: string, newTitle: string) => {
    setProjects((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, title: newTitle, updatedAt: new Date() } : p
      )
    );
    setRenameDialog({ open: false, project: null });
  };

  const handleDelete = (id: string) => {
    setProjects((prev) => prev.filter((p) => p.id !== id));
    setDeleteDialog({ open: false, project: null });
  };

  return (
    <main className="flex-1 overflow-auto">
      <div className="px-lg py-xl">
        <div className="mx-auto max-w-gallery">
          <ProjectsHeader
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onNewProject={handleNewProject}
          />
          <ProjectsGrid
            projects={filteredProjects}
            onNewProject={handleNewProject}
            onOpenProject={handleOpenProject}
            onRenameProject={(project) =>
              setRenameDialog({ open: true, project })
            }
            onDeleteProject={(project) =>
              setDeleteDialog({ open: true, project })
            }
          />
        </div>
      </div>

      <RenameProjectDialog
        open={renameDialog.open}
        project={renameDialog.project}
        onOpenChange={(open) =>
          !open && setRenameDialog({ open: false, project: null })
        }
        onRename={handleRename}
      />
      <DeleteProjectDialog
        open={deleteDialog.open}
        project={deleteDialog.project}
        onOpenChange={(open) =>
          !open && setDeleteDialog({ open: false, project: null })
        }
        onDelete={handleDelete}
      />
    </main>
  );
}
