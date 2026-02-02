import type { Project } from '../types';

function daysAgo(days: number): Date {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
}

function hoursAgo(hours: number): Date {
  const date = new Date();
  date.setHours(date.getHours() - hours);
  return date;
}

export const mockProjects: Project[] = [
  {
    id: '1',
    title: 'Hero Banner Concepts',
    thumbnailUrl: 'https://picsum.photos/seed/proj1/400/300',
    updatedAt: hoursAgo(2),
    createdAt: daysAgo(5),
  },
  {
    id: '2',
    title: 'Product Showcase',
    thumbnailUrl: 'https://picsum.photos/seed/proj2/400/300',
    updatedAt: hoursAgo(6),
    createdAt: daysAgo(3),
  },
  {
    id: '3',
    title: 'Social Media Campaign',
    thumbnailUrl: 'https://picsum.photos/seed/proj3/400/300',
    updatedAt: daysAgo(1),
    createdAt: daysAgo(7),
  },
  {
    id: '4',
    title: 'Landing Page Visuals',
    thumbnailUrl: 'https://picsum.photos/seed/proj4/400/300',
    updatedAt: daysAgo(3),
    createdAt: daysAgo(10),
  },
  {
    id: '5',
    title: 'Character Designs',
    thumbnailUrl: null,
    updatedAt: daysAgo(5),
    createdAt: daysAgo(14),
  },
  {
    id: '6',
    title: 'Storyboard Draft',
    thumbnailUrl: 'https://picsum.photos/seed/proj6/400/300',
    updatedAt: daysAgo(7),
    createdAt: daysAgo(21),
  },
];

export function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffHours < 1) return 'Edited just now';
  if (diffHours < 24) return `Edited ${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
  if (diffDays === 1) return 'Edited yesterday';
  if (diffDays < 30) return `Edited ${diffDays} days ago`;
  return `Edited ${Math.floor(diffDays / 30)} month${Math.floor(diffDays / 30) === 1 ? '' : 's'} ago`;
}
