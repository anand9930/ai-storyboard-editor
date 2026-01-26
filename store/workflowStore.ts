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
import type { AppNodeData, GroupNodeData } from '@/types/nodes';

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

  // Credits
  credits: number;

  // Theme
  colorMode: ColorMode;

  // Actions
  setNodes: (nodes: Node[]) => void;
  setEdges: (edges: Edge[]) => void;
  setProjectName: (name: string) => void;
  setCredits: (credits: number) => void;
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

  // Grouping actions
  groupNodes: (nodeIds: string[]) => string | null; // Returns group ID or null if failed
  ungroupNode: (groupId: string) => void;
  updateGroupData: (groupId: string, data: Partial<GroupNodeData>) => void;
  layoutGroupChildren: (groupId: string, layout: 'grid' | 'horizontal') => void;
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
      credits: 1000,
      colorMode: 'dark' as ColorMode,

      setNodes: (nodes) => set({ nodes }),
      setEdges: (edges) => set({ edges }),
      setProjectName: (name) => set({ projectName: name }),
      setCredits: (credits) => set({ credits }),
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

      // Group selected nodes into a new group node
      groupNodes: (nodeIds: string[]) => {
        if (nodeIds.length < 2) return null;

        const { nodes } = get();
        const nodesToGroup = nodes.filter((n) => nodeIds.includes(n.id));

        if (nodesToGroup.length < 2) return null;

        // Skip nodes that are already in a group (have parentId)
        const ungroupedNodes = nodesToGroup.filter((n) => !n.parentId);
        if (ungroupedNodes.length < 2) return null;

        // Calculate bounding box of selected nodes
        const PADDING = 40;
        const HEADER_HEIGHT = 40; // Space for group name

        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

        ungroupedNodes.forEach((node) => {
          const width = node.measured?.width ?? node.width ?? 240;
          const height = node.measured?.height ?? node.height ?? 240;

          minX = Math.min(minX, node.position.x);
          minY = Math.min(minY, node.position.y);
          maxX = Math.max(maxX, node.position.x + width);
          maxY = Math.max(maxY, node.position.y + height);
        });

        // Create group node
        const groupId = `group-${Date.now()}`;
        const groupNode: Node = {
          id: groupId,
          type: 'group',
          position: {
            x: minX - PADDING,
            y: minY - PADDING - HEADER_HEIGHT,
          },
          data: {
            name: 'New Group',
            backgroundColor: '#3b82f6',
          },
          style: {
            width: maxX - minX + PADDING * 2,
            height: maxY - minY + PADDING * 2 + HEADER_HEIGHT,
          },
          zIndex: -1, // Group should be behind children
        };

        // Update children to have parentId and relative positions
        const updatedNodes = nodes.map((node) => {
          if (ungroupedNodes.find((n) => n.id === node.id)) {
            return {
              ...node,
              parentId: groupId,
              extent: 'parent' as const,
              position: {
                x: node.position.x - (minX - PADDING),
                y: node.position.y - (minY - PADDING - HEADER_HEIGHT),
              },
            };
          }
          return node;
        });

        set({
          nodes: [groupNode, ...updatedNodes],
          selectedNodeIds: [groupId],
        });

        return groupId;
      },

      // Ungroup a group node - convert children back to independent nodes
      ungroupNode: (groupId: string) => {
        const { nodes } = get();
        const groupNode = nodes.find((n) => n.id === groupId && n.type === 'group');

        if (!groupNode) return;

        // Get group's absolute position
        const groupX = groupNode.position.x;
        const groupY = groupNode.position.y;

        // Update children to remove parentId and convert to absolute positions
        const childIds: string[] = [];
        const updatedNodes = nodes
          .filter((n) => n.id !== groupId) // Remove the group node
          .map((node) => {
            if (node.parentId === groupId) {
              childIds.push(node.id);
              return {
                ...node,
                parentId: undefined,
                extent: undefined,
                position: {
                  x: node.position.x + groupX,
                  y: node.position.y + groupY,
                },
              };
            }
            return node;
          });

        set({
          nodes: updatedNodes,
          selectedNodeIds: childIds, // Select the ungrouped nodes
        });
      },

      // Update group node data (name, backgroundColor)
      updateGroupData: (groupId: string, data: Partial<GroupNodeData>) => {
        set((state) => ({
          nodes: state.nodes.map((node) =>
            node.id === groupId
              ? { ...node, data: { ...node.data, ...data } }
              : node
          ),
        }));
      },

      // Layout children within a group
      layoutGroupChildren: (groupId: string, layout: 'grid' | 'horizontal') => {
        const { nodes } = get();
        const groupNode = nodes.find((n) => n.id === groupId && n.type === 'group');

        if (!groupNode) return;

        const children = nodes.filter((n) => n.parentId === groupId);
        if (children.length === 0) return;

        const PADDING = 40;
        const GAP = 20;
        const HEADER_HEIGHT = 40;

        // Get node dimensions
        const getNodeDims = (node: Node) => ({
          width: node.measured?.width ?? node.width ?? 240,
          height: node.measured?.height ?? node.height ?? 240,
        });

        let newPositions: { id: string; position: { x: number; y: number } }[] = [];
        let newGroupWidth = 0;
        let newGroupHeight = 0;

        if (layout === 'horizontal') {
          // Arrange in a single row
          let currentX = PADDING;
          const maxHeight = Math.max(...children.map((c) => getNodeDims(c).height));

          children.forEach((child) => {
            const dims = getNodeDims(child);
            newPositions.push({
              id: child.id,
              position: {
                x: currentX,
                y: PADDING + HEADER_HEIGHT,
              },
            });
            currentX += dims.width + GAP;
          });

          newGroupWidth = currentX - GAP + PADDING;
          newGroupHeight = maxHeight + PADDING * 2 + HEADER_HEIGHT;
        } else {
          // Grid layout - arrange in rows based on container width
          const containerWidth = (groupNode.style?.width as number) || 600;
          const maxNodesPerRow = Math.max(1, Math.floor((containerWidth - PADDING * 2) / (240 + GAP)));

          let currentX = PADDING;
          let currentY = PADDING + HEADER_HEIGHT;
          let rowHeight = 0;
          let nodesInRow = 0;
          let maxRowWidth = 0;

          children.forEach((child) => {
            const dims = getNodeDims(child);

            if (nodesInRow >= maxNodesPerRow) {
              // Move to next row
              currentX = PADDING;
              currentY += rowHeight + GAP;
              rowHeight = 0;
              nodesInRow = 0;
            }

            newPositions.push({
              id: child.id,
              position: { x: currentX, y: currentY },
            });

            currentX += dims.width + GAP;
            rowHeight = Math.max(rowHeight, dims.height);
            nodesInRow++;
            maxRowWidth = Math.max(maxRowWidth, currentX - GAP + PADDING);
          });

          newGroupWidth = maxRowWidth;
          newGroupHeight = currentY + rowHeight + PADDING;
        }

        // Update node positions
        const updatedNodes = nodes.map((node) => {
          const newPos = newPositions.find((p) => p.id === node.id);
          if (newPos) {
            return { ...node, position: newPos.position };
          }
          if (node.id === groupId) {
            return {
              ...node,
              style: {
                ...node.style,
                width: newGroupWidth,
                height: newGroupHeight,
              },
            };
          }
          return node;
        });

        set({ nodes: updatedNodes });
      },
    }),
    {
      name: 'storyboard-workflow',
      partialize: (state) => ({
        nodes: state.nodes,
        edges: state.edges,
        projectName: state.projectName,
        credits: state.credits,
        colorMode: state.colorMode,
      }),
    }
  )
);

