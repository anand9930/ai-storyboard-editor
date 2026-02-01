import { HeroSection } from './HeroSection';
import { LogoMarquee } from './LogoMarquee';
import { MasonryGallery } from '@/components/ui/masonry-gallery';
import { galleryImages } from '../data/gallery';

export function HomeContent() {
  return (
    <main className="flex-1 overflow-auto">
      <HeroSection />
      <LogoMarquee />
      <MasonryGallery items={galleryImages} />
    </main>
  );
}
