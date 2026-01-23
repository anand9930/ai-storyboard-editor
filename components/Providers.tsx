'use client';

import { ReactFlowProvider } from '@xyflow/react';
import { ReactNode } from 'react';
import { TooltipProvider } from '@radix-ui/react-tooltip';

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ReactFlowProvider>
      <TooltipProvider delayDuration={300}>
        {children}
      </TooltipProvider>
    </ReactFlowProvider>
  );
}
