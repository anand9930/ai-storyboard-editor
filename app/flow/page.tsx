'use client';

import FlowCanvas from '@/features/flow/components/FlowCanvas';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';

export default function FlowPage() {
  return (
    <main className="h-screen w-full overflow-hidden bg-background">
      <ErrorBoundary>
        <FlowCanvas />
      </ErrorBoundary>
    </main>
  );
}
