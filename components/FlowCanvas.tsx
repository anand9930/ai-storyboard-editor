'use client';

import { useCallback, useMemo, useState } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Panel,
  Connection,
  addEdge,
  ConnectionMode,
  BackgroundVariant,
  Edge,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { useWorkflowStore } from '@/store/workflowStore';
import { LeftSidebar } from './LeftSidebar';
import { TopBar } from './TopBar';
import { TextNode } from './nodes/TextNode';
import { ImageNode } from './nodes/ImageNode';
import { SourceNode } from './nodes/SourceNode';
import { NodeInputPanel } from './ui/NodeInputPanel';
import { FIXED_MODELS } from '@/types/nodes';

// Node types mapping
const nodeTypes = {
  text: TextNode,
  image: ImageNode,
  source: SourceNode,
};

// Custom edge styling
const defaultEdgeOptions = {
  type: 'smoothstep',
  style: {
    stroke: '#3f3f46',
    strokeWidth: 2,
  },
  animated: false,
};

export default function FlowCanvas() {
  const {
    nodes,
    edges,
    selectedNodeId,
    onNodesChange,
    onEdgesChange,
    setEdges,
    setSelectedNodeId,
    updateNodeData,
  } = useWorkflowStore();

  const [isGenerating, setIsGenerating] = useState(false);

  // Get selected node
  const selectedNode = useMemo(() => {
    return nodes.find((n) => n.id === selectedNodeId);
  }, [nodes, selectedNodeId]);

  // Handle new connections - free-form, no validation
  const onConnect = useCallback(
    (connection: Connection) => {
      const newEdge: Edge = {
        id: `edge-${connection.source}-${connection.target}-${Date.now()}`,
        source: connection.source!,
        target: connection.target!,
        sourceHandle: connection.sourceHandle,
        targetHandle: connection.targetHandle,
        type: 'smoothstep',
        style: {
          stroke: '#3f3f46',
          strokeWidth: 2,
        },
        animated: false,
      };
      setEdges(addEdge(newEdge, edges));
    },
    [edges, setEdges]
  );

  // Handle node click - select node
  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: any) => {
      setSelectedNodeId(node.id);
    },
    [setSelectedNodeId]
  );

  // Handle pane click - deselect
  const onPaneClick = useCallback(() => {
    setSelectedNodeId(null);
  }, [setSelectedNodeId]);

  // Handle generation from input panel
  const handleGenerate = useCallback(
    async (prompt: string) => {
      if (!selectedNode) return;

      setIsGenerating(true);
      updateNodeData(selectedNode.id, { status: 'processing' });

      try {
        if (selectedNode.type === 'text') {
          const response = await fetch('/api/generate-text', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              prompt,
              model: FIXED_MODELS.text.id,
            }),
          });

          const result = await response.json();

          if (result.error) {
            throw new Error(result.error);
          }

          updateNodeData(selectedNode.id, {
            content: result.text,
            status: 'completed',
          });
        } else if (selectedNode.type === 'image') {
          const response = await fetch('/api/generate-image', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              prompt,
              model: FIXED_MODELS.image.id,
              sourceImage: (selectedNode.data as any).sourceImage,
            }),
          });

          const result = await response.json();

          if (result.error) {
            throw new Error(result.error);
          }

          updateNodeData(selectedNode.id, {
            generatedImage: result.imageUrl,
            status: 'completed',
          });
        }
      } catch (error: any) {
        console.error('Generation failed:', error);
        updateNodeData(selectedNode.id, {
          status: 'error',
          error: error.message,
        });
      } finally {
        setIsGenerating(false);
      }
    },
    [selectedNode, updateNodeData]
  );

  // Check if we should show input panel
  const showInputPanel =
    selectedNode &&
    (selectedNode.type === 'text' || selectedNode.type === 'image');

  return (
    <div className="h-full w-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        nodeTypes={nodeTypes}
        connectionMode={ConnectionMode.Loose}
        defaultEdgeOptions={defaultEdgeOptions}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        className="bg-zinc-950"
        proOptions={{ hideAttribution: true }}
      >
        <Background
          variant={BackgroundVariant.Dots}
          color="#27272a"
          gap={20}
          size={1}
        />
        <Controls className="!bg-zinc-900 !border-zinc-800 !rounded-lg" />
        <MiniMap
          className="!bg-zinc-900 !border-zinc-800 !rounded-lg"
          nodeColor="#3f3f46"
          maskColor="rgba(0,0,0,0.8)"
        />

        {/* Left Sidebar */}
        <Panel position="top-left" className="!top-4 !left-4 !m-0">
          <LeftSidebar />
        </Panel>

        {/* Top Bar */}
        <Panel position="top-right" className="!top-4 !right-4 !m-0">
          <TopBar />
        </Panel>

        {/* Dynamic Input Panel */}
        {showInputPanel && (
          <Panel position="bottom-center" className="!bottom-6 !m-0">
            <NodeInputPanel
              nodeId={selectedNode.id}
              nodeType={selectedNode.type as 'text' | 'image'}
              onSubmit={handleGenerate}
              isGenerating={isGenerating}
              connectedImage={
                selectedNode.type === 'image'
                  ? (selectedNode.data as any).sourceImage
                  : undefined
              }
            />
          </Panel>
        )}
      </ReactFlow>
    </div>
  );
}
