import { Node } from '@xyflow/react';

export type NodeStatus = 'idle' | 'processing' | 'completed' | 'error';

export enum NodeType {
  TEXT = 'text',
  IMAGE = 'image',
  SOURCE = 'source',
}

// Fixed models for MVP (no user selection)
export const FIXED_MODELS = {
  text: { id: 'gemini-1.5-pro', name: 'Gemini 3 Pro', provider: 'google' },
  image: { id: 'banana-pro', name: 'Banana Pro', provider: 'banana' },
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
  content: string;
  selectedAction: 'write' | 'prompt_from_image' | null;
  connectedSourceImage?: string;
  status: NodeStatus;
  error?: string;
  [key: string]: unknown;
}

export interface ImageNodeData {
  sourceImage?: string;
  generatedImage?: string;
  prompt: string;
  selectedAction: 'image_to_image' | null;
  status: NodeStatus;
  error?: string;
  [key: string]: unknown;
}

export interface SourceNodeData {
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

export type AppNode = TextNode | ImageNode | SourceNode;

// Default data creators
export function getDefaultTextNodeData(): TextNodeData {
  return {
    content: '',
    selectedAction: null,
    status: 'idle',
  };
}

export function getDefaultImageNodeData(): ImageNodeData {
  return {
    sourceImage: undefined,
    generatedImage: undefined,
    prompt: '',
    selectedAction: null,
    status: 'idle',
  };
}

export function getDefaultSourceNodeData(): SourceNodeData {
  return {
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
