import type { GalleryItem } from '@/components/ui/masonry-gallery';

// Placeholder author names
const authors = [
  'Alex Chen',
  'Maya Patel',
  'Jordan Lee',
  'Sofia Garcia',
  'Liam Wilson',
  'Emma Davis',
  'Noah Martinez',
  'Olivia Brown',
  'Ethan Taylor',
  'Ava Johnson',
];

// Generate gallery images with varied dimensions using picsum.photos
// Each image has a unique ID for consistent results
export const galleryImages: GalleryItem[] = [
  { src: 'https://picsum.photos/id/10/400/600', alt: 'AI generated artwork', width: 400, height: 600, author: { name: authors[0] } },
  { src: 'https://picsum.photos/id/11/400/300', alt: 'AI generated artwork', width: 400, height: 300, author: { name: authors[1] } },
  { src: 'https://picsum.photos/id/12/400/500', alt: 'AI generated artwork', width: 400, height: 500, author: { name: authors[2] } },
  { src: 'https://picsum.photos/id/13/400/350', alt: 'AI generated artwork', width: 400, height: 350, author: { name: authors[3] } },
  { src: 'https://picsum.photos/id/14/400/450', alt: 'AI generated artwork', width: 400, height: 450, author: { name: authors[4] } },
  { src: 'https://picsum.photos/id/15/400/280', alt: 'AI generated artwork', width: 400, height: 280, author: { name: authors[5] } },
  { src: 'https://picsum.photos/id/16/400/550', alt: 'AI generated artwork', width: 400, height: 550, author: { name: authors[6] } },
  { src: 'https://picsum.photos/id/17/400/400', alt: 'AI generated artwork', width: 400, height: 400, author: { name: authors[7] } },
  { src: 'https://picsum.photos/id/18/400/320', alt: 'AI generated artwork', width: 400, height: 320, author: { name: authors[8] } },
  { src: 'https://picsum.photos/id/19/400/480', alt: 'AI generated artwork', width: 400, height: 480, author: { name: authors[9] } },
  { src: 'https://picsum.photos/id/20/400/360', alt: 'AI generated artwork', width: 400, height: 360, author: { name: authors[0] } },
  { src: 'https://picsum.photos/id/21/400/520', alt: 'AI generated artwork', width: 400, height: 520, author: { name: authors[1] } },
  { src: 'https://picsum.photos/id/22/400/380', alt: 'AI generated artwork', width: 400, height: 380, author: { name: authors[2] } },
  { src: 'https://picsum.photos/id/23/400/440', alt: 'AI generated artwork', width: 400, height: 440, author: { name: authors[3] } },
  { src: 'https://picsum.photos/id/24/400/300', alt: 'AI generated artwork', width: 400, height: 300, author: { name: authors[4] } },
  { src: 'https://picsum.photos/id/25/400/580', alt: 'AI generated artwork', width: 400, height: 580, author: { name: authors[5] } },
  { src: 'https://picsum.photos/id/26/400/340', alt: 'AI generated artwork', width: 400, height: 340, author: { name: authors[6] } },
  { src: 'https://picsum.photos/id/27/400/460', alt: 'AI generated artwork', width: 400, height: 460, author: { name: authors[7] } },
  { src: 'https://picsum.photos/id/28/400/400', alt: 'AI generated artwork', width: 400, height: 400, author: { name: authors[8] } },
  { src: 'https://picsum.photos/id/29/400/500', alt: 'AI generated artwork', width: 400, height: 500, author: { name: authors[9] } },
];
