'use client';

import { useEffect } from 'react';
import { useWorkflowStore } from '@/features/flow/store/workflowStore';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { colorMode } = useWorkflowStore();

  useEffect(() => {
    document.documentElement.classList.toggle('dark', colorMode === 'dark');
  }, [colorMode]);

  return <>{children}</>;
}
