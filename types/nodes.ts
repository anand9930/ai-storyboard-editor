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

// Node data interfaces - properly typed without index signatures
export interface TextNodeData extends Record<string, unknown> {
  name: string;
  content: string;
  prompt: string;
  selectedAction: 'write' | 'prompt_from_image' | null;
  connectedSourceImage?: string;
  status: NodeStatus;
  error?: string;
}

export interface ImageNodeData extends Record<string, unknown> {
  name: string;
  sourceImage?: string;
  generatedImage?: string;
  prompt: string;
  selectedAction: 'image_to_image' | null;
  status: NodeStatus;
  error?: string;
}

export interface SourceNodeData extends Record<string, unknown> {
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
}

// Type aliases for nodes with proper generic typing
export type TextNode = Node<TextNodeData, 'text'>;
export type ImageNode = Node<ImageNodeData, 'image'>;
export type SourceNode = Node<SourceNodeData, 'source'>;

// Union type for all app nodes
export type AppNode = TextNode | ImageNode | SourceNode;
export type AppNodeData = TextNodeData | ImageNodeData | SourceNodeData;

// Type guard functions
export function isTextNode(node: AppNode): node is TextNode {
  return node.type === 'text';
}

export function isImageNode(node: AppNode): node is ImageNode {
  return node.type === 'image';
}

export function isSourceNode(node: AppNode): node is SourceNode {
  return node.type === 'source';
}

// Default data creators (internal helpers for getDefaultNodeData)
function getDefaultTextNodeData(): TextNodeData {
  return {
    name: 'Text',
    content: '',
    prompt: '',
    selectedAction: null,
    status: 'idle',
  };
}

function getDefaultImageNodeData(): ImageNodeData {
  return {
    name: 'Image',
    sourceImage: undefined,
    generatedImage: undefined,
    prompt: '',
    selectedAction: null,
    status: 'idle',
  };
}

function getDefaultSourceNodeData(): SourceNodeData {
  return {
    name: 'Source',
    image: null,
  };
}

// Overloaded function for type-safe node data creation
export function getDefaultNodeData(type: 'text'): TextNodeData;
export function getDefaultNodeData(type: 'image'): ImageNodeData;
export function getDefaultNodeData(type: 'source'): SourceNodeData;
export function getDefaultNodeData(type: string): AppNodeData;
export function getDefaultNodeData(type: string): AppNodeData {
  switch (type) {
    case 'text':
      return getDefaultTextNodeData();
    case 'image':
      return getDefaultImageNodeData();
    case 'source':
      return getDefaultSourceNodeData();
    default:
      return getDefaultTextNodeData();
  }
}
