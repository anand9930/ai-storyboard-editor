import {
  Compass,
  Plus,
  Folder,
  Bookmark,
  Star,
} from 'lucide-react';
import type { NavGroup } from '../types';

export const sidebarNavGroups: NavGroup[] = [
  {
    items: [
      { title: 'Explore', icon: Compass, href: '/explore' },
      { title: 'New Work', icon: Plus, href: '/flow' },
      { title: 'Projects', icon: Folder, href: '/projects' },
    ],
  },
  {
    items: [
      { title: 'Saved', icon: Bookmark, href: '/saved' },
      { title: 'Subscription', icon: Star, href: '/subscription' },
    ],
  },
];
