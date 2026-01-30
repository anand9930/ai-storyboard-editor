'use client';

import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { Node } from '@xyflow/react';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { CanvasContextMenuContent } from './CanvasContextMenuContent';
import { NodeContextMenuContent } from './NodeContextMenuContent';

// Menu state discriminated union
type MenuState =
  | { type: 'canvas'; x: number; y: number; flowPosition: { x: number; y: number } }
  | { type: 'node'; x: number; y: number; nodeId: string }
  | { type: null };

// Context value interface
interface FlowContextMenuContextValue {
  openCanvasMenu: (event: React.MouseEvent | MouseEvent, flowPosition: { x: number; y: number }) => void;
  openNodeMenu: (event: React.MouseEvent, node: Node) => void;
  closeMenu: () => void;
}

const FlowContextMenuContext = createContext<FlowContextMenuContextValue | null>(null);

export function useFlowContextMenu() {
  const context = useContext(FlowContextMenuContext);
  if (!context) {
    throw new Error('useFlowContextMenu must be used within FlowContextMenuProvider');
  }
  return context;
}

interface FlowContextMenuProviderProps {
  children: ReactNode;
}

export function FlowContextMenuProvider({ children }: FlowContextMenuProviderProps) {
  const [menuState, setMenuState] = useState<MenuState>({ type: null });

  // Open canvas context menu
  const openCanvasMenu = useCallback((
    event: React.MouseEvent | MouseEvent,
    flowPosition: { x: number; y: number }
  ) => {
    event.preventDefault();
    setMenuState({
      type: 'canvas',
      x: event.clientX,
      y: event.clientY,
      flowPosition,
    });
  }, []);

  // Open node context menu
  const openNodeMenu = useCallback((event: React.MouseEvent, node: Node) => {
    event.preventDefault();
    setMenuState({
      type: 'node',
      x: event.clientX,
      y: event.clientY,
      nodeId: node.id,
    });
  }, []);

  // Close menu
  const closeMenu = useCallback(() => {
    setMenuState({ type: null });
  }, []);

  // Handle open state change from Radix
  const handleOpenChange = useCallback((open: boolean) => {
    if (!open) {
      closeMenu();
    }
  }, [closeMenu]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && menuState.type !== null) {
        closeMenu();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [menuState.type, closeMenu]);

  const contextValue = { openCanvasMenu, openNodeMenu, closeMenu };

  const isOpen = menuState.type !== null;
  const position = menuState.type !== null ? { x: menuState.x, y: menuState.y } : { x: 0, y: 0 };

  return (
    <FlowContextMenuContext.Provider value={contextValue}>
      {children}

      {/* Context Menu using DropdownMenu for controlled state */}
      <DropdownMenu open={isOpen} onOpenChange={handleOpenChange}>
        {/* Virtual trigger - positioned at cursor */}
        <DropdownMenuTrigger asChild>
          <div
            className="fixed w-0 h-0 pointer-events-none"
            style={{
              left: position.x,
              top: position.y,
            }}
          />
        </DropdownMenuTrigger>

        <DropdownMenuContent
          className={cn(menuState.type === 'canvas' ? 'w-52' : 'w-48')}
          side="bottom"
          align="start"
          sideOffset={0}
          alignOffset={0}
        >
          {menuState.type === 'canvas' && (
            <CanvasContextMenuContent
              flowPosition={menuState.flowPosition}
              onClose={closeMenu}
            />
          )}
          {menuState.type === 'node' && (
            <NodeContextMenuContent
              nodeId={menuState.nodeId}
              onClose={closeMenu}
            />
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </FlowContextMenuContext.Provider>
  );
}
