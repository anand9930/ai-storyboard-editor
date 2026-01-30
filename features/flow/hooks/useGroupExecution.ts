'use client';

import { useState, useCallback } from 'react';
import { Node, Edge } from '@xyflow/react';
import { useWorkflowStore } from '@/features/flow/store/workflowStore';
import {
  topologicalSort,
  getRelevantEdges,
  getNodeInputImages,
  validateNodePrompts,
  getGroupChildren,
  getExecutableNodes,
} from '@/features/flow/lib/workflowUtils';
import {
  FIXED_MODELS,
  ConnectedImage,
  ImageNodeData,
  TextNodeData,
} from '@/features/flow/types/nodes';

interface UseGroupExecutionOptions {
  groupId: string;
}

interface ExecutionProgress {
  completed: number;
  total: number;
  currentNode: string | null;
}

interface UseGroupExecutionResult {
  runGroup: () => Promise<void>;
  isRunning: boolean;
  progress: ExecutionProgress;
  error: string | null;
}

interface ExecutionOutput {
  imageUrl?: string;
  text?: string;
}

export function useGroupExecution({
  groupId,
}: UseGroupExecutionOptions): UseGroupExecutionResult {
  const { nodes, edges, updateNodeData } = useWorkflowStore();

  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState<ExecutionProgress>({
    completed: 0,
    total: 0,
    currentNode: null,
  });
  const [error, setError] = useState<string | null>(null);

  const executeTextNode = useCallback(
    async (
      node: Node,
      inputImages: ConnectedImage[]
    ): Promise<ExecutionOutput> => {
      const nodeData = node.data as TextNodeData;

      // Build combined prompt: node prompt + connected text contents
      let combinedPrompt = nodeData.prompt;
      if (nodeData.connectedSourceTexts?.length) {
        const textContents = nodeData.connectedSourceTexts
          .map(t => t.content.replace(/<[^>]*>/g, '').trim())
          .filter(t => t.length > 0);
        if (textContents.length > 0) {
          combinedPrompt = nodeData.prompt + '\n\n' + textContents.join('\n\n');
        }
      }

      const response = await fetch('/api/generate-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: combinedPrompt,
          model: FIXED_MODELS.text.id,
          images: inputImages,
        }),
      });

      const result = await response.json();

      if (result.error) {
        throw new Error(result.error);
      }

      // Update node with generated content
      updateNodeData(node.id, {
        content: result.text,
        status: 'completed',
      });

      return { text: result.text };
    },
    [updateNodeData]
  );

  const executeImageNode = useCallback(
    async (
      node: Node,
      inputImages: ConnectedImage[]
    ): Promise<ExecutionOutput> => {
      const nodeData = node.data as ImageNodeData;

      // Build combined prompt: node prompt + connected text contents
      let combinedPrompt = nodeData.prompt;
      if (nodeData.connectedSourceTexts?.length) {
        const textContents = nodeData.connectedSourceTexts
          .map(t => t.content.replace(/<[^>]*>/g, '').trim())
          .filter(t => t.length > 0);
        if (textContents.length > 0) {
          combinedPrompt = nodeData.prompt + '\n\n' + textContents.join('\n\n');
        }
      }

      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: combinedPrompt,
          model: nodeData.model,
          sourceImages: inputImages.map(img => img.url), // Array of URLs
          aspectRatio: nodeData.aspectRatio,
          quality: nodeData.quality,
        }),
      });

      const result = await response.json();

      if (result.error) {
        throw new Error(result.error);
      }

      // Load image to get dimensions
      return new Promise((resolve) => {
        const img = new window.Image();
        img.onload = () => {
          updateNodeData(node.id, {
            generatedImage: result.imageUrl,
            generatedImageMetadata: {
              width: img.width,
              height: img.height,
            },
            status: 'completed',
          });
          resolve({ imageUrl: result.imageUrl });
        };
        img.onerror = () => {
          // Fallback if image fails to load dimensions
          updateNodeData(node.id, {
            generatedImage: result.imageUrl,
            status: 'completed',
          });
          resolve({ imageUrl: result.imageUrl });
        };
        img.src = result.imageUrl;
      });
    },
    [updateNodeData]
  );

  const runGroup = useCallback(async () => {
    setIsRunning(true);
    setError(null);

    try {
      // 1. Get all child nodes within the group
      const childNodes = getGroupChildren(groupId, nodes);

      if (childNodes.length === 0) {
        throw new Error('No nodes found in this group');
      }

      // 2. Get relevant edges (including external sources)
      const childNodeIds = childNodes.map((n) => n.id);
      const relevantEdges = getRelevantEdges(childNodeIds, edges);

      // 3. Validate prompts on executable nodes
      const executableNodes = getExecutableNodes(childNodes);
      const validation = validateNodePrompts(executableNodes);

      if (!validation.valid) {
        // Mark invalid nodes with error status
        for (const node of executableNodes) {
          const nodeData = node.data as TextNodeData | ImageNodeData;
          const nodeName = nodeData?.name || node.id;
          if (validation.invalidNodes.includes(nodeName)) {
            updateNodeData(node.id, { status: 'error', error: 'Missing prompt' });
          }
        }
        throw new Error(
          `Nodes without prompts: ${validation.invalidNodes.join(', ')}`
        );
      }

      // 4. Topological sort to get execution order
      const sortedNodes = topologicalSort(childNodes, relevantEdges);

      // 5. Filter to only executable nodes in sorted order
      const nodesToExecute = sortedNodes.filter(
        (n) => n.type === 'text' || n.type === 'image'
      );

      if (nodesToExecute.length === 0) {
        throw new Error('No executable nodes in this group (only source nodes)');
      }

      setProgress({
        completed: 0,
        total: nodesToExecute.length,
        currentNode: null,
      });

      // 6. Reset status on all nodes to be executed
      for (const node of nodesToExecute) {
        updateNodeData(node.id, { status: 'idle', error: undefined });
      }

      // 7. Execute nodes sequentially
      const executionOutputs = new Map<string, ExecutionOutput>();

      for (let i = 0; i < nodesToExecute.length; i++) {
        const node = nodesToExecute[i];
        const nodeData = node.data as TextNodeData | ImageNodeData;
        const nodeName = nodeData?.name || node.id;

        setProgress({
          completed: i,
          total: nodesToExecute.length,
          currentNode: nodeName,
        });

        // Set node status to processing
        updateNodeData(node.id, { status: 'processing' });

        try {
          // Get input images from connected nodes
          const inputImages = getNodeInputImages(
            node.id,
            relevantEdges,
            executionOutputs,
            nodes
          );

          // Execute based on node type
          let output: ExecutionOutput;

          if (node.type === 'text') {
            output = await executeTextNode(node, inputImages);
          } else if (node.type === 'image') {
            output = await executeImageNode(node, inputImages);
          } else {
            // Skip other node types
            continue;
          }

          // Store output for downstream nodes
          executionOutputs.set(node.id, output);
        } catch (err) {
          // Mark node as failed
          const errorMessage = err instanceof Error ? err.message : 'Unknown error';
          updateNodeData(node.id, {
            status: 'error',
            error: errorMessage,
          });
          throw new Error(`Node '${nodeName}' failed: ${errorMessage}`);
        }
      }

      // All done!
      setProgress({
        completed: nodesToExecute.length,
        total: nodesToExecute.length,
        currentNode: null,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    } finally {
      setIsRunning(false);
    }
  }, [
    groupId,
    nodes,
    edges,
    updateNodeData,
    executeTextNode,
    executeImageNode,
  ]);

  return {
    runGroup,
    isRunning,
    progress,
    error,
  };
}
