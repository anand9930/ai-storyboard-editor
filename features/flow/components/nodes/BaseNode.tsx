'use client';

import { ReactNode, useState, useRef, useEffect, useCallback, MouseEvent as ReactMouseEvent } from 'react';
import { Handle, Position, NodeResizer, NodeToolbar } from '@xyflow/react';
import { Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { NodeStatus } from '@/features/flow/types/nodes';
import { useWorkflowStore } from '@/features/flow/store/workflowStore';

// Selector for getting selected node count (stable reference)
const selectSelectedNodeCount = (state: { selectedNodeIds: string[] }) => state.selectedNodeIds.length;

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
  plusButtonSide?: 'left' | 'right' | 'both';
  toolbarContent?: ReactNode;
  nodeName?: string;
  onNameChange?: (newName: string) => void;
  noPadding?: boolean;
  autoHeight?: boolean;
  width?: number;
  height?: number;
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
  minHeight = 240,
  showToolbar = true,
  onPlusClick,
  plusDisabled = false,
  plusButtonSide = 'both',
  toolbarContent,
  nodeName,
  onNameChange,
  noPadding = false,
  autoHeight = false,
  width,
  height,
}: BaseNodeProps) {
  const { inputs = [], outputs = [] } = handles;
  // Only subscribe to the count, not the full array - prevents re-renders on selection changes
  const selectedNodeCount = useWorkflowStore(selectSelectedNodeCount);

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

  return (
    <>
      {showToolbar && toolbarContent && (
        <NodeToolbar
          isVisible={selected && selectedNodeCount === 1}
          position={Position.Top}
          offset={20}
          className="flex gap-toolbar bg-card border rounded-lg p-toolbar shadow-lg"
        >
          {toolbarContent}
        </NodeToolbar>
      )}
      {resizable && (
        <NodeResizer
          minWidth={minWidth}
          minHeight={minHeight}
          isVisible={selected}
          lineClassName="!border-primary"
          handleClassName="!w-2 !h-2 !bg-primary !border-primary"
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
              aria-label="Node name"
              className="text-xs font-medium bg-transparent text-foreground outline-none min-w-[60px] focus:ring-1 focus:ring-ring rounded-sm"
              style={{ width: `${Math.max(60, editedName.length * 7)}px` }}
            />
          ) : (
            <span
              role="button"
              tabIndex={0}
              onClick={handleNameClick}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleNameClick();
                }
              }}
              className="text-xs font-medium text-muted-foreground cursor-text hover:text-foreground transition-colors focus:outline-none focus:ring-1 focus:ring-ring rounded-sm"
              title="Click to edit name"
            >
              {nodeName}
            </span>
          )}
        </div>
      )}

      {/* Outer wrapper for positioning context (buttons need to be outside overflow-hidden) */}
      <div
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onMouseEnter={handleMouseEnter}
        className="group relative"
        style={{
          ...(width && { width: `${width}px` }),
          ...(height && { height: `${height}px` }),
          ...(!width && !resizable && !autoHeight && { width: 'var(--node-default-size)' }),
          ...(!height && !resizable && !autoHeight && { height: 'var(--node-default-size)' }),
        }}
      >
        {/* Inner container with overflow-hidden for image clipping */}
        <div
          className={cn(
            'relative bg-card rounded-xl shadow-lg overflow-hidden',
            !noPadding && 'p-node',
            'w-full h-full',
            'transition-all duration-200',
            status === 'processing' && 'node-status-processing',
            status === 'completed' && 'node-status-completed',
            status === 'error' && 'node-status-error',
            className
          )}
          style={{
            border: `1px solid var(${selected ? '--node-border-selected' : '--node-border'})`,
            boxShadow: selected ? `0 0 0 1px var(--node-border-selected)` : undefined,
          }}
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
        </div>

        {/* Floating Plus Button - Left Edge with Magnetic Effect (outside overflow-hidden) */}
        {onPlusClick && (plusButtonSide === 'left' || plusButtonSide === 'both') && (
          <button
            ref={plusButtonLeftRef}
            onClick={(e) => {
              e.stopPropagation();
              if (!plusDisabled) onPlusClick('left');
            }}
            aria-label="Add node to left"
            disabled={plusDisabled}
            style={{
              transform: `translate(${magneticOffsetLeft.x}px, calc(-50% + ${magneticOffsetLeft.y}px))`,
              transition: 'transform 0.15s ease-out, opacity 0.2s ease-out, left 0.25s ease-out',
            }}
            className={cn(
              'absolute top-1/2 p-1.5 rounded-full',
              'bg-card border shadow-md',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
              // Pop-in animation: start from outside, animate further outside when visible
              isHovered ? 'opacity-100 -left-10' : 'opacity-0 -left-8',
              plusDisabled
                ? 'text-muted-foreground cursor-not-allowed'
                : 'text-muted-foreground hover:bg-accent hover:text-foreground hover:scale-110'
            )}
          >
            <Plus className="w-4 h-4" />
          </button>
        )}

        {/* Floating Plus Button - Right Edge with Magnetic Effect (outside overflow-hidden) */}
        {onPlusClick && (plusButtonSide === 'right' || plusButtonSide === 'both') && (
          <button
            ref={plusButtonRightRef}
            onClick={(e) => {
              e.stopPropagation();
              if (!plusDisabled) onPlusClick('right');
            }}
            aria-label="Add node to right"
            disabled={plusDisabled}
            style={{
              transform: `translate(${magneticOffsetRight.x}px, calc(-50% + ${magneticOffsetRight.y}px))`,
              transition: 'transform 0.15s ease-out, opacity 0.2s ease-out, right 0.25s ease-out',
            }}
            className={cn(
              'absolute top-1/2 p-1.5 rounded-full',
              'bg-card border shadow-md',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
              // Pop-in animation: start from outside, animate further outside when visible
              isHovered ? 'opacity-100 -right-10' : 'opacity-0 -right-8',
              plusDisabled
                ? 'text-muted-foreground cursor-not-allowed'
                : 'text-muted-foreground hover:bg-accent hover:text-foreground hover:scale-110'
            )}
          >
            <Plus className="w-4 h-4" />
          </button>
        )}
      </div>
    </>
  );
}
