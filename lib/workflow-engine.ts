import { Node, Edge } from '@xyflow/react';

export class WorkflowEngine {
  private nodes: Node[];
  private edges: Edge[];
  private nodeResults: Map<string, any>;

  constructor(nodes: Node[], edges: Edge[]) {
    this.nodes = nodes;
    this.edges = edges;
    this.nodeResults = new Map();
  }

  /**
   * Get the topological execution order using Kahn's algorithm
   */
  getExecutionOrder(): string[] {
    const inDegree = new Map<string, number>();
    const adjacencyList = new Map<string, string[]>();

    // Initialize
    this.nodes.forEach((node) => {
      inDegree.set(node.id, 0);
      adjacencyList.set(node.id, []);
    });

    // Build graph
    this.edges.forEach((edge) => {
      adjacencyList.get(edge.source)!.push(edge.target);
      inDegree.set(edge.target, (inDegree.get(edge.target) || 0) + 1);
    });

    // Start with nodes that have no incoming edges
    const queue: string[] = [];
    inDegree.forEach((degree, nodeId) => {
      if (degree === 0) queue.push(nodeId);
    });

    const order: string[] = [];
    while (queue.length > 0) {
      const nodeId = queue.shift()!;
      order.push(nodeId);

      adjacencyList.get(nodeId)!.forEach((neighbor) => {
        const newDegree = inDegree.get(neighbor)! - 1;
        inDegree.set(neighbor, newDegree);
        if (newDegree === 0) queue.push(neighbor);
      });
    }

    // Check for circular dependencies
    if (order.length !== this.nodes.length) {
      throw new Error('Circular dependency detected in workflow');
    }

    return order;
  }

  /**
   * Get inputs for a node from its connected source nodes
   */
  getNodeInputs(nodeId: string): Record<string, any> {
    const inputs: Record<string, any> = {};
    const incomingEdges = this.edges.filter((edge) => edge.target === nodeId);

    incomingEdges.forEach((edge) => {
      const sourceResult = this.nodeResults.get(edge.source);
      const inputName = edge.targetHandle || 'default';
      inputs[inputName] = sourceResult;
    });

    return inputs;
  }

  /**
   * Execute a single node
   */
  async executeNode(node: Node, inputs: Record<string, any>): Promise<any> {
    let result;

    switch (node.type) {
      case 'source':
        // Source nodes pass through their uploaded image
        result = node.data.image;
        break;

      case 'text':
        result = await this.executeTextNode(node, inputs);
        break;

      case 'image':
        result = await this.executeImageNode(node, inputs);
        break;

      default:
        result = node.data;
    }

    this.nodeResults.set(node.id, result);
    return result;
  }

  /**
   * Execute a text node
   */
  private async executeTextNode(
    node: Node,
    inputs: Record<string, any>
  ): Promise<any> {
    const { selectedAction, content } = node.data;

    // If user wrote their own content, return it
    if (selectedAction === 'write' && content) {
      return { text: content };
    }

    // If "Prompt from Image", analyze connected image
    if (selectedAction === 'prompt_from_image') {
      const sourceImage = inputs.any?.url || inputs.image?.url;
      if (!sourceImage) {
        throw new Error('No image connected for "Prompt from Image"');
      }

      const response = await fetch('/api/analyze-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl: sourceImage }),
      });

      if (!response.ok) {
        throw new Error('Failed to analyze image');
      }

      return response.json();
    }

    // Default: generate text from prompt
    const prompt = node.data.prompt || content;
    if (!prompt) {
      return { text: '' };
    }

    const response = await fetch('/api/generate-text', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt }),
    });

    if (!response.ok) {
      throw new Error('Failed to generate text');
    }

    return response.json();
  }

  /**
   * Execute an image node
   */
  private async executeImageNode(
    node: Node,
    inputs: Record<string, any>
  ): Promise<any> {
    const { prompt } = node.data;

    // Get source image from connected node
    const sourceImage = inputs.any?.url || inputs.image?.url;

    const response = await fetch('/api/generate-image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt,
        sourceImage,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to generate image');
    }

    return response.json();
  }

  /**
   * Execute the entire workflow
   */
  async execute(
    onProgress?: (nodeId: string, progress: number) => void
  ): Promise<Map<string, any>> {
    const executionOrder = this.getExecutionOrder();

    for (let i = 0; i < executionOrder.length; i++) {
      const nodeId = executionOrder[i];
      const node = this.nodes.find((n) => n.id === nodeId);

      if (!node) continue;

      const inputs = this.getNodeInputs(nodeId);

      try {
        await this.executeNode(node, inputs);

        if (onProgress) {
          onProgress(nodeId, ((i + 1) / executionOrder.length) * 100);
        }
      } catch (error) {
        console.error(`Error executing node ${nodeId}:`, error);
        throw error;
      }
    }

    return this.nodeResults;
  }

  /**
   * Get results for all nodes
   */
  getResults(): Map<string, any> {
    return this.nodeResults;
  }
}
