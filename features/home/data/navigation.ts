import {
  Image,
  Workflow,
  FileText,
  Download,
  Bookmark,
  Star,
} from 'lucide-react';
import type { NavItem } from '../types';

export const sidebarNavItems: NavItem[] = [
  { title: 'Gallery', icon: Image, href: '/gallery' },
  { title: 'Workflow', icon: Workflow, href: '/flow' },
  { title: 'Documents', icon: FileText, href: '/docs' },
  { title: 'Downloads', icon: Download, href: '/downloads' },
  { title: 'Saved', icon: Bookmark, href: '/saved' },
  { title: 'Subscription', icon: Star, href: '/subscription' },
];

export const sidebarFooterItems: NavItem[] = [];
