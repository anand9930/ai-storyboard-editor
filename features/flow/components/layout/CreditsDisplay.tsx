'use client';

import { Coins } from 'lucide-react';
import { useWorkflowStore } from '@/features/flow/store/workflowStore';

export function CreditsDisplay() {
  const credits = useWorkflowStore((state) => state.credits);

  const formattedCredits = credits.toLocaleString();

  return (
    <div className="flex items-center gap-2 bg-card/95 backdrop-blur border rounded-xl px-3 py-2">
      <Coins className="w-4 h-4 text-yellow-500" />
      <span className="text-sm font-medium text-foreground">{formattedCredits}</span>
      <span className="text-xs text-muted-foreground">Credits</span>
    </div>
  );
}
