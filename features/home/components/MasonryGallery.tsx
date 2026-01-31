'use client';

import { useRef } from 'react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import type { MasonryProps, RenderComponentProps } from 'masonic';
import { galleryImages } from '../data/gallery';
import { useResponsiveMasonry } from '../hooks/useResponsiveMasonry';
import type { GalleryImage } from '../types';

// Dynamic import to avoid SSR issues with ResizeObserver
const Masonry = dynamic(
  () => import('masonic').then((mod) => mod.Masonry),
  { ssr: false }
) as <T>(props: MasonryProps<T>) => React.ReactElement;

function GalleryCard({ data, width }: RenderComponentProps<GalleryImage>) {
  // Calculate height based on aspect ratio
  const aspectRatio = data.height / data.width;
  const height = Math.round(width * aspectRatio);

  return (
    <div
      className="relative overflow-hidden bg-muted"
      style={{ height }}
    >
      <Image
        src={data.src}
        alt={data.alt}
        fill
        className="object-cover"
        sizes="(max-width: 768px) 50vw, 25vw"
      />
    </div>
  );
}

export function MasonryGallery() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { columnWidth, columnCount, gutter } = useResponsiveMasonry(containerRef);

  return (
    <section className="py-xl px-lg">
      <div className="max-w-7xl mx-auto" ref={containerRef}>
        <Masonry<GalleryImage>
          items={galleryImages}
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
