'use client';

import { useState } from 'react';
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

import { exploreGalleryImages } from '../data/gallery';
import type { ExploreTab } from '../types';

export function ExploreContent() {
  const [activeTab, setActiveTab] = useState<ExploreTab>('images');

  return (
    <main className="flex-1 overflow-auto">
      <div className="py-xl px-lg">
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
          <MasonryGallery items={exploreGalleryImages} className="px-0" />
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
