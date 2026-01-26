'use client';

import { NodeToolbar, useStore, ReactFlowState, Position } from '@xyflow/react';
import { Group } from 'lucide-react';
import { useWorkflowStore } from '@/store/workflowStore';

// Selector to get selected node IDs (excluding group nodes from selection count)
const selectedNodesSelector = (state: ReactFlowState) =>
  state.nodes
    .filter((node) => node.selected && node.type !== 'group')
    .map((node) => node.id);

export function MultiSelectionToolbar() {
  const selectedNodeIds = useStore(selectedNodesSelector);
  const { groupNodes } = useWorkflowStore();

  // Only show when 2+ non-group nodes are selected
  const isVisible = selectedNodeIds.length >= 2;

  const handleGroup = () => {
    if (selectedNodeIds.length >= 2) {
      groupNodes(selectedNodeIds);
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
      <button
        onClick={handleGroup}
        className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-theme-text-primary hover:bg-interactive-hover rounded transition-colors"
        title="Group selected nodes"
      >
        <Group className="w-4 h-4" />
        Group
      </button>
    </NodeToolbar>
  );
}
