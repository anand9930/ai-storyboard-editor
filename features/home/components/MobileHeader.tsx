'use client';

import { Sparkles } from 'lucide-react';
import Link from 'next/link';

import { SidebarTrigger } from '@/components/ui/sidebar';

export function MobileHeader() {
  return (
    <header className="flex md:hidden h-14 shrink-0 items-center gap-3 border-b px-4 bg-background">
      <SidebarTrigger className="-ml-1" />
      <Link href="/" className="flex items-center gap-2">
        <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Sparkles className="size-4" />
        </div>
        <span className="font-semibold">AI Storyboard</span>
      </Link>
    </header>
  );
}
