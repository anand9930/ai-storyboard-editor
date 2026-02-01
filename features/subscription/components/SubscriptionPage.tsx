'use client';

import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { HomeSidebar } from '@/features/home/components/HomeSidebar';
import { MobileHeader } from '@/features/home/components/MobileHeader';

import { SubscriptionContent } from './SubscriptionContent';

export function SubscriptionPage() {
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
        <SubscriptionContent />
      </SidebarInset>
    </SidebarProvider>
  );
}
