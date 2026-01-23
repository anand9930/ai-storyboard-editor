# AI Storyboard Editor - Project Guidelines

## React Flow Reference

When troubleshooting React Flow issues, refer to the local xyflow repository:

```
react-flow-references/
```

This contains the full xyflow/xyflow source code for reference. Key areas to explore:
- `react-flow-references/packages/react/src/hooks/` - Hook implementations (useNodeConnections, useNodesData, etc.)
- `react-flow-references/packages/react/src/types/` - Type definitions
- `react-flow-references/packages/react/src/components/` - Component implementations
- `react-flow-references/examples/react/src/examples/` - Usage examples and patterns

## Project Architecture

### Type System
- `types/nodes.ts` - Node type definitions with proper generics (AppNode, TextNode, ImageNode, SourceNode)
- `types/index.ts` - Re-exports all types

### Flow Configuration
- `lib/flowConfig.ts` - Centralized nodeTypes, defaultEdgeOptions, and connection validation

### Custom Hooks
- `hooks/useSourceConnection.ts` - Tracks source image connections (replaces deprecated useHandleConnections)

### Node Components
- All nodes in `components/nodes/` use `NodeProps<NodeType>` generic for proper typing
- BaseNode provides common functionality (handles, toolbar, resizing)

### State Management
- `store/workflowStore.ts` - Zustand store with typed selectors
