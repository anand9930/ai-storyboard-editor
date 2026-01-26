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
import type { AppNode, ImageNodeData, TextNodeData, AspectRatio, ImageQuality } from '@/types/nodes';
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

  // Compute highlighted edges based on selected nodes
  const highlightedEdges = useMemo(() => {
    if (selectedNodeIds.length === 0) return edges;

    const selectedSet = new Set(selectedNodeIds);

    return edges.map((edge) => {
      const isConnected = selectedSet.has(edge.source) || selectedSet.has(edge.target);
      return isConnected
        ? { ...edge, className: edge.className ? `${edge.className} highlighted` : 'highlighted' }
        : edge;
    });
  }, [edges, selectedNodeIds]);

  // Handle selection change - syncs React Flow selection to our store
  const onSelectionChange = useCallback(
    (params: OnSelectionChangeParams) => {
      setSelection(params);
    },
    [setSelection]
  );

  // Handle new connections - normalize targetHandle for ImageNode and TextNode
  const onConnect = useCallback(
    (connection: Connection) => {
      // Normalize targetHandle for ImageNode and TextNode
      // These nodes use 'any' as their input handle, but users might connect to the output side
      // This ensures incoming connections always go to the input handle
      let normalizedTargetHandle = connection.targetHandle;

      const targetNode = nodes.find((n) => n.id === connection.target);
      if (targetNode?.type === 'image' || targetNode?.type === 'text') {
        normalizedTargetHandle = 'any';
      }

      const newEdge: Edge = {
        id: `edge-${connection.source}-${connection.target}-${Date.now()}`,
        source: connection.source!,
        target: connection.target!,
        sourceHandle: connection.sourceHandle,
        targetHandle: normalizedTargetHandle,
        ...defaultEdgeOptions,
      };
      setEdges(addEdge(newEdge, edges));
    },
    [edges, setEdges, nodes]
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
          const textData = selectedNode.data as TextNodeData;
          const response = await fetch('/api/generate-text', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              prompt,
              model: FIXED_MODELS.text.id,
              images: textData.connectedSourceImages || [],
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
              aspectRatio: imageData.aspectRatio, // null = Auto (let API decide)
              quality: imageData.quality, // null = Auto
            }),
          });

          const result = await response.json();

          if (result.error) {
            throw new Error(result.error);
          }

          // Load image to get dimensions for aspect ratio calculation
          const img = new window.Image();
          img.onload = () => {
            updateNodeData(selectedNode.id, {
              generatedImage: result.imageUrl,
              generatedImageMetadata: {
                width: img.width,
                height: img.height,
              },
              prompt,
              status: 'completed',
            });
          };
          img.onerror = () => {
            // Fallback if image fails to load dimensions
            updateNodeData(selectedNode.id, {
              generatedImage: result.imageUrl,
              prompt,
              status: 'completed',
            });
          };
          img.src = result.imageUrl;
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

  // Handlers for aspect ratio and quality changes
  const handleAspectRatioChange = useCallback(
    (value: AspectRatio | null) => {
      if (!selectedNode || selectedNode.type !== 'image') return;
      updateNodeData(selectedNode.id, { aspectRatio: value });
    },
    [selectedNode, updateNodeData]
  );

  const handleQualityChange = useCallback(
    (value: ImageQuality | null) => {
      if (!selectedNode || selectedNode.type !== 'image') return;
      updateNodeData(selectedNode.id, { quality: value });
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
        edges={highlightedEdges}
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
          gap={20}
          size={1}
        />
        <Controls />
        <MiniMap />

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
              connectedImages={
                selectedNode.type === 'text'
                  ? (selectedNode.data as TextNodeData).connectedSourceImages
                  : selectedNode.type === 'image'
                  ? (selectedNode.data as ImageNodeData).connectedSourceImages
                  : undefined
              }
              initialPrompt={
                selectedNode.type === 'text'
                  ? (selectedNode.data as TextNodeData).prompt
                  : selectedNode.type === 'image'
                  ? (selectedNode.data as ImageNodeData).prompt
                  : ''
              }
              aspectRatio={
                selectedNode.type === 'image'
                  ? (selectedNode.data as ImageNodeData).aspectRatio
                  : undefined
              }
              quality={
                selectedNode.type === 'image'
                  ? (selectedNode.data as ImageNodeData).quality
                  : undefined
              }
              onAspectRatioChange={handleAspectRatioChange}
              onQualityChange={handleQualityChange}
            />
          </NodeToolbar>
        )}
      </ReactFlow>
    </div>
  );
}
