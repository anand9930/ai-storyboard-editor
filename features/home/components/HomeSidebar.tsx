'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Sparkles, Sun, Moon } from 'lucide-react';

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
} from '@/components/ui/sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useTheme } from '@/components/providers/ThemeProvider';

import { sidebarNavItems, sidebarFooterItems } from '../data/navigation';

export function HomeSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  const { colorMode, setColorMode } = useTheme();

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
      <SidebarHeader className="p-2">
        <SidebarMenu className="items-center">
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              asChild
              className="!h-11 !w-11 !p-0 justify-center"
              tooltip="AI Storyboard"
            >
              <Link href="/">
                <div className="flex aspect-square size-11 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <Sparkles className="size-6" />
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      {/* Main navigation icons */}
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="items-center">
              {sidebarNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.href}
                    tooltip={item.title}
                    className="!h-11 !w-11 !p-0 justify-center"
                  >
                    <Link href={item.href}>
                      <item.icon className="size-6" />
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer with theme toggle, notifications, avatar, menu */}
      <SidebarFooter className="p-2">
        <SidebarMenu className="items-center">
          {/* Theme toggle */}
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={toggleTheme}
              tooltip={colorMode === 'dark' ? 'Light Mode' : 'Dark Mode'}
              className="!h-11 !w-11 !p-0 justify-center"
            >
              {colorMode === 'dark' ? (
                <Moon className="size-6" />
              ) : (
                <Sun className="size-6" />
              )}
            </SidebarMenuButton>
          </SidebarMenuItem>
          {sidebarFooterItems.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                asChild
                tooltip={item.title}
                className="!h-11 !w-11 !p-0 justify-center"
              >
                <Link href={item.href}>
                  <item.icon className="size-6" />
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
          {/* User avatar */}
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="Profile"
              className="!h-11 !w-11 !p-0 justify-center"
            >
              <Avatar className="size-9">
                <AvatarImage src="/avatars/user.jpg" alt="User" />
                <AvatarFallback className="text-sm">U</AvatarFallback>
              </Avatar>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
