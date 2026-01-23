'use client';

import { ReactNode, useState, useRef, useEffect, useCallback, MouseEvent as ReactMouseEvent } from 'react';
import { Handle, Position, NodeResizer, NodeToolbar } from '@xyflow/react';
import { Trash2, Copy, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { NodeStatus } from '@/types/nodes';
import { useWorkflowStore } from '@/store/workflowStore';

// Magnetic button constants
const MAGNETIC_RADIUS = 80;
const MAGNETIC_STRENGTH = 0.3;

interface BaseNodeProps {
  id: string;
  children: ReactNode;
  handles?: {
    inputs?: string[];
    outputs?: string[];
  };
  className?: string;
  selected?: boolean;
  status?: NodeStatus;
  resizable?: boolean;
  minWidth?: number;
  minHeight?: number;
  showToolbar?: boolean;
  onPlusClick?: (side: 'left' | 'right') => void;
  plusDisabled?: boolean;
  toolbarContent?: ReactNode;
  nodeName?: string;
  onNameChange?: (newName: string) => void;
}

export function BaseNode({
  id,
  children,
  handles = {},
  className,
  selected,
  status = 'idle',
  resizable = false,
  minWidth = 240,
  minHeight = 100,
  showToolbar = true,
  onPlusClick,
  plusDisabled = false,
  toolbarContent,
  nodeName,
  onNameChange,
}: BaseNodeProps) {
  const { inputs = [], outputs = [] } = handles;
  const { deleteNode, addNode, nodes } = useWorkflowStore();

  // Editable name state
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState(nodeName || '');
  const nameInputRef = useRef<HTMLInputElement>(null);

  // Magnetic button state - separate for left and right buttons
  const [magneticOffsetRight, setMagneticOffsetRight] = useState({ x: 0, y: 0 });
  const [magneticOffsetLeft, setMagneticOffsetLeft] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const plusButtonRightRef = useRef<HTMLButtonElement>(null);
  const plusButtonLeftRef = useRef<HTMLButtonElement>(null);

  // Helper function to calculate magnetic offset for a button
  const calculateMagneticOffset = useCallback((
    e: ReactMouseEvent<HTMLDivElement>,
    buttonRef: React.RefObject<HTMLButtonElement | null>
  ) => {
    if (!buttonRef.current) return { x: 0, y: 0 };

    const rect = buttonRef.current.getBoundingClientRect();
    const buttonCenterX = rect.left + rect.width / 2;
    const buttonCenterY = rect.top + rect.height / 2;

    const distance = Math.sqrt(
      Math.pow(e.clientX - buttonCenterX, 2) +
      Math.pow(e.clientY - buttonCenterY, 2)
    );

    if (distance < MAGNETIC_RADIUS) {
      const strength = 1 - distance / MAGNETIC_RADIUS;
      return {
        x: (e.clientX - buttonCenterX) * strength * MAGNETIC_STRENGTH,
        y: (e.clientY - buttonCenterY) * strength * MAGNETIC_STRENGTH,
      };
    }
    return { x: 0, y: 0 };
  }, []);

  // Handle mouse move for magnetic effect on both buttons
  const handleMouseMove = useCallback((e: ReactMouseEvent<HTMLDivElement>) => {
    if (!onPlusClick) return;

    setMagneticOffsetRight(calculateMagneticOffset(e, plusButtonRightRef));
    setMagneticOffsetLeft(calculateMagneticOffset(e, plusButtonLeftRef));
  }, [onPlusClick, calculateMagneticOffset]);

  // Reset magnetic offset when mouse leaves
  const handleMouseLeave = useCallback(() => {
    setMagneticOffsetRight({ x: 0, y: 0 });
    setMagneticOffsetLeft({ x: 0, y: 0 });
    setIsHovered(false);
  }, []);

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
  }, []);

  // Update local state when nodeName prop changes
  useEffect(() => {
    if (!isEditingName) {
      setEditedName(nodeName || '');
    }
  }, [nodeName, isEditingName]);

  // Focus input when entering edit mode
  useEffect(() => {
    if (isEditingName && nameInputRef.current) {
      nameInputRef.current.focus();
    }
  }, [isEditingName]);

  const handleNameClick = useCallback(() => {
    setIsEditingName(true);
  }, []);

  const handleNameBlur = useCallback(() => {
    setIsEditingName(false);
    if (editedName.trim() && editedName !== nodeName && onNameChange) {
      onNameChange(editedName.trim());
    } else {
      setEditedName(nodeName || '');
    }
  }, [editedName, nodeName, onNameChange]);

  const handleNameKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleNameBlur();
    } else if (e.key === 'Escape') {
      setEditedName(nodeName || '');
      setIsEditingName(false);
    }
  }, [handleNameBlur, nodeName]);

  const handleDelete = () => {
    deleteNode(id);
  };

  const handleDuplicate = () => {
    const currentNode = nodes.find((n) => n.id === id);
    if (currentNode) {
      const newNode = {
        ...currentNode,
        id: `${currentNode.type}-${Date.now()}`,
        position: {
          x: currentNode.position.x + 50,
          y: currentNode.position.y + 50,
        },
        selected: false,
      };
      addNode(newNode);
    }
  };

  return (
    <>
      {showToolbar && (
        <NodeToolbar
          isVisible={selected}
          position={Position.Top}
          offset={20}
          className="flex gap-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-1 shadow-lg"
        >
          {/* Custom toolbar content (e.g., formatting buttons) */}
          {toolbarContent}
          {toolbarContent && <div className="w-px h-5 bg-zinc-200 dark:bg-zinc-700 mx-1" />}
          <button
            onClick={handleDuplicate}
            className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded transition-colors text-zinc-600 dark:text-zinc-400"
            title="Duplicate"
          >
            <Copy className="w-4 h-4" />
          </button>
          <button
            onClick={handleDelete}
            className="p-1.5 hover:bg-red-100 dark:hover:bg-red-500/20 rounded transition-colors text-red-500 dark:text-red-400"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </NodeToolbar>
      )}
      {resizable && (
        <NodeResizer
          minWidth={minWidth}
          minHeight={minHeight}
          isVisible={selected}
          lineClassName="!border-blue-500"
          handleClassName="!w-2 !h-2 !bg-blue-500 !border-blue-500"
        />
      )}

      {/* Editable Node Name - Outside the node border */}
      {nodeName !== undefined && (
        <div className="absolute -top-7 left-0 z-10">
          {isEditingName ? (
            <input
              ref={nameInputRef}
              type="text"
              value={editedName}
              onChange={(e) => setEditedName(e.target.value)}
              onBlur={handleNameBlur}
              onKeyDown={handleNameKeyDown}
              className="text-xs font-medium bg-transparent text-zinc-700 dark:text-zinc-300 outline-none min-w-[60px]"
              style={{ width: `${Math.max(60, editedName.length * 7)}px` }}
            />
          ) : (
            <span
              onClick={handleNameClick}
              className="text-xs font-medium text-zinc-500 dark:text-zinc-400 cursor-text hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors"
              title="Click to edit name"
            >
              {nodeName}
            </span>
          )}
        </div>
      )}

      <div
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onMouseEnter={handleMouseEnter}
        className={cn(
          'group relative bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 shadow-lg',
          resizable ? 'w-full h-full' : 'w-[240px]',
          'hover:border-zinc-300 dark:hover:border-zinc-700 transition-all duration-200',
          selected && 'border-blue-500/50 ring-2 ring-blue-500/20',
          status === 'processing' && 'border-blue-500/50',
          status === 'completed' && 'border-green-500/50',
          status === 'error' && 'border-red-500/50',
          className
        )}
      >
      {/* Input Handles - Invisible but functional */}
      {inputs.map((input, i) => (
        <Handle
          key={`input-${input}`}
          type="target"
          position={Position.Left}
          id={input}
          style={{
            top: `${((i + 1) / (inputs.length + 1)) * 100}%`,
          }}
        />
      ))}

      {children}

      {/* Output Handles - Invisible but functional */}
      {outputs.map((output, i) => (
        <Handle
          key={`output-${output}`}
          type="source"
          position={Position.Right}
          id={output}
          style={{
            top: `${((i + 1) / (outputs.length + 1)) * 100}%`,
          }}
        />
      ))}

      {/* Floating Plus Button - Left Edge with Magnetic Effect */}
      {onPlusClick && (
        <button
          ref={plusButtonLeftRef}
          onClick={(e) => {
            e.stopPropagation();
            if (!plusDisabled) onPlusClick('left');
          }}
          style={{
            transform: `translate(${magneticOffsetLeft.x}px, calc(-50% + ${magneticOffsetLeft.y}px))`,
            transition: 'transform 0.15s ease-out, opacity 0.2s ease-out, left 0.25s ease-out',
          }}
          className={cn(
            'absolute top-1/2 p-1.5 rounded-full',
            'bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 shadow-md',
            // Pop-in animation: start from outside, animate further outside when visible
            isHovered ? 'opacity-100 -left-10' : 'opacity-0 -left-8',
            plusDisabled
              ? 'text-zinc-400 dark:text-zinc-600 cursor-not-allowed'
              : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-700 hover:text-zinc-800 dark:hover:text-zinc-200 hover:scale-110'
          )}
        >
          <Plus className="w-4 h-4" />
        </button>
      )}

      {/* Floating Plus Button - Right Edge with Magnetic Effect */}
      {onPlusClick && (
        <button
          ref={plusButtonRightRef}
          onClick={(e) => {
            e.stopPropagation();
            if (!plusDisabled) onPlusClick('right');
          }}
          style={{
            transform: `translate(${magneticOffsetRight.x}px, calc(-50% + ${magneticOffsetRight.y}px))`,
            transition: 'transform 0.15s ease-out, opacity 0.2s ease-out, right 0.25s ease-out',
          }}
          className={cn(
            'absolute top-1/2 p-1.5 rounded-full',
            'bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 shadow-md',
            // Pop-in animation: start from outside, animate further outside when visible
            isHovered ? 'opacity-100 -right-10' : 'opacity-0 -right-8',
            plusDisabled
              ? 'text-zinc-400 dark:text-zinc-600 cursor-not-allowed'
              : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-700 hover:text-zinc-800 dark:hover:text-zinc-200 hover:scale-110'
          )}
        >
          <Plus className="w-4 h-4" />
        </button>
      )}
      </div>
    </>
  );
}
