'use client';

import { useState, useCallback } from 'react';
import { Video } from 'lucide-react';

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MasonryGallery } from '@/components/ui/masonry-gallery';
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from '@/components/ui/empty';
import { WorkflowViewer, mockWorkflows } from '@/features/workflow-viewer';
import type { WorkflowData } from '@/features/workflow-viewer';

import { exploreGalleryImages } from '../data/gallery';
import type { ExploreTab, ExploreGalleryItem } from '../types';

export function ExploreContent() {
  const [activeTab, setActiveTab] = useState<ExploreTab>('images');
  const [selectedWorkflow, setSelectedWorkflow] = useState<WorkflowData | null>(null);

  // Handle gallery image click - show workflow viewer
  const handleImageClick = useCallback((item: ExploreGalleryItem) => {
    const workflow = mockWorkflows[item.workflowId];
    if (workflow) {
      setSelectedWorkflow(workflow);
    }
  }, []);

  // Handle viewer close - return to gallery
  const handleCloseViewer = useCallback(() => {
    setSelectedWorkflow(null);
  }, []);

  // Handle clone action (mock for now)
  const handleClone = useCallback((workflowId: string) => {
    console.log('Clone workflow:', workflowId);
    // TODO: Implement actual clone functionality
    // 1. Copy workflow to user's projects
    // 2. Navigate to editor with the new project
  }, []);

  // If a workflow is selected, show the viewer instead of gallery
  if (selectedWorkflow) {
    return (
      <WorkflowViewer
        workflow={selectedWorkflow}
        onClose={handleCloseViewer}
        onClone={handleClone}
      />
    );
  }

  // Otherwise show the normal gallery content
  return (
    <main className="flex-1 overflow-auto">
      <div className="py-6 px-4">
        {/* Tabs */}
        <div className="max-w-gallery mx-auto">
          <div className="flex items-center justify-end">
            <Tabs
              value={activeTab}
              onValueChange={(v) => setActiveTab(v as ExploreTab)}
            >
              <TabsList>
                <TabsTrigger value="images">Images</TabsTrigger>
                <TabsTrigger value="videos">Videos</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'images' ? (
          <MasonryGallery
            items={exploreGalleryImages}
            className="px-0"
            onItemClick={handleImageClick}
          />
        ) : (
          <div className="max-w-gallery mx-auto">
            <Empty className="min-h-[400px]">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <Video />
                </EmptyMedia>
                <EmptyTitle>Videos coming soon</EmptyTitle>
                <EmptyDescription>
                  We&apos;re working on bringing video content to Explore. Check back later!
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          </div>
        )}
      </div>
    </main>
  );
}
