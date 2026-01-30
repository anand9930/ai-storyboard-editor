import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { temporal } from 'zundo';
import {
  Node,
  Edge,
  applyNodeChanges,
  applyEdgeChanges,
  NodeChange,
  EdgeChange,
} from '@xyflow/react';
import type { AppNodeData, GroupNodeData } from '@/features/flow/types/nodes';

export type ColorMode = 'dark' | 'light';

// Flag to batch history entries when node+edge removals happen together
// React Flow fires onEdgesChange and onNodesChange separately during deletion,
// so we use microtask batching to combine them into a single history entry.
let historyBatchScheduled = false;

/**
 * Sorts nodes to ensure parent nodes always appear before their children.
 * This is required by React Flow for proper parent-child relationships.
 */
function sortNodesWithParentsFirst(nodes: Node[]): Node[] {
  const nodeMap = new Map(nodes.map((n) => [n.id, n]));
  const sorted: Node[] = [];
  const visited = new Set<string>();

  function visit(nodeId: string) {
    if (visited.has(nodeId)) return;
    const node = nodeMap.get(nodeId);
    if (!node) return;

    // Visit parent first to ensure it appears before this node
    if (node.parentId && nodeMap.has(node.parentId)) {
      visit(node.parentId);
    }

    visited.add(nodeId);
    sorted.push(node);
  }

  // Visit all nodes
  for (const node of nodes) {
    visit(node.id);
  }

  return sorted;
}

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

  // Clipboard for copy/paste (includes children for group nodes)
  clipboard: { node: Node; children: Node[] } | null;

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

  // Node operations (copy/duplicate/paste)
  copyNode: (nodeId: string) => void;
  duplicateNode: (nodeId: string) => void;
  pasteNode: (position?: { x: number; y: number }) => void;

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
  addNodesToGroup: (groupId: string, nodeIds: string[]) => void; // Add nodes to existing group
  updateGroupData: (groupId: string, data: Partial<GroupNodeData>) => void;
  layoutGroupChildren: (groupId: string, layout: 'grid' | 'horizontal') => void;
}

export const useWorkflowStore = create<WorkflowState>()(
  temporal(
    persist(
      (set, get) => ({
        // Initial state
        nodes: [],
        edges: [],
        selectedNodeIds: [],
        selectedEdgeIds: [],
        clipboard: null,
        projectName: 'Untitled',
        credits: 1000,
        colorMode: 'dark' as ColorMode,

      setNodes: (nodes) => set({ nodes: sortNodesWithParentsFirst(nodes) }),
      setEdges: (edges) => set({ edges }),
      setProjectName: (name) => set({ projectName: name }),
      setCredits: (credits) => set({ credits }),
      setColorMode: (mode) => set({ colorMode: mode }),

      onNodesChange: (changes) => {
        // Batch removal changes with edges to create single undo entry
        const hasRemoval = changes.some((c) => c.type === 'remove');

        if (hasRemoval && !historyBatchScheduled) {
          useWorkflowStore.temporal.getState().pause();
          historyBatchScheduled = true;

          queueMicrotask(() => {
            useWorkflowStore.temporal.getState().resume();
            historyBatchScheduled = false;
          });
        }

        set({
          nodes: applyNodeChanges(changes, get().nodes),
        });
      },

      onEdgesChange: (changes) => {
        // Batch removal changes with nodes to create single undo entry
        const hasRemoval = changes.some((c) => c.type === 'remove');

        if (hasRemoval && !historyBatchScheduled) {
          useWorkflowStore.temporal.getState().pause();
          historyBatchScheduled = true;

          queueMicrotask(() => {
            useWorkflowStore.temporal.getState().resume();
            historyBatchScheduled = false;
          });
        }

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
        set((state) => {
          // Collect all node IDs to delete (the node itself + any children if it's a group)
          const idsToDelete = new Set<string>([nodeId]);

          // If deleting a group, also delete all its children
          state.nodes.forEach((node) => {
            if (node.parentId === nodeId) {
              idsToDelete.add(node.id);
            }
          });

          return {
            nodes: state.nodes.filter((node) => !idsToDelete.has(node.id)),
            edges: state.edges.filter(
              (edge) => !idsToDelete.has(edge.source) && !idsToDelete.has(edge.target)
            ),
            selectedNodeIds: state.selectedNodeIds.filter((id) => !idsToDelete.has(id)),
            selectedEdgeIds: state.selectedEdgeIds.filter((id) => {
              const edge = state.edges.find((e) => e.id === id);
              return edge && !idsToDelete.has(edge.source) && !idsToDelete.has(edge.target);
            }),
          };
        }),

      // Copy node to clipboard (includes children for group nodes)
      copyNode: (nodeId: string) => {
        const { nodes } = get();
        const node = nodes.find((n) => n.id === nodeId);
        if (!node) return;

        // Deep copy the node
        const copiedNode: Node = JSON.parse(JSON.stringify(node));

        // If it's a group, also copy all children
        const children: Node[] =
          node.type === 'group'
            ? nodes
                .filter((n) => n.parentId === nodeId)
                .map((child) => JSON.parse(JSON.stringify(child)))
            : [];

        set({ clipboard: { node: copiedNode, children } });
      },

      // Duplicate node - creates a copy with offset position
      // For group nodes, also duplicates all children (deep copy)
      duplicateNode: (nodeId: string) => {
        const { nodes } = get();
        const node = nodes.find((n) => n.id === nodeId);
        if (!node) return;

        const nodeType = node.type || 'node';
        const timestamp = Date.now();

        // Handle group nodes - deep copy with all children
        if (nodeType === 'group') {
          const children = nodes.filter((n) => n.parentId === nodeId);
          const newGroupId = `group-${timestamp}`;

          // Create new group node
          const newGroup: Node = JSON.parse(JSON.stringify(node));
          newGroup.id = newGroupId;
          newGroup.position = {
            x: node.position.x + 40,
            y: node.position.y + 40,
          };
          newGroup.selected = true;

          // Create new children with updated parentId
          const newChildren: Node[] = children.map((child, index) => {
            const newChild: Node = JSON.parse(JSON.stringify(child));
            newChild.id = `${child.type}-${timestamp}-${index}`;
            newChild.parentId = newGroupId;
            newChild.selected = false;

            // Reset generation state for children
            if (newChild.data) {
              newChild.data = {
                ...newChild.data,
                status: 'idle',
                error: undefined,
              };
              if (child.type === 'image') {
                newChild.data.generatedImage = undefined;
                newChild.data.generatedImageMetadata = undefined;
              } else if (child.type === 'text') {
                newChild.data.content = '';
              }
            }

            return newChild;
          });

          // Add group first, then children (required order for React Flow)
          set((state) => ({
            nodes: [
              ...state.nodes.map((n) => ({ ...n, selected: false })),
              newGroup,
              ...newChildren,
            ],
            selectedNodeIds: [newGroupId],
          }));

          return;
        }

        // Handle non-group nodes (original logic)
        const duplicatedNode: Node = JSON.parse(JSON.stringify(node));
        duplicatedNode.id = `${nodeType}-${timestamp}`;

        // Offset position
        duplicatedNode.position = {
          x: node.position.x + 20,
          y: node.position.y + 20,
        };

        // Reset generation state for text/image nodes
        if (duplicatedNode.data) {
          duplicatedNode.data = {
            ...duplicatedNode.data,
            status: 'idle',
            error: undefined,
          };

          // Reset generated content based on node type
          if (nodeType === 'image') {
            duplicatedNode.data.generatedImage = undefined;
            duplicatedNode.data.generatedImageMetadata = undefined;
          } else if (nodeType === 'text') {
            duplicatedNode.data.content = '';
          }
        }

        // Remove parent constraints if it was in a group
        duplicatedNode.parentId = undefined;
        duplicatedNode.extent = undefined;

        // Add the duplicated node and select it
        set((state) => ({
          nodes: [
            ...state.nodes.map((n) => ({ ...n, selected: false })),
            { ...duplicatedNode, selected: true },
          ],
          selectedNodeIds: [duplicatedNode.id],
        }));
      },

      // Paste node from clipboard (includes children for group nodes)
      pasteNode: (position?: { x: number; y: number }) => {
        const { clipboard } = get();
        if (!clipboard) return;

        const { node: clipboardNode, children: clipboardChildren } = clipboard;
        const nodeType = clipboardNode.type || 'node';
        const timestamp = Date.now();

        // Handle group nodes - paste with all children
        if (nodeType === 'group' && clipboardChildren.length > 0) {
          const newGroupId = `group-${timestamp}`;

          // Create new group node
          const pastedGroup: Node = JSON.parse(JSON.stringify(clipboardNode));
          pastedGroup.id = newGroupId;
          pastedGroup.selected = true;

          // Set position
          if (position) {
            pastedGroup.position = position;
          } else {
            pastedGroup.position = {
              x: clipboardNode.position.x + 40,
              y: clipboardNode.position.y + 40,
            };
          }

          // Create new children with updated parentId
          const pastedChildren: Node[] = clipboardChildren.map((child, index) => {
            const newChild: Node = JSON.parse(JSON.stringify(child));
            newChild.id = `${child.type}-${timestamp}-${index}`;
            newChild.parentId = newGroupId;
            newChild.selected = false;

            // Reset generation state
            if (newChild.data) {
              newChild.data = {
                ...newChild.data,
                status: 'idle',
                error: undefined,
              };
              if (child.type === 'image') {
                newChild.data.generatedImage = undefined;
                newChild.data.generatedImageMetadata = undefined;
              } else if (child.type === 'text') {
                newChild.data.content = '';
              }
            }

            return newChild;
          });

          // Add group first, then children (required order for React Flow)
          set((state) => ({
            nodes: [
              ...state.nodes.map((n) => ({ ...n, selected: false })),
              pastedGroup,
              ...pastedChildren,
            ],
            selectedNodeIds: [newGroupId],
          }));

          return;
        }

        // Handle non-group nodes (original logic)
        const pastedNode: Node = JSON.parse(JSON.stringify(clipboardNode));
        pastedNode.id = `${nodeType}-${timestamp}`;

        // Set position (use provided position or offset from original)
        if (position) {
          pastedNode.position = position;
        } else {
          pastedNode.position = {
            x: clipboardNode.position.x + 40,
            y: clipboardNode.position.y + 40,
          };
        }

        // Reset generation state
        if (pastedNode.data) {
          pastedNode.data = {
            ...pastedNode.data,
            status: 'idle',
            error: undefined,
          };

          if (nodeType === 'image') {
            pastedNode.data.generatedImage = undefined;
            pastedNode.data.generatedImageMetadata = undefined;
          } else if (nodeType === 'text') {
            pastedNode.data.content = '';
          }
        }

        // Remove parent constraints
        pastedNode.parentId = undefined;
        pastedNode.extent = undefined;

        // Add the pasted node and select it
        set((state) => ({
          nodes: [
            ...state.nodes.map((n) => ({ ...n, selected: false })),
            { ...pastedNode, selected: true },
          ],
          selectedNodeIds: [pastedNode.id],
        }));
      },

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
            // Sort nodes to ensure parents appear before children
            nodes: sortNodesWithParentsFirst(data.nodes || []),
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

      // Add ungrouped nodes to an existing group (expands group to fit)
      addNodesToGroup: (groupId: string, nodeIds: string[]) => {
        const { nodes } = get();
        const groupNode = nodes.find((n) => n.id === groupId && n.type === 'group');

        if (!groupNode) return;

        // Get nodes to add (only ungrouped nodes, not group nodes)
        const nodesToAdd = nodes.filter(
          (n) => nodeIds.includes(n.id) && !n.parentId && n.type !== 'group'
        );

        if (nodesToAdd.length === 0) return;

        // Get current group bounds
        const groupX = groupNode.position.x;
        const groupY = groupNode.position.y;
        const groupWidth = (groupNode.style?.width as number) || 400;
        const groupHeight = (groupNode.style?.height as number) || 300;

        const PADDING = 40;
        const HEADER_HEIGHT = 40;

        // Calculate new bounding box including new nodes
        let minX = groupX;
        let minY = groupY;
        let maxX = groupX + groupWidth;
        let maxY = groupY + groupHeight;

        // Expand bounds to include new nodes
        nodesToAdd.forEach((node) => {
          const width = node.measured?.width ?? node.width ?? 240;
          const height = node.measured?.height ?? node.height ?? 240;

          minX = Math.min(minX, node.position.x - PADDING);
          minY = Math.min(minY, node.position.y - PADDING - HEADER_HEIGHT);
          maxX = Math.max(maxX, node.position.x + width + PADDING);
          maxY = Math.max(maxY, node.position.y + height + PADDING);
        });

        // Calculate position offset if group origin moved
        const offsetX = groupX - minX;
        const offsetY = groupY - minY;

        // Update nodes
        const updatedNodes = nodes.map((node) => {
          // Update the group node dimensions and position
          if (node.id === groupId) {
            return {
              ...node,
              position: { x: minX, y: minY },
              style: {
                ...node.style,
                width: maxX - minX,
                height: maxY - minY,
              },
            };
          }

          // Update existing children positions if group moved
          if (node.parentId === groupId && (offsetX !== 0 || offsetY !== 0)) {
            return {
              ...node,
              position: {
                x: node.position.x + offsetX,
                y: node.position.y + offsetY,
              },
            };
          }

          // Add new nodes to group
          if (nodesToAdd.find((n) => n.id === node.id)) {
            return {
              ...node,
              parentId: groupId,
              extent: 'parent' as const,
              position: {
                x: node.position.x - minX,
                y: node.position.y - minY,
              },
            };
          }

          return node;
        });

        set({
          nodes: sortNodesWithParentsFirst(updatedNodes),
          selectedNodeIds: [groupId],
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
    ),
    {
      // Only track nodes and edges in undo/redo history (not selection, clipboard, etc.)
      partialize: (state) => ({
        nodes: state.nodes,
        edges: state.edges,
      }),
      // Limit history to 100 states to prevent memory issues
      limit: 100,
      // Custom equality check to prevent duplicate history entries
      equality: (pastState, currentState) =>
        JSON.stringify(pastState) === JSON.stringify(currentState),
    }
  )
);

