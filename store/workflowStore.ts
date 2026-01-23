import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  Node,
  Edge,
  applyNodeChanges,
  applyEdgeChanges,
  NodeChange,
  EdgeChange,
} from '@xyflow/react';

export type ColorMode = 'dark' | 'light';

interface WorkflowState {
  // Workflow data
  nodes: Node[];
  edges: Edge[];
  selectedNodeId: string | null;

  // Theme
  colorMode: ColorMode;

  // Actions
  setNodes: (nodes: Node[]) => void;
  setEdges: (edges: Edge[]) => void;
  setColorMode: (mode: ColorMode) => void;
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  addNode: (node: Node) => void;
  addEdge: (edge: Edge) => void;
  updateNodeData: (nodeId: string, data: Partial<any>) => void;
  deleteNode: (nodeId: string) => void;
  setSelectedNodeId: (nodeId: string | null) => void;

  // Workflow management
  exportWorkflow: () => string;
  importWorkflow: (json: string) => void;
  clearWorkflow: () => void;
}

export const useWorkflowStore = create<WorkflowState>()(
  persist(
    (set, get) => ({
      // Initial state
      nodes: [],
      edges: [],
      selectedNodeId: null,
      colorMode: 'dark' as ColorMode,

      setNodes: (nodes) => set({ nodes }),
      setEdges: (edges) => set({ edges }),
      setColorMode: (mode) => set({ colorMode: mode }),

      onNodesChange: (changes) => {
        set({
          nodes: applyNodeChanges(changes, get().nodes),
        });
      },

      onEdgesChange: (changes) => {
        set({
          edges: applyEdgeChanges(changes, get().edges),
        });
      },

      addNode: (node) =>
        set((state) => ({
          nodes: [...state.nodes, node],
        })),

      addEdge: (edge) =>
        set((state) => ({
          edges: [...state.edges, edge],
        })),

      updateNodeData: (nodeId, data) =>
        set((state) => ({
          nodes: state.nodes.map((node) =>
            node.id === nodeId
              ? { ...node, data: { ...node.data, ...data } }
              : node
          ),
        })),

      deleteNode: (nodeId) =>
        set((state) => ({
          nodes: state.nodes.filter((node) => node.id !== nodeId),
          edges: state.edges.filter(
            (edge) => edge.source !== nodeId && edge.target !== nodeId
          ),
          selectedNodeId:
            state.selectedNodeId === nodeId ? null : state.selectedNodeId,
        })),

      setSelectedNodeId: (nodeId) => set({ selectedNodeId: nodeId }),

      // Export workflow to JSON string
      exportWorkflow: () => {
        const { nodes, edges } = get();
        return JSON.stringify(
          {
            nodes,
            edges,
            exportedAt: new Date().toISOString(),
            version: '1.0',
          },
          null,
          2
        );
      },

      // Import workflow from JSON string
      importWorkflow: (json: string) => {
        try {
          const data = JSON.parse(json);
          set({
            nodes: data.nodes || [],
            edges: data.edges || [],
            selectedNodeId: null,
          });
        } catch (error) {
          console.error('Failed to import workflow:', error);
          throw new Error('Invalid workflow file');
        }
      },

      // Clear all workflow data
      clearWorkflow: () =>
        set({
          nodes: [],
          edges: [],
          selectedNodeId: null,
        }),
    }),
    {
      name: 'storyboard-workflow',
      partialize: (state) => ({
        nodes: state.nodes,
        edges: state.edges,
        colorMode: state.colorMode,
      }),
    }
  )
);
