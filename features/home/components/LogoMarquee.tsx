'use client';

import Image from 'next/image';
import { techLogos } from '../data/logos';

export function LogoMarquee() {
  // Duplicate logos for seamless infinite scroll
  const duplicatedLogos = [...techLogos, ...techLogos];

  return (
    <div className="border-t py-8 overflow-hidden">
      <p className="text-center text-sm text-muted-foreground mb-6">
        Access 1000+ AI models with a single subscription
      </p>

      <div className="relative">
        <div className="flex animate-marquee gap-12 items-center">
          {duplicatedLogos.map((logo, index) => (
            <div
              key={`${logo.name}-${index}`}
              className="flex-shrink-0 flex items-center justify-center h-8 grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all"
            >
              {logo.src.endsWith('.svg') ? (
                <Image
                  src={logo.src}
                  alt={logo.name}
                  width={120}
                  height={32}
                  className="h-6 w-auto object-contain"
                />
              ) : (
                <span className="text-lg font-semibold text-muted-foreground">
                  {logo.name}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
