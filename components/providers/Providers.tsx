'use client';

import { ReactFlowProvider } from '@xyflow/react';
import { ReactNode } from 'react';
import { TooltipProvider } from '@radix-ui/react-tooltip';
import { FlowContextMenuProvider } from '@/features/flow/components/context-menus';

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ReactFlowProvider>
      <TooltipProvider delayDuration={300}>
        <FlowContextMenuProvider>
          {children}
        </FlowContextMenuProvider>
      </TooltipProvider>
    </ReactFlowProvider>
  );
}
