import { Node } from '@xyflow/react';

export type NodeStatus = 'idle' | 'processing' | 'completed' | 'error';

// Shared type for connected source images
export interface ConnectedImage {
  id: string;
  url: string;
}

// Fixed models for MVP (no user selection)
export const FIXED_MODELS = {
  text: { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', provider: 'google' },
  image: { id: 'gemini-2.5-flash-image', name: 'Nano Banana', provider: 'google' },
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

// Placeholder image for SourceNode when auto-created
export const PLACEHOLDER_IMAGE = {
  url: `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400"><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#667eea"/><stop offset="100%" stop-color="#764ba2"/></linearGradient></defs><rect fill="url(#g)" width="400" height="400"/><text x="200" y="200" text-anchor="middle" dy=".3em" fill="white" font-family="system-ui" font-size="14">Upload your image</text></svg>`)}`,
  metadata: { width: 400, height: 400, format: 'svg' }
};

// Node data interfaces - properly typed without index signatures
export interface TextNodeData extends Record<string, unknown> {
  name: string;
  content: string;
  prompt: string;
  selectedAction: 'write' | 'prompt_from_image' | null;
  connectedSourceImages?: ConnectedImage[];
  status: NodeStatus;
  error?: string;
}

// Supported aspect ratios for image generation
export type AspectRatio = '1:1' | '9:16' | '16:9' | '3:4' | '4:3' | '3:2' | '2:3' | '5:4' | '4:5' | '21:9';
export type ImageQuality = '1K' | '2K' | '4K';

export const ASPECT_RATIOS: { value: AspectRatio; label: string }[] = [
  { value: '1:1', label: '1:1' },
  { value: '9:16', label: '9:16' },
  { value: '16:9', label: '16:9' },
  { value: '3:4', label: '3:4' },
  { value: '4:3', label: '4:3' },
  { value: '3:2', label: '3:2' },
  { value: '2:3', label: '2:3' },
  { value: '5:4', label: '5:4' },
  { value: '4:5', label: '4:5' },
  { value: '21:9', label: '21:9' },
];

export const IMAGE_QUALITIES: { value: ImageQuality; label: string }[] = [
  { value: '1K', label: '1K' },
  { value: '2K', label: '2K' },
  { value: '4K', label: '4K' },
];

export interface ImageNodeData extends Record<string, unknown> {
  name: string;
  sourceImage?: string;
  connectedSourceImages?: ConnectedImage[];
  generatedImage?: string;
  generatedImageMetadata?: {
    width: number;
    height: number;
  };
  prompt: string;
  selectedAction: 'image_to_image' | null;
  aspectRatio: AspectRatio | null; // null = Auto
  quality: ImageQuality | null; // null = Auto
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

// Group node data - container for grouping multiple nodes
export interface GroupNodeData extends Record<string, unknown> {
  name: string;
  backgroundColor: string;
}

// Type aliases for nodes with proper generic typing
export type TextNode = Node<TextNodeData, 'text'>;
export type ImageNode = Node<ImageNodeData, 'image'>;
export type SourceNode = Node<SourceNodeData, 'source'>;
export type GroupNode = Node<GroupNodeData, 'group'>;

// Union type for all app nodes
export type AppNode = TextNode | ImageNode | SourceNode | GroupNode;
export type AppNodeData = TextNodeData | ImageNodeData | SourceNodeData | GroupNodeData;

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

export function isGroupNode(node: AppNode): node is GroupNode {
  return node.type === 'group';
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
    aspectRatio: null,
    quality: null,
    status: 'idle',
  };
}

function getDefaultSourceNodeData(): SourceNodeData {
  return {
    name: 'Source',
    image: null,
  };
}

function getDefaultGroupNodeData(): GroupNodeData {
  return {
    name: 'New Group',
    backgroundColor: '#3b82f6', // Default blue color
  };
}

// Overloaded function for type-safe node data creation
export function getDefaultNodeData(type: 'text'): TextNodeData;
export function getDefaultNodeData(type: 'image'): ImageNodeData;
export function getDefaultNodeData(type: 'source'): SourceNodeData;
export function getDefaultNodeData(type: 'group'): GroupNodeData;
export function getDefaultNodeData(type: string): AppNodeData;
export function getDefaultNodeData(type: string): AppNodeData {
  switch (type) {
    case 'text':
      return getDefaultTextNodeData();
    case 'image':
      return getDefaultImageNodeData();
    case 'source':
      return getDefaultSourceNodeData();
    case 'group':
      return getDefaultGroupNodeData();
    default:
      return getDefaultTextNodeData();
  }
}
