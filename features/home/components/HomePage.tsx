'use client';

import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';

import { HomeSidebar } from './HomeSidebar';
import { MobileHeader } from './MobileHeader';
import { HomeContent } from './HomeContent';

export function HomePage() {
  return (
    <SidebarProvider
      defaultOpen={false}
      style={{
        '--sidebar-width': '64px',
        '--sidebar-width-icon': '64px',
      } as React.CSSProperties}
    >
      <HomeSidebar />
      <SidebarInset className="bg-background">
        <MobileHeader />
        <HomeContent />
      </SidebarInset>
    </SidebarProvider>
  );
}
