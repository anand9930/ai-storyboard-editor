import { HeroSection } from './HeroSection';
import { LogoMarquee } from './LogoMarquee';
import { MasonryGallery } from './MasonryGallery';

export function HomeContent() {
  return (
    <main className="flex-1 overflow-auto">
      <HeroSection />
      <LogoMarquee />
      <MasonryGallery />
    </main>
  );
}
