import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="text-center space-y-6">
        <h1 className="text-4xl font-bold text-foreground">
          AI Storyboard Editor
        </h1>
        <p className="text-lg text-muted-foreground max-w-md">
          Visual workflow editor for AI content generation
        </p>
        <Button asChild size="lg">
          <Link href="/flow">Open Editor</Link>
        </Button>
      </div>
    </main>
  );
}
