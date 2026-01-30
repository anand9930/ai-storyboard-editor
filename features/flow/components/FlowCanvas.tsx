'use client';

import { useCallback, useMemo, useState, useRef } from 'react';
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
  Node,
  OnSelectionChangeParams,
  NodeToolbar,
  Position,
  SelectionMode,
  ReactFlowInstance,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useShallow } from 'zustand/shallow';

import { useWorkflowStore } from '@/features/flow/store/workflowStore';
import { useUndoRedoShortcuts } from '@/features/flow/hooks/useUndoRedoShortcuts';
import { LeftSidebar } from './layout/LeftSidebar';
import { ProjectHeader } from './layout/ProjectHeader';
import { CreditsDisplay } from './layout/CreditsDisplay';
import { NodeInputPanel } from './toolbars/NodeInputPanel';
import { MultiSelectionToolbar } from './toolbars/MultiSelectionToolbar';
import { useFlowContextMenu } from './context-menus';
import { FIXED_MODELS } from '@/features/flow/types/nodes';
import type { AppNode, ImageNodeData, TextNodeData, AspectRatio, ImageQuality } from '@/features/flow/types/nodes';
import { nodeTypes, defaultEdgeOptions, isValidNodeConnection } from '@/features/flow/lib/flowConfig';
import { getModelDefaults } from '@/lib/modelSpecs';

export default function FlowCanvas() {
  // Enable undo/redo keyboard shortcuts (Ctrl+Z / Ctrl+Y)
  useUndoRedoShortcuts();

  // Use shallow selectors to prevent re-renders when unrelated state changes
  const { nodes, edges, selectedNodeIds, colorMode } = useWorkflowStore(
    useShallow((state) => ({
      nodes: state.nodes,
      edges: state.edges,
      selectedNodeIds: state.selectedNodeIds,
      colorMode: state.colorMode,
    }))
  );

  // Get actions separately - these don't cause re-renders
  const {
    onNodesChange,
    onEdgesChange,
    setEdges,
    setSelection,
    setSelectedNodeIds,
    updateNodeData,
  } = useWorkflowStore();

  const [isGenerating, setIsGenerating] = useState(false);

  // Context menu hook from provider
  const { openCanvasMenu, openNodeMenu, closeMenu } = useFlowContextMenu();

  // Store React Flow instance for coordinate conversion
  const reactFlowInstance = useRef<ReactFlowInstance | null>(null);

  // Handle React Flow initialization
  const onInit = useCallback((instance: ReactFlowInstance) => {
    reactFlowInstance.current = instance;
  }, []);

  // Pause history tracking during drag to only record final position
  const onNodeDragStart = useCallback(() => {
    useWorkflowStore.temporal.getState().pause();
  }, []);

  // Resume history tracking when drag ends (records final position)
  const onNodeDragStop = useCallback(() => {
    useWorkflowStore.temporal.getState().resume();
  }, []);

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
  // Optimized: only create new edge objects when className actually needs to change
  const highlightedEdges = useMemo(() => {
    if (selectedNodeIds.length === 0) return edges;

    const selectedSet = new Set(selectedNodeIds);
    let hasChanges = false;

    const result = edges.map((edge) => {
      const isConnected = selectedSet.has(edge.source) || selectedSet.has(edge.target);
      const hasHighlight = edge.className?.includes('highlighted');

      // Only create new object if highlight state needs to change
      if (isConnected && !hasHighlight) {
        hasChanges = true;
        return { ...edge, className: edge.className ? `${edge.className} highlighted` : 'highlighted' };
      }
      // Return original edge reference to preserve memoization downstream
      return edge;
    });

    // Return original edges array if no changes needed (preserves reference)
    return hasChanges ? result : edges;
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
    (_: React.MouseEvent, node: Node) => {
      setSelectedNodeIds([node.id]);
    },
    [setSelectedNodeIds]
  );

  // Handle pane click - deselect and close context menus
  const onPaneClick = useCallback(() => {
    setSelectedNodeIds([]);
    closeMenu();
  }, [setSelectedNodeIds, closeMenu]);

  // Handle right-click on canvas - show context menu
  const onPaneContextMenu = useCallback(
    (event: React.MouseEvent | MouseEvent) => {
      event.preventDefault();

      if (!reactFlowInstance.current) return;

      // Convert screen coordinates to flow coordinates
      const flowPosition = reactFlowInstance.current.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      openCanvasMenu(event, flowPosition);
    },
    [openCanvasMenu]
  );

  // Handle right-click on node - show node context menu
  const onNodeContextMenu = useCallback(
    (event: React.MouseEvent, node: Node) => {
      openNodeMenu(event, node);
    },
    [openNodeMenu]
  );

  // Handle right-click on selection - prevent default browser context menu
  const onSelectionContextMenu = useCallback(
    (event: React.MouseEvent, _nodes: Node[]) => {
      event.preventDefault();
      closeMenu();
    },
    [closeMenu]
  );

  // Handle generation from input panel
  const handleGenerate = useCallback(
    async (prompt: string) => {
      if (!selectedNode) return;

      setIsGenerating(true);
      updateNodeData(selectedNode.id, { status: 'processing', prompt });

      try {
        if (selectedNode.type === 'text') {
          const textData = selectedNode.data as TextNodeData;

          // Build combined prompt: user prompt + connected TextNode contents
          let combinedPrompt = prompt;
          if (textData.connectedSourceTexts?.length) {
            const textContents = textData.connectedSourceTexts
              .map(t => t.content.replace(/<[^>]*>/g, '').trim()) // Strip HTML tags
              .filter(t => t.length > 0);

            if (textContents.length > 0) {
              combinedPrompt = prompt + '\n\n' + textContents.join('\n\n');
            }
          }

          const response = await fetch('/api/generate-text', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              prompt: combinedPrompt, // Combined prompt with connected texts
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

          // Build combined prompt: user prompt + connected TextNode contents
          let combinedPrompt = prompt;
          if (imageData.connectedSourceTexts?.length) {
            const textContents = imageData.connectedSourceTexts
              .map(t => t.content.replace(/<[^>]*>/g, '').trim()) // Strip HTML tags
              .filter(t => t.length > 0);

            if (textContents.length > 0) {
              combinedPrompt = prompt + '\n\n' + textContents.join('\n\n');
            }
          }

          const response = await fetch('/api/generate-image', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              prompt: combinedPrompt, // Combined prompt with connected texts
              model: imageData.model, // Use selected model from node data
              sourceImages: (imageData.connectedSourceImages || []).map(img => img.url), // Send ALL image URLs
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
      } catch (error) {
        console.error('Generation failed:', error);
        const errorMessage = error instanceof Error ? error.message : 'Generation failed';
        updateNodeData(selectedNode.id, {
          status: 'error',
          error: errorMessage,
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

  // Handler for model changes - resets quality and aspectRatio to new model's defaults
  const handleModelChange = useCallback(
    (modelId: string) => {
      if (!selectedNode || selectedNode.type !== 'image') return;
      const defaults = getModelDefaults(modelId);
      updateNodeData(selectedNode.id, {
        model: modelId,
        quality: defaults.quality,
        aspectRatio: defaults.aspectRatio,
      });
    },
    [selectedNode, updateNodeData]
  );

  // Handler to dismiss error
  const handleErrorDismiss = useCallback(() => {
    if (!selectedNode) return;
    updateNodeData(selectedNode.id, { error: undefined, status: 'idle' });
  }, [selectedNode, updateNodeData]);

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
        onNodeContextMenu={onNodeContextMenu}
        onNodeDragStart={onNodeDragStart}
        onNodeDragStop={onNodeDragStop}
        onPaneClick={onPaneClick}
        onPaneContextMenu={onPaneContextMenu}
        onSelectionContextMenu={onSelectionContextMenu}
        onSelectionChange={onSelectionChange}
        onInit={onInit}
        nodeTypes={nodeTypes}
        connectionMode={ConnectionMode.Loose}
        connectionLineType={ConnectionLineType.Bezier}
        defaultEdgeOptions={defaultEdgeOptions}
        isValidConnection={isValidConnection}
        // Selection behavior: left-click drag creates selection box
        selectionOnDrag={true}
        selectionMode={SelectionMode.Partial}
        // Pan behavior: right-click (2) and middle-click (1) for panning
        panOnDrag={[1, 2]}
        // Allow scroll to zoom
        panOnScroll={false}
        // Performance: only render nodes/edges within the viewport
        onlyRenderVisibleElements={true}
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

        {/* Multi-Selection Toolbar - Shows when 2+ nodes selected */}
        <MultiSelectionToolbar />

        {/* Project Header - Top Left */}
        <Panel position="top-left" className="!top-4 !left-4 !m-0">
          <ProjectHeader />
        </Panel>

        {/* Credits Display - Top Right */}
        <Panel position="top-right" className="!top-4 !right-4 !m-0">
          <CreditsDisplay />
        </Panel>

        {/* Left Sidebar - Vertically Centered */}
        <Panel position="top-left" className="left-sidebar-centered !left-4 !m-0">
          <LeftSidebar />
        </Panel>

        {/* Bottom Right - Controls stacked above MiniMap */}
        <Panel position="bottom-right" className="!bottom-4 !right-4 !m-0">
          <div className="flex flex-col gap-2 items-end">
            <Controls className="!static !transform-none" />
            <MiniMap className="!static !transform-none" />
          </div>
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
              model={
                selectedNode.type === 'image'
                  ? (selectedNode.data as ImageNodeData).model
                  : undefined
              }
              onAspectRatioChange={handleAspectRatioChange}
              onQualityChange={handleQualityChange}
              onModelChange={handleModelChange}
              error={
                selectedNode.type === 'text'
                  ? (selectedNode.data as TextNodeData).error
                  : selectedNode.type === 'image'
                  ? (selectedNode.data as ImageNodeData).error
                  : undefined
              }
              onErrorDismiss={handleErrorDismiss}
            />
          </NodeToolbar>
        )}
      </ReactFlow>
    </div>
  );
}
