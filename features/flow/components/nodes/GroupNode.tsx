'use client';

import { memo, useState, useRef, useEffect, useCallback } from 'react';
import { NodeProps, Handle, Position, NodeResizer } from '@xyflow/react';
import type { GroupNode as GroupNodeType, GroupNodeData } from '@/features/flow/types/nodes';
import { useWorkflowStore } from '@/features/flow/store/workflowStore';
import { GroupToolbar } from '../toolbars/GroupToolbar';

// Color options for the group background
export const GROUP_COLORS = [
  { value: '#ef4444', label: 'Red' },
  { value: '#f97316', label: 'Orange' },
  { value: '#eab308', label: 'Yellow' },
  { value: '#22c55e', label: 'Green' },
  { value: '#06b6d4', label: 'Cyan' },
  { value: '#3b82f6', label: 'Blue' },
  { value: '#8b5cf6', label: 'Purple' },
];

function GroupNodeComponent({ data, id, selected }: NodeProps<GroupNodeType>) {
  const nodeData = data as GroupNodeData;
  const { updateGroupData } = useWorkflowStore();

  // Editable name state
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState(nodeData.name || 'New Group');
  const nameInputRef = useRef<HTMLInputElement>(null);

  // Update local state when name prop changes
  useEffect(() => {
    if (!isEditingName) {
      setEditedName(nodeData.name || 'New Group');
    }
  }, [nodeData.name, isEditingName]);

  // Focus input when entering edit mode
  useEffect(() => {
    if (isEditingName && nameInputRef.current) {
      nameInputRef.current.focus();
      nameInputRef.current.select();
    }
  }, [isEditingName]);

  const handleNameClick = useCallback(() => {
    setIsEditingName(true);
  }, []);

  const handleNameBlur = useCallback(() => {
    setIsEditingName(false);
    if (editedName.trim() && editedName !== nodeData.name) {
      updateGroupData(id, { name: editedName.trim() });
    } else {
      setEditedName(nodeData.name || 'New Group');
    }
  }, [editedName, nodeData.name, updateGroupData, id]);

  const handleNameKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleNameBlur();
      } else if (e.key === 'Escape') {
        setEditedName(nodeData.name || 'New Group');
        setIsEditingName(false);
      }
    },
    [handleNameBlur, nodeData.name]
  );

  // Parse the background color with opacity
  const backgroundColor = nodeData.backgroundColor || '#3b82f6';
  const bgColorWithOpacity = `${backgroundColor}1a`; // 10% opacity (1a in hex)
  const borderColor = `${backgroundColor}60`; // 37.5% opacity for better visibility
  const handleColor = `${backgroundColor}cc`; // 80% opacity for resize handles

  return (
    <>
      {/* Group Toolbar - Shows when selected */}
      <GroupToolbar
        groupId={id}
        isVisible={selected ?? false}
        backgroundColor={backgroundColor}
      />

      {/* Resizer - uses group color dynamically */}
      <NodeResizer
        minWidth={200}
        minHeight={150}
        isVisible={selected}
        lineStyle={{ borderColor: handleColor }}
        handleStyle={{ backgroundColor: handleColor, borderColor: 'white' }}
      />

      {/* Group Header with Name - Outside container to match BaseNode */}
      <div className="absolute -top-6 left-0 z-10">
        {isEditingName ? (
          <input
            ref={nameInputRef}
            type="text"
            value={editedName}
            onChange={(e) => setEditedName(e.target.value)}
            onBlur={handleNameBlur}
            onKeyDown={handleNameKeyDown}
            className="text-xs font-medium bg-transparent text-theme-text-primary outline-none min-w-[60px]"
            style={{ width: `${Math.max(60, editedName.length * 7)}px` }}
          />
        ) : (
          <span
            onClick={handleNameClick}
            className="text-xs font-medium text-theme-text-secondary cursor-text hover:text-theme-text-primary transition-colors"
            title="Click to edit name"
          >
            {nodeData.name || 'New Group'}
          </span>
        )}
      </div>

      {/* Group Container */}
      <div
        className="w-full h-full rounded-xl transition-colors duration-200"
        style={{
          backgroundColor: bgColorWithOpacity,
          border: `2px ${selected ? 'dashed' : 'solid'} ${borderColor}`,
        }}
      >
        {/* Input Handle - Left side */}
        <Handle
          type="target"
          position={Position.Left}
          id="group-input"
          className="!w-3 !h-3"
          style={{ top: '50%' }}
        />

        {/* Output Handle - Right side */}
        <Handle
          type="source"
          position={Position.Right}
          id="group-output"
          className="!w-3 !h-3"
          style={{ top: '50%' }}
        />
      </div>
    </>
  );
}

export const GroupNode = memo(GroupNodeComponent);
