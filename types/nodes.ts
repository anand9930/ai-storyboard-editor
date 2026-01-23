import { Node } from '@xyflow/react';

export type NodeStatus = 'idle' | 'processing' | 'completed' | 'error';

// Fixed models for MVP (no user selection)
export const FIXED_MODELS = {
  text: { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', provider: 'google' },
  image: { id: 'flux-dev', name: 'FLUX', provider: 'fal' },
} as const;

// Actions available for each node type
export const NODE_ACTIONS = {
  text: [
    { id: 'write', label: 'Write your own content', icon: 'Pencil', description: 'Create text manually or with AI assistance' },
    { id: 'prompt_from_image', label: 'Prompt from Image', icon: 'ImageIcon', description: 'Generate prompt description from connected image' },
  ],
  image: [
    { id: 'image_to_image', label: 'Image to Image', icon: 'RefreshCw', description: 'Transform image using AI' },
  ],
  source: [],
} as const;

// "Generate from this node" popup options
export const GENERATE_OPTIONS = [
  { id: 'text', label: 'Text Generation', icon: 'Type', description: 'Script, Ad copy, Brand text' },
  { id: 'image', label: 'Image Generation', icon: 'ImageIcon', description: 'Generate or transform images' },
] as const;

// Node data interfaces with index signature for ReactFlow compatibility
export interface TextNodeData {
  name: string;
  content: string;
  prompt: string;
  selectedAction: 'write' | 'prompt_from_image' | null;
  connectedSourceImage?: string;
  status: NodeStatus;
  error?: string;
  [key: string]: unknown;
}

export interface ImageNodeData {
  name: string;
  sourceImage?: string;
  generatedImage?: string;
  prompt: string;
  selectedAction: 'image_to_image' | null;
  status: NodeStatus;
  error?: string;
  [key: string]: unknown;
}

export interface SourceNodeData {
  name: string;
  image: {
    id: string;
    url: string;
    metadata: {
      width: number;
      height: number;
      format: string;
    };
  } | null;
  [key: string]: unknown;
}

// Type aliases for nodes
export type TextNode = Node<TextNodeData, 'text'>;
export type ImageNode = Node<ImageNodeData, 'image'>;
export type SourceNode = Node<SourceNodeData, 'source'>;

// Default data creators
export function getDefaultTextNodeData(): TextNodeData {
  return {
    name: 'Text',
    content: '',
    prompt: '',
    selectedAction: null,
    status: 'idle',
  };
}

export function getDefaultImageNodeData(): ImageNodeData {
  return {
    name: 'Image',
    sourceImage: undefined,
    generatedImage: undefined,
    prompt: '',
    selectedAction: null,
    status: 'idle',
  };
}

export function getDefaultSourceNodeData(): SourceNodeData {
  return {
    name: 'Source',
    image: null,
  };
}

export function getDefaultNodeData(type: string) {
  switch (type) {
    case 'text':
      return getDefaultTextNodeData();
    case 'image':
      return getDefaultImageNodeData();
    case 'source':
      return getDefaultSourceNodeData();
    default:
      return {};
  }
}
