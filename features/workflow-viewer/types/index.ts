import type { AppNode } from '@/features/flow/types/nodes';
import type { Edge } from '@xyflow/react';

export interface WorkflowAuthor {
  name: string;
  avatar?: string;
}

export interface WorkflowData {
  id: string;
  projectName: string;
  author: WorkflowAuthor;
  nodes: AppNode[];
  edges: Edge[];
  thumbnailUrl?: string;
}
