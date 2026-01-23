import { Node, Edge } from '@xyflow/react';

export interface WorkflowData {
  nodes: Node[];
  edges: Edge[];
  exportedAt: string;
  version: string;
}

export interface GenerationRequest {
  nodeId: string;
  prompt: string;
  sourceImage?: string;
}

export interface GenerationResult {
  nodeId: string;
  success: boolean;
  data?: {
    text?: string;
    imageUrl?: string;
    analysis?: ImageAnalysis;
  };
  error?: string;
}

export interface ImageAnalysis {
  subject: string;
  style: string;
  colors: string;
  suggestedPrompt: string;
  poseDescription?: string;
}
