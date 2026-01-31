import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function HeroSection() {
  return (
    <section className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4 py-16">
      <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
        Your ideas{' '}
        <em className="font-serif font-normal italic">to</em>
        <br />
        extraordinary content
      </h1>

      <p className="mt-6 text-lg text-muted-foreground max-w-xl">
        Go from concept to production in minutes with AI Storyboard,
        the visual creation platform for AI video, audio, and imagery.
      </p>

      <p className="mt-10 text-sm text-muted-foreground">
        10k+ AI creators have already joined the movement
      </p>

      <Button asChild size="lg" className="mt-4 px-8">
        <Link href="/flow">Join the community</Link>
      </Button>
    </section>
  );
}
