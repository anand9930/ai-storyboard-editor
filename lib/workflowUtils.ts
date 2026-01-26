import { Node, Edge } from '@xyflow/react';
import type {
  ConnectedImage,
  SourceNodeData,
  ImageNodeData,
  TextNodeData,
} from '@/types/nodes';

/**
 * Topological sort using Kahn's algorithm
 * Returns nodes in execution order (dependencies first)
 */
export function topologicalSort<T extends Node>(nodes: T[], edges: Edge[]): T[] {
  const nodeMap = new Map(nodes.map((n) => [n.id, n]));
  const inDegree = new Map<string, number>();
  const adjList = new Map<string, string[]>();

  // Initialize all nodes with in-degree 0
  nodes.forEach((n) => {
    inDegree.set(n.id, 0);
    adjList.set(n.id, []);
  });

  // Build adjacency list and calculate in-degrees
  // Only count edges where BOTH source and target are in our node set
  edges.forEach((e) => {
    const sourceInSet = nodeMap.has(e.source);
    const targetInSet = nodeMap.has(e.target);

    if (sourceInSet && targetInSet) {
      adjList.get(e.source)!.push(e.target);
      inDegree.set(e.target, (inDegree.get(e.target) || 0) + 1);
    }
  });

  // Start with nodes that have no internal dependencies (in-degree 0)
  const queue: T[] = nodes.filter((n) => inDegree.get(n.id) === 0);
  const result: T[] = [];

  while (queue.length > 0) {
    const node = queue.shift()!;
    result.push(node);

    // Reduce in-degree of neighbors
    for (const neighborId of adjList.get(node.id) || []) {
      const newDegree = (inDegree.get(neighborId) || 1) - 1;
      inDegree.set(neighborId, newDegree);

      if (newDegree === 0) {
        const neighborNode = nodeMap.get(neighborId);
        if (neighborNode) {
          queue.push(neighborNode);
        }
      }
    }
  }

  // If result doesn't include all nodes, there might be a cycle
  if (result.length !== nodes.length) {
    console.warn('Possible cycle detected in workflow graph');
    // Add remaining nodes anyway to prevent execution from failing
    nodes.forEach((n) => {
      if (!result.find((r) => r.id === n.id)) {
        result.push(n);
      }
    });
  }

  return result;
}

/**
 * Get all edges that connect to nodes in the given set
 * Includes edges from external sources (for input data)
 */
export function getRelevantEdges(nodeIds: string[], allEdges: Edge[]): Edge[] {
  const nodeIdSet = new Set(nodeIds);

  return allEdges.filter((edge) => {
    // Include edge if target is in our set (we need to receive data)
    // Source can be external (external inputs are allowed)
    return nodeIdSet.has(edge.target);
  });
}

/**
 * Get input images for a node from its connected sources
 * Checks both execution outputs and existing node data
 */
export function getNodeInputImages(
  nodeId: string,
  edges: Edge[],
  executionOutputs: Map<string, { imageUrl?: string; text?: string }>,
  allNodes: Node[]
): ConnectedImage[] {
  const inputs: ConnectedImage[] = [];

  // Find all edges targeting this node
  const incomingEdges = edges.filter((e) => e.target === nodeId);

  for (const edge of incomingEdges) {
    const sourceNode = allNodes.find((n) => n.id === edge.source);
    if (!sourceNode) continue;

    // First check if we have output from this execution run
    const execOutput = executionOutputs.get(edge.source);
    if (execOutput?.imageUrl) {
      inputs.push({ id: edge.source, url: execOutput.imageUrl });
      continue;
    }

    // Otherwise check existing node data
    if (sourceNode.type === 'source') {
      const sourceData = sourceNode.data as SourceNodeData;
      if (sourceData?.image?.url) {
        inputs.push({ id: edge.source, url: sourceData.image.url });
      }
    } else if (sourceNode.type === 'image') {
      const imageData = sourceNode.data as ImageNodeData;
      if (imageData?.generatedImage) {
        inputs.push({ id: edge.source, url: imageData.generatedImage });
      }
    }
  }

  return inputs;
}

/**
 * Validate that all executable nodes have required prompts
 * Returns list of node names that are missing prompts
 */
export function validateNodePrompts(nodes: Node[]): { valid: boolean; invalidNodes: string[] } {
  const invalidNodes: string[] = [];

  for (const node of nodes) {
    // Skip source nodes - they don't need prompts
    if (node.type === 'source') continue;

    // Text and Image nodes need prompts
    if (node.type === 'text' || node.type === 'image') {
      const nodeData = node.data as TextNodeData | ImageNodeData;
      const prompt = nodeData?.prompt;
      if (!prompt || prompt.trim() === '') {
        const nodeName = nodeData?.name || node.id;
        invalidNodes.push(nodeName);
      }
    }
  }

  return {
    valid: invalidNodes.length === 0,
    invalidNodes,
  };
}

/**
 * Get child nodes of a group
 */
export function getGroupChildren(groupId: string, allNodes: Node[]): Node[] {
  return allNodes.filter((n) => n.parentId === groupId);
}

/**
 * Filter nodes to only executable types (text, image)
 * Source nodes are inputs, not executable
 */
export function getExecutableNodes(nodes: Node[]): Node[] {
  return nodes.filter((n) => n.type === 'text' || n.type === 'image');
}
