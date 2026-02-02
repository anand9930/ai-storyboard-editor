import type { GalleryItem } from '@/components/ui/masonry-gallery';

export type { GalleryItem } from '@/components/ui/masonry-gallery';

export type ExploreTab = 'images' | 'videos';

// Extended gallery item with workflow reference
export interface ExploreGalleryItem extends GalleryItem {
  workflowId: string;
}
