import Image from 'next/image';
import type { GalleryImage } from '../types';

const galleryImages: GalleryImage[] = [
  { src: '/gallery/image-1.jpg', alt: 'AI generated artwork 1', width: 400, height: 300 },
  { src: '/gallery/image-2.jpg', alt: 'AI generated artwork 2', width: 400, height: 500 },
  { src: '/gallery/image-3.jpg', alt: 'AI generated artwork 3', width: 400, height: 350 },
];

export function MasonryGallery() {
  return (
    <section className="py-8 px-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-6xl mx-auto">
        {galleryImages.map((image, index) => (
          <div
            key={index}
            className="relative overflow-hidden rounded-xl bg-muted aspect-video"
          >
            <Image
              src={image.src}
              alt={image.alt}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 33vw"
              onError={(e) => {
                // Hide image on error, show placeholder
                e.currentTarget.style.display = 'none';
              }}
            />
            {/* Placeholder shown when no image */}
            <div className="absolute inset-0 bg-gradient-to-br from-muted to-muted/50" />
          </div>
        ))}
      </div>
    </section>
  );
}
