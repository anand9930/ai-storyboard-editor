import {
  Image,
  Workflow,
  FileText,
  Download,
  Bookmark,
} from 'lucide-react';
import type { NavItem } from '../types';

export const sidebarNavItems: NavItem[] = [
  { title: 'Gallery', icon: Image, href: '/gallery' },
  { title: 'Workflow', icon: Workflow, href: '/flow' },
  { title: 'Documents', icon: FileText, href: '/docs' },
  { title: 'Downloads', icon: Download, href: '/downloads' },
  { title: 'Saved', icon: Bookmark, href: '/saved' },
];

export const sidebarFooterItems: NavItem[] = [];
