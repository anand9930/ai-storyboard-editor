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
import type { AppNodeData } from '@/types/nodes';

export type ColorMode = 'dark' | 'light';

// Selection change params (matches React Flow's OnSelectionChangeParams)
interface SelectionChangeParams {
  nodes: Node[];
  edges: Edge[];
}

interface WorkflowState {
  // Workflow data
  nodes: Node[];
  edges: Edge[];

  // Selection state (synced via onSelectionChange)
  selectedNodeIds: string[];
  selectedEdgeIds: string[];

  // Project metadata
  projectName: string;

  // Theme
  colorMode: ColorMode;

  // Actions
  setNodes: (nodes: Node[]) => void;
  setEdges: (edges: Edge[]) => void;
  setProjectName: (name: string) => void;
  setColorMode: (mode: ColorMode) => void;
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  addNode: (node: Node) => void;
  addEdge: (edge: Edge) => void;
  updateNodeData: (nodeId: string, data: Partial<AppNodeData>) => void;
  deleteNode: (nodeId: string) => void;

  // Selection actions
  setSelection: (params: SelectionChangeParams) => void;
  setSelectedNodeIds: (nodeIds: string[]) => void;

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
      selectedNodeIds: [],
      selectedEdgeIds: [],
      projectName: 'Untitled',
      colorMode: 'dark' as ColorMode,

      setNodes: (nodes) => set({ nodes }),
      setEdges: (edges) => set({ edges }),
      setProjectName: (name) => set({ projectName: name }),
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
          nodes: [
            ...state.nodes.map((n) => ({ ...n, selected: false })),
            { ...node, selected: true },
          ],
          selectedNodeIds: [node.id],
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
          selectedNodeIds: state.selectedNodeIds.filter((id) => id !== nodeId),
          selectedEdgeIds: state.selectedEdgeIds.filter((id) => {
            const edge = state.edges.find((e) => e.id === id);
            return edge && edge.source !== nodeId && edge.target !== nodeId;
          }),
        })),

      // Selection actions - synced via onSelectionChange callback
      setSelection: ({ nodes, edges }) =>
        set({
          selectedNodeIds: nodes.map((n) => n.id),
          selectedEdgeIds: edges.map((e) => e.id),
        }),

      setSelectedNodeIds: (nodeIds) => set({ selectedNodeIds: nodeIds }),

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
            selectedNodeIds: [],
            selectedEdgeIds: [],
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
          selectedNodeIds: [],
          selectedEdgeIds: [],
        }),
    }),
    {
      name: 'storyboard-workflow',
      partialize: (state) => ({
        nodes: state.nodes,
        edges: state.edges,
        projectName: state.projectName,
        colorMode: state.colorMode,
      }),
    }
  )
);

