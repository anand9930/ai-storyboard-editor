import type { LucideIcon } from 'lucide-react';
import type { GalleryItem } from '@/components/ui/masonry-gallery';

export interface NavItem {
  title: string;
  icon: LucideIcon;
  href: string;
}

export interface NavGroup {
  items: NavItem[];
}

export interface LogoItem {
  name: string;
  src: string;
  href?: string;
}

// Extended gallery item with workflow reference
export interface HomeGalleryItem extends GalleryItem {
  workflowId: string;
}
