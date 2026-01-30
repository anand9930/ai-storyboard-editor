'use client';

import { NodeToolbar, useStore, ReactFlowState, Position } from '@xyflow/react';
import { Group, Plus } from 'lucide-react';
import { useWorkflowStore } from '@/features/flow/store/workflowStore';

// Get selected nodes with their parent info (excludes group nodes)
const selectedNodesDataSelector = (state: ReactFlowState) =>
  state.nodes
    .filter((node) => node.selected && node.type !== 'group')
    .map((node) => ({ id: node.id, parentId: node.parentId }));

// Custom equality function for selected nodes data
const selectedNodesDataEqual = (
  a: { id: string; parentId?: string }[],
  b: { id: string; parentId?: string }[]
) => {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i].id !== b[i].id || a[i].parentId !== b[i].parentId) return false;
  }
  return true;
};

// Check if a group node is selected - returns just the id for stable comparison
const selectedGroupIdSelector = (state: ReactFlowState) =>
  state.nodes.find((node) => node.selected && node.type === 'group')?.id ?? null;

export function MultiSelectionToolbar() {
  // Use custom equality to prevent re-renders when selected nodes haven't changed
  const selectedNodesData = useStore(selectedNodesDataSelector, selectedNodesDataEqual);
  const selectedGroupId = useStore(selectedGroupIdSelector);
  const { groupNodes, addNodesToGroup } = useWorkflowStore();

  const selectedNodeIds = selectedNodesData.map((n) => n.id);

  // Get unique parent IDs (excluding undefined/null)
  const parentIds = new Set(
    selectedNodesData.map((n) => n.parentId).filter((id): id is string => Boolean(id))
  );

  // Check if we have ungrouped nodes
  const ungroupedNodes = selectedNodesData.filter((n) => !n.parentId);
  const hasUngroupedNodes = ungroupedNodes.length > 0;

  // Check if nodes are from multiple different groups (ambiguous - hide button)
  const hasNodesFromMultipleGroups = parentIds.size > 1;

  // Determine which group to expand (if any)
  // Priority: selected group node > parent of selected children
  const existingGroupId = selectedGroupId || (parentIds.size === 1 ? [...parentIds][0] : null);

  // Determine button state:
  // - Hide if nodes from multiple different groups (ambiguous)
  // - Hide if all nodes already in same group (redundant)
  // - Show "Add to Group" if there's ONE existing group + ungrouped nodes
  // - Show "Group" if only ungrouped nodes (2+)
  const showAddToGroup = !hasNodesFromMultipleGroups && existingGroupId && hasUngroupedNodes;
  const showCreateGroup = !hasNodesFromMultipleGroups && !existingGroupId && ungroupedNodes.length >= 2;
  const isVisible = showAddToGroup || showCreateGroup;

  const handleGroup = () => {
    if (selectedNodeIds.length >= 2) {
      groupNodes(selectedNodeIds);
    }
  };

  const handleAddToGroup = () => {
    if (existingGroupId && ungroupedNodes.length > 0) {
      addNodesToGroup(
        existingGroupId,
        ungroupedNodes.map((n) => n.id)
      );
    }
  };

  if (!isVisible) return null;

  return (
    <NodeToolbar
      nodeId={selectedNodeIds}
      isVisible={isVisible}
      position={Position.Top}
      offset={20}
      className="flex gap-1 bg-surface-primary border border-node rounded-lg p-1 shadow-lg"
    >
      {showAddToGroup ? (
        <button
          onClick={handleAddToGroup}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-theme-text-primary hover:bg-interactive-hover rounded transition-colors"
          title="Add selected nodes to group"
        >
          <Plus className="w-4 h-4" />
          Add to Group
        </button>
      ) : showCreateGroup ? (
        <button
          onClick={handleGroup}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-theme-text-primary hover:bg-interactive-hover rounded transition-colors"
          title="Group selected nodes"
        >
          <Group className="w-4 h-4" />
          Group
        </button>
      ) : null}
    </NodeToolbar>
  );
}
