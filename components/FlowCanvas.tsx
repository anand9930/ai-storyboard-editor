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
  ConnectionLineType,
  BackgroundVariant,
  Edge,
  OnSelectionChangeParams,
  NodeToolbar,
  Position,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { useWorkflowStore } from '@/store/workflowStore';
import { LeftSidebar } from './LeftSidebar';
import { TopBar } from './TopBar';
import { NodeInputPanel } from './ui/NodeInputPanel';
import { FIXED_MODELS } from '@/types/nodes';
import type { AppNode, ImageNodeData, TextNodeData } from '@/types/nodes';
import { nodeTypes, defaultEdgeOptions, isValidNodeConnection } from '@/lib/flowConfig';

export default function FlowCanvas() {
  const {
    nodes,
    edges,
    selectedNodeIds,
    colorMode,
    onNodesChange,
    onEdgesChange,
    setEdges,
    setSelection,
    setSelectedNodeIds,
    updateNodeData,
  } = useWorkflowStore();

  const [isGenerating, setIsGenerating] = useState(false);

  // Connection validation - uses nodes from store for consistent reads
  const isValidConnection = useCallback(
    (connection: Edge | Connection) => {
      return isValidNodeConnection(connection, nodes as AppNode[], edges);
    },
    [nodes, edges]
  );

  // Get first selected node with proper typing
  const selectedNode = useMemo(() => {
    if (selectedNodeIds.length === 0) return undefined;
    return nodes.find((n) => n.id === selectedNodeIds[0]) as AppNode | undefined;
  }, [nodes, selectedNodeIds]);

  // Handle selection change - syncs React Flow selection to our store
  const onSelectionChange = useCallback(
    (params: OnSelectionChangeParams) => {
      setSelection(params);
    },
    [setSelection]
  );

  // Handle new connections - free-form, no validation
  const onConnect = useCallback(
    (connection: Connection) => {
      const newEdge: Edge = {
        id: `edge-${connection.source}-${connection.target}-${Date.now()}`,
        source: connection.source!,
        target: connection.target!,
        sourceHandle: connection.sourceHandle,
        targetHandle: connection.targetHandle,
      };
      setEdges(addEdge(newEdge, edges));
    },
    [edges, setEdges]
  );

  // Handle node click - select node
  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: any) => {
      setSelectedNodeIds([node.id]);
    },
    [setSelectedNodeIds]
  );

  // Handle pane click - deselect
  const onPaneClick = useCallback(() => {
    setSelectedNodeIds([]);
  }, [setSelectedNodeIds]);

  // Handle generation from input panel
  const handleGenerate = useCallback(
    async (prompt: string) => {
      if (!selectedNode) return;

      setIsGenerating(true);
      updateNodeData(selectedNode.id, { status: 'processing', prompt });

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
            prompt,
            status: 'completed',
          });
        } else if (selectedNode.type === 'image') {
          const imageData = selectedNode.data as ImageNodeData;
          const response = await fetch('/api/generate-image', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              prompt,
              model: FIXED_MODELS.image.id,
              sourceImage: imageData.sourceImage,
            }),
          });

          const result = await response.json();

          if (result.error) {
            throw new Error(result.error);
          }

          updateNodeData(selectedNode.id, {
            generatedImage: result.imageUrl,
            prompt,
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
    <div className="h-full w-full relative">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        onSelectionChange={onSelectionChange}
        nodeTypes={nodeTypes}
        connectionMode={ConnectionMode.Loose}
        connectionLineType={ConnectionLineType.Bezier}
        defaultEdgeOptions={defaultEdgeOptions}
        isValidConnection={isValidConnection}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        colorMode={colorMode}
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

        {/* Dynamic Input Panel - Attached to selected node via NodeToolbar */}
        {showInputPanel && (
          <NodeToolbar
            nodeId={selectedNode.id}
            isVisible={selectedNodeIds.length === 1}
            position={Position.Bottom}
            offset={20}
          >
            <NodeInputPanel
              nodeId={selectedNode.id}
              nodeType={selectedNode.type as 'text' | 'image'}
              onSubmit={handleGenerate}
              isGenerating={isGenerating}
              connectedImage={
                selectedNode.type === 'image'
                  ? (selectedNode.data as ImageNodeData).sourceImage
                  : undefined
              }
              initialPrompt={
                selectedNode.type === 'text'
                  ? (selectedNode.data as TextNodeData).prompt
                  : selectedNode.type === 'image'
                  ? (selectedNode.data as ImageNodeData).prompt
                  : ''
              }
            />
          </NodeToolbar>
        )}
      </ReactFlow>
    </div>
  );
}
