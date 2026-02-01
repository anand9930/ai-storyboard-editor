'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Sparkles, Sun, Moon, Settings } from 'lucide-react';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { useTheme } from '@/components/providers/ThemeProvider';

import { sidebarNavGroups } from '../data/navigation';

export function HomeSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  const { colorMode, setColorMode } = useTheme();
  const { isMobile } = useSidebar();

  const toggleTheme = () => {
    setColorMode(colorMode === 'dark' ? 'light' : 'dark');
  };

  return (
    <Sidebar
      collapsible="icon"
      className="border-r"
      {...props}
    >
      {/* Logo at top */}
      <SidebarHeader className={isMobile ? "!flex-row h-14 !px-5 !py-0 items-center border-b !gap-0" : "p-2"}>
        <SidebarMenu className={isMobile ? "" : "items-center"}>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              asChild
              className={isMobile ? "!h-8 !w-8 !p-0 justify-center" : "!h-10 !w-10 !p-0 justify-center"}
            >
              <Link href="/">
                <div className={`flex aspect-square ${isMobile ? "size-8" : "size-10"} items-center justify-center rounded-lg bg-primary text-primary-foreground`}>
                  <Sparkles className={isMobile ? "size-4" : "size-5"} />
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      {/* Main navigation icons */}
      <SidebarContent>
        {sidebarNavGroups.map((group, groupIndex) => (
          <React.Fragment key={groupIndex}>
            {groupIndex > 0 && (
              <Separator className="mx-auto w-8 my-2 bg-sidebar-border" />
            )}
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu className={isMobile ? "" : "items-center"}>
                  {group.items.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        isActive={pathname === item.href}
                        tooltip={item.title}
                        className={isMobile ? "justify-start gap-3 px-3" : "!h-10 !w-10 !p-0 justify-center"}
                      >
                        <Link href={item.href}>
                          <item.icon className="size-5 shrink-0" />
                          {isMobile && <span>{item.title}</span>}
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </React.Fragment>
        ))}
      </SidebarContent>

      {/* Footer with theme toggle, settings, and avatar */}
      <SidebarFooter className="p-2">
        <SidebarMenu className={isMobile ? "" : "items-center"}>
          {/* Theme toggle */}
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={toggleTheme}
              tooltip={colorMode === 'dark' ? 'Light Mode' : 'Dark Mode'}
              className={isMobile ? "justify-start gap-3 px-3" : "!h-10 !w-10 !p-0 justify-center"}
            >
              {colorMode === 'dark' ? (
                <Sun className="size-5 shrink-0" />
              ) : (
                <Moon className="size-5 shrink-0" />
              )}
              {isMobile && <span>{colorMode === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>}
            </SidebarMenuButton>
          </SidebarMenuItem>
          {/* Settings */}
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              tooltip="Settings"
              className={isMobile ? "justify-start gap-3 px-3" : "!h-10 !w-10 !p-0 justify-center"}
            >
              <Link href="/settings">
                <Settings className="size-5 shrink-0" />
                {isMobile && <span>Settings</span>}
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          {/* User avatar */}
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="Profile"
              className={isMobile ? "justify-start gap-3 px-3" : "!h-10 !w-10 !p-0 justify-center"}
            >
              <Avatar className="size-7 shrink-0">
                <AvatarImage src="/avatars/user.jpg" alt="User" />
                <AvatarFallback className="text-sm">U</AvatarFallback>
              </Avatar>
              {isMobile && <span>Profile</span>}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
