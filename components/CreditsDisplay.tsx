'use client';

import { Coins } from 'lucide-react';
import { useWorkflowStore } from '@/store/workflowStore';

export function CreditsDisplay() {
  const credits = useWorkflowStore((state) => state.credits);

  const formattedCredits = credits.toLocaleString();

  return (
    <div className="flex items-center gap-2 bg-surface-primary/95 backdrop-blur border border-node rounded-xl px-3 py-2">
      <Coins className="w-4 h-4 text-accent-yellow" />
      <span className="text-sm font-medium text-theme-text-primary">{formattedCredits}</span>
      <span className="text-xs text-theme-text-secondary">Credits</span>
    </div>
  );
}
