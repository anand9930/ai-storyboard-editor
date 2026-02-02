'use client';

import {
  ReactFlow,
  Background,
  BackgroundVariant,
  ConnectionLineType,
  Panel,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Eye } from 'lucide-react';

import { useTheme } from '@/components/providers/ThemeProvider';
import { ZoomSlider } from '@/components/zoom-slider';
import { Badge } from '@/components/ui/badge';
import { nodeTypes, defaultEdgeOptions } from '@/features/flow/lib/flowConfig';
import { ReadOnlyContext } from '../context/ReadOnlyContext';
import type { AppNode } from '@/features/flow/types/nodes';
import type { Edge } from '@xyflow/react';

interface ReadOnlyFlowCanvasProps {
  nodes: AppNode[];
  edges: Edge[];
}

export function ReadOnlyFlowCanvas({ nodes, edges }: ReadOnlyFlowCanvasProps) {
  const { colorMode } = useTheme();

  return (
    <ReadOnlyContext.Provider value={{ isReadOnly: true }}>
      <div className="h-full w-full relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          defaultEdgeOptions={defaultEdgeOptions}
          connectionLineType={ConnectionLineType.Bezier}
          // Disable all editing interactions
          nodesDraggable={false}
          nodesConnectable={false}
          nodesFocusable={false}
          edgesFocusable={false}
          elementsSelectable={false}
          // Enable navigation only
          panOnDrag={true}
          zoomOnScroll={true}
          zoomOnPinch={true}
          panOnScroll={false}
          // Performance
          onlyRenderVisibleElements={true}
          // Fit view with padding
          fitView
          fitViewOptions={{ padding: 0.2 }}
          // Theme
          colorMode={colorMode}
          proOptions={{ hideAttribution: true }}
        >
          <Background
            variant={BackgroundVariant.Dots}
            gap={20}
            size={1}
          />

          {/* View Only Badge - Top Right */}
          <Panel position="top-right" className="!top-4 !right-4 !m-0">
            <Badge variant="secondary" className="gap-1.5 text-xs font-normal">
              <Eye className="h-3 w-3" />
              View Only
            </Badge>
          </Panel>

          {/* Zoom Controls - Bottom Left */}
          <ZoomSlider
            position="bottom-left"
            orientation="horizontal"
            className="!bottom-4 !left-4 !m-0"
          />
        </ReactFlow>
      </div>
    </ReadOnlyContext.Provider>
  );
}
