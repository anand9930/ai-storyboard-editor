import type { WorkflowData } from '../types';
import type { SourceNodeData, ImageNodeData, TextNodeData } from '@/features/flow/types/nodes';

/**
 * Mock workflow data for the Explore page gallery.
 * Each workflow demonstrates different AI generation pipelines.
 */
export const mockWorkflows: Record<string, WorkflowData> = {
  // Workflow 1: Simple Source → Image transformation
  'workflow-1': {
    id: 'workflow-1',
    projectName: 'Product Photography Enhancement',
    author: { name: 'Marcus Rivera' },
    thumbnailUrl: 'https://picsum.photos/id/30/400/550',
    nodes: [
      {
        id: 'source-1',
        type: 'source',
        position: { x: 100, y: 200 },
        data: {
          name: 'Original Photo',
          image: {
            id: 'img-1',
            url: 'https://picsum.photos/id/30/400/400',
            metadata: { width: 400, height: 400, format: 'jpg' },
          },
        } as SourceNodeData,
      },
      {
        id: 'image-1',
        type: 'image',
        position: { x: 500, y: 200 },
        data: {
          name: 'Enhanced',
          connectedSourceImages: [{ id: 'source-1', url: 'https://picsum.photos/id/30/400/400' }],
          generatedImage: 'https://picsum.photos/id/30/400/550',
          generatedImageMetadata: { width: 400, height: 550 },
          prompt: 'Enhance lighting and add professional studio background',
          selectedAction: 'image_to_image',
          aspectRatio: null,
          quality: null,
          model: 'google:4@1',
          status: 'completed',
        } as ImageNodeData,
      },
    ],
    edges: [
      { id: 'e1-2', source: 'source-1', target: 'image-1', sourceHandle: 'image', targetHandle: 'any' },
    ],
  },

  // Workflow 2: Source → Text (prompt generation) → Image
  'workflow-2': {
    id: 'workflow-2',
    projectName: 'AI Scene Generator',
    author: { name: 'Zoe Kim' },
    thumbnailUrl: 'https://picsum.photos/id/31/400/320',
    nodes: [
      {
        id: 'source-2',
        type: 'source',
        position: { x: 100, y: 200 },
        data: {
          name: 'Reference Image',
          image: {
            id: 'img-2',
            url: 'https://picsum.photos/id/31/400/400',
            metadata: { width: 400, height: 400, format: 'jpg' },
          },
        } as SourceNodeData,
      },
      {
        id: 'text-2',
        type: 'text',
        position: { x: 450, y: 100 },
        data: {
          name: 'Scene Description',
          content: 'A serene mountain landscape at golden hour with misty valleys and dramatic cloud formations.',
          prompt: '',
          selectedAction: 'prompt_from_image',
          connectedSourceImages: [{ id: 'source-2', url: 'https://picsum.photos/id/31/400/400' }],
          status: 'completed',
        } as TextNodeData,
      },
      {
        id: 'image-2',
        type: 'image',
        position: { x: 800, y: 200 },
        data: {
          name: 'Generated Scene',
          connectedSourceTexts: [{ id: 'text-2', content: 'A serene mountain landscape...' }],
          generatedImage: 'https://picsum.photos/id/31/400/320',
          generatedImageMetadata: { width: 400, height: 320 },
          prompt: 'A serene mountain landscape at golden hour with misty valleys and dramatic cloud formations.',
          selectedAction: 'image_to_image',
          aspectRatio: '16:9',
          quality: '2K',
          model: 'google:4@1',
          status: 'completed',
        } as ImageNodeData,
      },
    ],
    edges: [
      { id: 'e2-1', source: 'source-2', target: 'text-2', sourceHandle: 'image', targetHandle: 'any' },
      { id: 'e2-2', source: 'text-2', target: 'image-2', sourceHandle: 'text', targetHandle: 'any' },
    ],
  },

  // Workflow 3: Multiple outputs from single source
  'workflow-3': {
    id: 'workflow-3',
    projectName: 'Multi-Style Variations',
    author: { name: 'Daniel Foster' },
    thumbnailUrl: 'https://picsum.photos/id/32/400/480',
    nodes: [
      {
        id: 'source-3',
        type: 'source',
        position: { x: 100, y: 250 },
        data: {
          name: 'Base Image',
          image: {
            id: 'img-3',
            url: 'https://picsum.photos/id/32/400/400',
            metadata: { width: 400, height: 400, format: 'jpg' },
          },
        } as SourceNodeData,
      },
      {
        id: 'image-3a',
        type: 'image',
        position: { x: 500, y: 80 },
        data: {
          name: 'Style A - Vintage',
          connectedSourceImages: [{ id: 'source-3', url: 'https://picsum.photos/id/32/400/400' }],
          generatedImage: 'https://picsum.photos/id/32/400/480',
          generatedImageMetadata: { width: 400, height: 480 },
          prompt: 'Apply vintage film photography style with warm tones',
          selectedAction: 'image_to_image',
          aspectRatio: '4:5',
          quality: null,
          model: 'google:4@1',
          status: 'completed',
        } as ImageNodeData,
      },
      {
        id: 'image-3b',
        type: 'image',
        position: { x: 500, y: 420 },
        data: {
          name: 'Style B - Cyberpunk',
          connectedSourceImages: [{ id: 'source-3', url: 'https://picsum.photos/id/32/400/400' }],
          generatedImage: 'https://picsum.photos/id/52/400/480',
          generatedImageMetadata: { width: 400, height: 480 },
          prompt: 'Transform into cyberpunk neon aesthetic with glowing effects',
          selectedAction: 'image_to_image',
          aspectRatio: '4:5',
          quality: null,
          model: 'google:4@1',
          status: 'completed',
        } as ImageNodeData,
      },
    ],
    edges: [
      { id: 'e3-1', source: 'source-3', target: 'image-3a', sourceHandle: 'image', targetHandle: 'any' },
      { id: 'e3-2', source: 'source-3', target: 'image-3b', sourceHandle: 'image', targetHandle: 'any' },
    ],
  },

  // Workflow 4: Sequential transformations
  'workflow-4': {
    id: 'workflow-4',
    projectName: 'Iterative Refinement',
    author: { name: 'Aria Nguyen' },
    thumbnailUrl: 'https://picsum.photos/id/33/400/380',
    nodes: [
      {
        id: 'source-4',
        type: 'source',
        position: { x: 50, y: 200 },
        data: {
          name: 'Input',
          image: {
            id: 'img-4',
            url: 'https://picsum.photos/id/33/400/400',
            metadata: { width: 400, height: 400, format: 'jpg' },
          },
        } as SourceNodeData,
      },
      {
        id: 'image-4a',
        type: 'image',
        position: { x: 350, y: 200 },
        data: {
          name: 'Pass 1',
          connectedSourceImages: [{ id: 'source-4', url: 'https://picsum.photos/id/33/400/400' }],
          generatedImage: 'https://picsum.photos/id/53/400/380',
          generatedImageMetadata: { width: 400, height: 380 },
          prompt: 'Upscale and enhance details',
          selectedAction: 'image_to_image',
          aspectRatio: null,
          quality: '2K',
          model: 'google:4@1',
          status: 'completed',
        } as ImageNodeData,
      },
      {
        id: 'image-4b',
        type: 'image',
        position: { x: 650, y: 200 },
        data: {
          name: 'Pass 2',
          connectedSourceImages: [{ id: 'image-4a', url: 'https://picsum.photos/id/53/400/380' }],
          generatedImage: 'https://picsum.photos/id/33/400/380',
          generatedImageMetadata: { width: 400, height: 380 },
          prompt: 'Add artistic lighting and color grading',
          selectedAction: 'image_to_image',
          aspectRatio: null,
          quality: '2K',
          model: 'google:4@1',
          status: 'completed',
        } as ImageNodeData,
      },
    ],
    edges: [
      { id: 'e4-1', source: 'source-4', target: 'image-4a', sourceHandle: 'image', targetHandle: 'any' },
      { id: 'e4-2', source: 'image-4a', target: 'image-4b', sourceHandle: 'image', targetHandle: 'any' },
    ],
  },

  // Workflow 5: Complex multi-step with text and image
  'workflow-5': {
    id: 'workflow-5',
    projectName: 'Creative Storyboard',
    author: { name: 'Lucas Bennett' },
    thumbnailUrl: 'https://picsum.photos/id/34/400/420',
    nodes: [
      {
        id: 'source-5',
        type: 'source',
        position: { x: 50, y: 200 },
        data: {
          name: 'Reference',
          image: {
            id: 'img-5',
            url: 'https://picsum.photos/id/34/400/400',
            metadata: { width: 400, height: 400, format: 'jpg' },
          },
        } as SourceNodeData,
      },
      {
        id: 'text-5a',
        type: 'text',
        position: { x: 350, y: 50 },
        data: {
          name: 'Analysis',
          content: 'A coastal scene featuring rocky cliffs meeting the ocean under a dramatic sky.',
          prompt: '',
          selectedAction: 'prompt_from_image',
          connectedSourceImages: [{ id: 'source-5', url: 'https://picsum.photos/id/34/400/400' }],
          status: 'completed',
        } as TextNodeData,
      },
      {
        id: 'image-5',
        type: 'image',
        position: { x: 650, y: 150 },
        data: {
          name: 'Generated',
          connectedSourceImages: [{ id: 'source-5', url: 'https://picsum.photos/id/34/400/400' }],
          connectedSourceTexts: [{ id: 'text-5a', content: 'A coastal scene...' }],
          generatedImage: 'https://picsum.photos/id/34/400/420',
          generatedImageMetadata: { width: 400, height: 420 },
          prompt: 'A coastal scene featuring rocky cliffs meeting the ocean under a dramatic sky, cinematic lighting',
          selectedAction: 'image_to_image',
          aspectRatio: null,
          quality: '2K',
          model: 'google:4@1',
          status: 'completed',
        } as ImageNodeData,
      },
      {
        id: 'text-5b',
        type: 'text',
        position: { x: 650, y: 380 },
        data: {
          name: 'Caption',
          content: 'Where the ancient cliffs stand guard over endless waves, nature writes poetry in stone and sea.',
          prompt: 'Write a poetic caption for this coastal image',
          selectedAction: 'prompt_from_image',
          connectedSourceImages: [{ id: 'image-5', url: 'https://picsum.photos/id/34/400/420' }],
          status: 'completed',
        } as TextNodeData,
      },
    ],
    edges: [
      { id: 'e5-1', source: 'source-5', target: 'text-5a', sourceHandle: 'image', targetHandle: 'any' },
      { id: 'e5-2', source: 'source-5', target: 'image-5', sourceHandle: 'image', targetHandle: 'any' },
      { id: 'e5-3', source: 'text-5a', target: 'image-5', sourceHandle: 'text', targetHandle: 'any' },
      { id: 'e5-4', source: 'image-5', target: 'text-5b', sourceHandle: 'image', targetHandle: 'any' },
    ],
  },
};
