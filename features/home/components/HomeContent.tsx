'use client';

import { useState, useCallback } from 'react';
import { HeroSection } from './HeroSection';
import { LogoMarquee } from './LogoMarquee';
import { MasonryGallery } from '@/components/ui/masonry-gallery';
import { WorkflowViewer, mockWorkflows } from '@/features/workflow-viewer';
import type { WorkflowData } from '@/features/workflow-viewer';
import { galleryImages } from '../data/gallery';
import type { HomeGalleryItem } from '../types';

export function HomeContent() {
  const [selectedWorkflow, setSelectedWorkflow] = useState<WorkflowData | null>(null);

  // Handle gallery image click - show workflow viewer
  const handleImageClick = useCallback((item: HomeGalleryItem) => {
    const workflow = mockWorkflows[item.workflowId];
    if (workflow) {
      setSelectedWorkflow(workflow);
    }
  }, []);

  // Handle viewer close - return to home content
  const handleCloseViewer = useCallback(() => {
    setSelectedWorkflow(null);
  }, []);

  // Handle clone action (mock for now)
  const handleClone = useCallback((workflowId: string) => {
    console.log('Clone workflow:', workflowId);
    // TODO: Implement actual clone functionality
  }, []);

  // If a workflow is selected, show the viewer instead of home content
  if (selectedWorkflow) {
    return (
      <WorkflowViewer
        workflow={selectedWorkflow}
        onClose={handleCloseViewer}
        onClone={handleClone}
      />
    );
  }

  // Otherwise show the normal Home content
  return (
    <main className="flex-1 overflow-auto">
      <HeroSection />
      <LogoMarquee />
      <MasonryGallery items={galleryImages} onItemClick={handleImageClick} />
    </main>
  );
}
