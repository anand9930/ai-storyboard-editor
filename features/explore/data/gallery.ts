import type { ExploreGalleryItem } from '../types';

// Placeholder author names for Explore gallery
const authors = [
  'Marcus Rivera',
  'Zoe Kim',
  'Daniel Foster',
  'Aria Nguyen',
  'Lucas Bennett',
  'Mia Thompson',
  'James Rodriguez',
  'Chloe Wright',
  'Ryan Anderson',
  'Grace Mitchell',
];

// Map gallery index to workflow IDs (cycles through 5 workflows)
const getWorkflowId = (index: number) => `workflow-${(index % 5) + 1}`;

// Gallery images for Explore page (different IDs from home gallery)
// Each image links to a mock workflow
export const exploreGalleryImages: ExploreGalleryItem[] = [
  { src: 'https://picsum.photos/id/30/400/550', alt: 'Creative artwork', width: 400, height: 550, author: { name: authors[0] }, workflowId: getWorkflowId(0) },
  { src: 'https://picsum.photos/id/31/400/320', alt: 'Creative artwork', width: 400, height: 320, author: { name: authors[1] }, workflowId: getWorkflowId(1) },
  { src: 'https://picsum.photos/id/32/400/480', alt: 'Creative artwork', width: 400, height: 480, author: { name: authors[2] }, workflowId: getWorkflowId(2) },
  { src: 'https://picsum.photos/id/33/400/380', alt: 'Creative artwork', width: 400, height: 380, author: { name: authors[3] }, workflowId: getWorkflowId(3) },
  { src: 'https://picsum.photos/id/34/400/420', alt: 'Creative artwork', width: 400, height: 420, author: { name: authors[4] }, workflowId: getWorkflowId(4) },
  { src: 'https://picsum.photos/id/35/400/300', alt: 'Creative artwork', width: 400, height: 300, author: { name: authors[5] }, workflowId: getWorkflowId(5) },
  { src: 'https://picsum.photos/id/36/400/520', alt: 'Creative artwork', width: 400, height: 520, author: { name: authors[6] }, workflowId: getWorkflowId(6) },
  { src: 'https://picsum.photos/id/37/400/360', alt: 'Creative artwork', width: 400, height: 360, author: { name: authors[7] }, workflowId: getWorkflowId(7) },
  { src: 'https://picsum.photos/id/38/400/450', alt: 'Creative artwork', width: 400, height: 450, author: { name: authors[8] }, workflowId: getWorkflowId(8) },
  { src: 'https://picsum.photos/id/39/400/400', alt: 'Creative artwork', width: 400, height: 400, author: { name: authors[9] }, workflowId: getWorkflowId(9) },
  { src: 'https://picsum.photos/id/40/400/580', alt: 'Creative artwork', width: 400, height: 580, author: { name: authors[0] }, workflowId: getWorkflowId(10) },
  { src: 'https://picsum.photos/id/41/400/340', alt: 'Creative artwork', width: 400, height: 340, author: { name: authors[1] }, workflowId: getWorkflowId(11) },
  { src: 'https://picsum.photos/id/42/400/500', alt: 'Creative artwork', width: 400, height: 500, author: { name: authors[2] }, workflowId: getWorkflowId(12) },
  { src: 'https://picsum.photos/id/43/400/280', alt: 'Creative artwork', width: 400, height: 280, author: { name: authors[3] }, workflowId: getWorkflowId(13) },
  { src: 'https://picsum.photos/id/44/400/460', alt: 'Creative artwork', width: 400, height: 460, author: { name: authors[4] }, workflowId: getWorkflowId(14) },
  { src: 'https://picsum.photos/id/45/400/390', alt: 'Creative artwork', width: 400, height: 390, author: { name: authors[5] }, workflowId: getWorkflowId(15) },
  { src: 'https://picsum.photos/id/46/400/530', alt: 'Creative artwork', width: 400, height: 530, author: { name: authors[6] }, workflowId: getWorkflowId(16) },
  { src: 'https://picsum.photos/id/47/400/350', alt: 'Creative artwork', width: 400, height: 350, author: { name: authors[7] }, workflowId: getWorkflowId(17) },
  { src: 'https://picsum.photos/id/48/400/440', alt: 'Creative artwork', width: 400, height: 440, author: { name: authors[8] }, workflowId: getWorkflowId(18) },
  { src: 'https://picsum.photos/id/49/400/600', alt: 'Creative artwork', width: 400, height: 600, author: { name: authors[9] }, workflowId: getWorkflowId(19) },
];
