import { NodeTypes, Edge, Connection } from '@xyflow/react';
import { TextNode } from '@/components/nodes/TextNode';
import { ImageNode } from '@/components/nodes/ImageNode';
import { SourceNode } from '@/components/nodes/SourceNode';
import type { AppNode } from '@/types/nodes';

// Node types registration - defined outside components to prevent re-renders
export const nodeTypes: NodeTypes = {
  text: TextNode,
  image: ImageNode,
  source: SourceNode,
};

// Default edge styling options
export const defaultEdgeOptions = {
  type: 'default',
  style: {
    stroke: '#3f3f46',
    strokeWidth: 2,
  },
  animated: false,
} as const;

// Valid connection rules: which node types can connect to which
export const connectionRules: Record<string, string[]> = {
  source: ['image', 'text'],
  text: ['image', 'text'],
  image: ['image', 'text'],
};

// Connection validation helper - uses nodes array for consistent store reads
export function isValidNodeConnection(
  connection: Edge | Connection,
  nodes: AppNode[],
  edges: Edge[]
): boolean {
  // Prevent self-connections
  if (connection.source === connection.target) {
    return false;
  }

  const sourceNode = nodes.find((n) => n.id === connection.source);
  const targetNode = nodes.find((n) => n.id === connection.target);

  if (!sourceNode || !targetNode) {
    return false;
  }

  // Prevent duplicate connections (same source to same target)
  const existingEdge = edges.find(
    (edge) =>
      edge.source === connection.source && edge.target === connection.target
  );
  if (existingEdge) {
    return false;
  }

  // Check connection rules
  const allowedTargets = connectionRules[sourceNode.type!] || [];
  return allowedTargets.includes(targetNode.type!);
}
