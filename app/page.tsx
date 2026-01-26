'use client';

import FlowCanvas from '@/components/FlowCanvas';
import { ErrorBoundary } from '@/components/ErrorBoundary';

export default function Home() {
  return (
    <main className="h-screen w-full overflow-hidden bg-zinc-950">
      <ErrorBoundary>
        <FlowCanvas />
      </ErrorBoundary>
    </main>
  );
}
