'use client';

import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { HomeSidebar } from '@/features/home/components/HomeSidebar';
import { MobileHeader } from '@/features/home/components/MobileHeader';

import { ProjectsContent } from './ProjectsContent';

export function ProjectsPage() {
  return (
    <SidebarProvider
      defaultOpen={false}
      style={
        {
          '--sidebar-width': '64px',
          '--sidebar-width-icon': '64px',
        } as React.CSSProperties
      }
    >
      <HomeSidebar />
      <SidebarInset className="bg-background">
        <MobileHeader />
        <ProjectsContent />
      </SidebarInset>
    </SidebarProvider>
  );
}
