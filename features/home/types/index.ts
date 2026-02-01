import type { LucideIcon } from 'lucide-react';

export interface NavItem {
  title: string;
  icon: LucideIcon;
  href: string;
}

export interface NavGroup {
  items: NavItem[];
}

export interface LogoItem {
  name: string;
  src: string;
  href?: string;
}
