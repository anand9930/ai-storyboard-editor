'use client';

import { useRef } from 'react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import type { MasonryProps, RenderComponentProps } from 'masonic';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useResponsiveMasonry } from '@/hooks/useResponsiveMasonry';
import { cn } from '@/lib/utils';

// Exported type for gallery items
export interface GalleryItem {
  src: string;
  alt: string;
  width: number;
  height: number;
  author: {
    name: string;
  };
}

// Props interface
interface MasonryGalleryProps {
  items: GalleryItem[];
  className?: string;
}

// Dynamic import to avoid SSR issues with ResizeObserver
const Masonry = dynamic(
  () => import('masonic').then((mod) => mod.Masonry),
  { ssr: false }
) as <T>(props: MasonryProps<T>) => React.ReactElement;

// Helper to get initials from name
const getInitials = (name: string) =>
  name.split(' ').map(n => n[0]).join('').toUpperCase();

function GalleryCard({ data, width }: RenderComponentProps<GalleryItem>) {
  // Calculate height based on aspect ratio
  const aspectRatio = data.height / data.width;
  const height = Math.round(width * aspectRatio);

  return (
    <div
      className="group relative overflow-hidden bg-muted cursor-pointer"
      style={{ height }}
    >
      <Image
        src={data.src}
        alt={data.alt}
        fill
        className="object-cover"
        sizes="(max-width: 768px) 50vw, 33vw"
      />

      {/* Hover overlay */}
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300" />

      {/* Author info - bottom left */}
      <div className="absolute bottom-0 left-0 right-0 p-sm md:p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="flex items-center gap-xs md:gap-2">
          <Avatar className="h-5 w-5 md:h-8 md:w-8">
            <AvatarFallback className="text-[8px] md:text-xs">
              {getInitials(data.author.name)}
            </AvatarFallback>
          </Avatar>
          <span className="text-white text-[10px] md:text-sm font-normal truncate">{data.author.name}</span>
        </div>
      </div>
    </div>
  );
}

export function MasonryGallery({ items, className }: MasonryGalleryProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { columnWidth, columnCount, gutter } = useResponsiveMasonry(containerRef);

  return (
    <section className={cn("p-lg", className)}>
      <div className="max-w-gallery mx-auto" ref={containerRef}>
        <Masonry<GalleryItem>
          items={items}
          render={GalleryCard}
          columnWidth={columnWidth}
          columnGutter={gutter}
          rowGutter={gutter}
          maxColumnCount={columnCount}
        />
      </div>
    </section>
  );
}
