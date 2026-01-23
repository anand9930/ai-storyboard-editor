# AI Storyboard Workflow Editor - Complete Technical Specification

## Implementation Note

The actual implementation differs from the original specification:
- API logic is implemented directly in Next.js route handlers (`app/api/*`) rather than in a separate abstraction layer
- Workflow execution is handled directly in `FlowCanvas.tsx` rather than through a `WorkflowEngine` class
- This simpler architecture was chosen for clarity and ease of maintenance

This document preserves the original design specifications for reference.

---

## Executive Summary
Build a flexible node-based visual workflow editor for AI content generation using ReactFlow and Next.js 14+ (App Router). The MVP focuses on three core node types: **Text**, **Image**, and **Source** nodes that can be freely connected to create generation pipelines. Key features include:

- **Dynamic Input Panels** - Attached below selected nodes, moving with canvas zoom/pan
- **Flexible Connections** - Any node can connect to any other without validation
- **"+" Button Popups** - Click to generate new connected nodes from any existing node
- **Inline Output Display** - Generated content appears directly inside nodes
- **Fixed Models** - Gemini 3 Pro for text, Banana Pro for images (simplified UX)

The editor features a dark theme UI with draggable nodes, curved connections, and a clean sidebar for adding nodes and uploading source images.

---

## 1. ARCHITECTURE OVERVIEW

### 1.1 Tech Stack
```
Frontend:
- Next.js 14+ (App Router)
- React 18+
- TypeScript
- ReactFlow 11+ (with custom node styling)
- Zustand (state management with persist middleware)
- TailwindCSS + shadcn/ui (dark zinc theme)
- Framer Motion (animations)

Backend/API:
- Next.js API Routes (stateless proxies to AI services)
- Banana Pro API (image generation - MVP)
- Google Gemini 1.5 Pro API (text generation & image analysis - MVP)
- Additional providers (post-MVP): Replicate, Seedream, Kling, MJ

Storage:
- In-memory (Zustand) - primary state
- localStorage (optional) - workflow persistence across sessions
- Base64/Blob URLs - image handling

Real-time:
- Server-Sent Events (SSE) for streaming generation status
```

### 1.2 Visual Design System

**Theme**: Dark mode with zinc color palette
```css
:root {
  --background: #09090b;      /* zinc-950 */
  --surface: #18181b;         /* zinc-900 */
  --surface-hover: #27272a;   /* zinc-800 */
  --border: #27272a;          /* zinc-800 */
  --border-hover: #3f3f46;    /* zinc-700 */
  --text: #e4e4e7;            /* zinc-200 */
  --text-muted: #71717a;      /* zinc-500 */
  --accent-blue: #3b82f6;     /* blue-500 */
  --accent-green: #22c55e;    /* green-500 */
  --accent-purple: #a855f7;   /* purple-500 */
}
```

**Node Styling**:
- Rounded corners (`rounded-lg` / 8px)
- Subtle borders (`border-zinc-800`)
- Card-like appearance with shadow
- Curved bezier edge connections
- Hover states with border highlight (`border-zinc-600`)
- Status indicators (idle, processing, completed, error)

### 1.3 Core Features (MVP)
1. **Node-Based Workflow Editor** - ReactFlow canvas with 3 node types (Text, Image, Source)
2. **Source Upload** - Upload images to create Source nodes with minimal editing toolbar
3. **Text Generation** - Text nodes with "Write your own content" and "Prompt from Image" actions
4. **Image Generation** - Image nodes with "Image to Image" transformation
5. **Dynamic Input Panels** - Context-sensitive input panels attached below selected nodes
6. **"+" Button Popups** - Add connected nodes via popup menu from any node
7. **Flexible Connections** - Free-form node connections without validation rules
8. **Inline Output** - Generated content displays directly inside nodes
9. **Workflow Export/Import** - Export to JSON, import from file (client-side only)

### 1.4 Future Features (Post-MVP)
- Video Generation nodes (Kling 2.1)
- Audio Generation nodes
- Advanced Image Editing toolbar (Redraw, Erase, Enhance, Outpainting, Cutout, Change Angle)
- Multiple AI model selection per node type
- Connection validation rules

---

## 2. DATA MANAGEMENT

This application operates entirely at runtime with no database requirements. All state is managed client-side.

### 2.1 State Storage
- **Runtime State**: Zustand store holds all workflow data in memory
- **Session Persistence** (optional): localStorage for saving/loading workflows locally
- **Image Storage**: Base64 data URLs or Blob URLs stored in memory
- **Generated Assets**: Returned directly from AI APIs, displayed immediately

### 2.2 Data Flow
```
1. User uploads image → converted to base64/blob URL → stored in Zustand
2. User triggers generation → API call to external service → result URL stored in Zustand
3. Workflow state lives in browser memory until page refresh
4. Optional: Export/import workflow JSON for persistence
```

### 2.3 Workflow Data Structure (Client-Side)
```typescript
interface WorkflowData {
  nodes: Node[];           // ReactFlow nodes
  edges: Edge[];           // ReactFlow edges
  exportedAt: string;      // ISO timestamp for exports
  version: string;         // Schema version for compatibility
}
```

**Note**: MVP uses fixed models (Gemini 1.5 Pro for text, Banana Pro for images), so no model/aspect/quality settings are needed in the workflow data.

### 2.4 Image Handling
- Uploaded images are converted to base64 data URLs
- Generated images are stored as URLs returned from AI APIs
- No server-side file storage required
- Large images can use object URLs for better performance

---

## 3. REACTFLOW NODE TYPES

### 3.1 Node Type Overview (MVP)

The MVP includes three core node types with fixed AI models:

| Node Type | Description | Actions | Fixed Model |
|-----------|-------------|---------|-------------|
| **TextNode** | Text/prompt generation | "Write your own content", "Prompt from Image" | Gemini 3 Pro |
| **ImageNode** | Image generation/processing | "Image to Image" | Banana Pro |
| **SourceNode** | Uploaded source images | Minimal toolbar (crop, download, fullscreen) | N/A |

### 3.2 Base Node Interface
```typescript
// types/nodes.ts

export type NodeStatus = 'idle' | 'processing' | 'completed' | 'error';

export enum NodeType {
  TEXT = 'text',
  IMAGE = 'image',
  SOURCE = 'source',
}

// Fixed models for MVP (no user selection)
export const FIXED_MODELS = {
  text: { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', provider: 'google' },
  image: { id: 'banana-pro', name: 'Banana Pro', provider: 'banana' },
} as const;

// Actions available for each node type
export const NODE_ACTIONS = {
  text: [
    { id: 'write', label: 'Write your own content', icon: 'Pencil', description: 'Create text manually or with AI assistance' },
    { id: 'prompt_from_image', label: 'Prompt from Image', icon: 'Image', description: 'Generate prompt description from connected image' },
  ],
  image: [
    { id: 'image_to_image', label: 'Image to Image', icon: 'RefreshCw', description: 'Transform image using AI' },
  ],
  source: [], // Source nodes have no actions, only toolbar
} as const;

// "Generate from this node" popup options
export const GENERATE_OPTIONS = [
  { id: 'text', label: 'Text Generation', icon: 'Type', description: 'Script, Ad copy, Brand text', enabled: true },
  { id: 'image', label: 'Image Generation', icon: 'Image', description: 'Generate or transform images', enabled: true },
  { id: 'video', label: 'Video Generation', icon: 'Film', description: 'Create video from image', enabled: false }, // Post-MVP
  { id: 'editor', label: 'Image Editor', icon: 'Edit', description: 'Advanced editing tools', enabled: false }, // Post-MVP
] as const;
```

### 3.3 Node Definitions (MVP)

#### 3.3.1 TextNode - Text/Prompt Generation
```typescript
// components/nodes/TextNode.tsx

interface TextNodeData {
  content: string;                    // Generated or manually written text
  selectedAction: 'write' | 'prompt_from_image' | null;
  connectedSourceImage?: string;      // URL of connected source image (for "Prompt from Image")
  status: NodeStatus;
  error?: string;
}

const TextNode = ({ data, id, selected }: NodeProps<TextNodeData>) => {
  const updateNodeData = useNodeDataUpdate(id);
  const { addNode, addEdge } = useWorkflowStore();
  const [showGeneratePopup, setShowGeneratePopup] = useState(false);

  // Handle action click - creates connected node
  const handleActionClick = (action: 'write' | 'prompt_from_image') => {
    updateNodeData({ selectedAction: action });
  };

  // Handle "+" button click for "Generate from this node" popup
  const handlePlusClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowGeneratePopup(true);
  };

  return (
    <>
      <BaseNode
        id={id}
        type="text"
        handles={{ inputs: ['any'], outputs: ['text'] }}
        className="w-64"
        selected={selected}
      >
        <div className="space-y-3">
          {/* Header */}
          <div className="flex items-center justify-between">
            <span className="font-medium text-zinc-200">Text</span>
            <StatusIndicator status={data.status} />
          </div>

          {/* Action Options */}
          <div className="space-y-2">
            <span className="text-xs text-zinc-500">Try to:</span>
            {NODE_ACTIONS.text.map(action => (
              <button
                key={action.id}
                onClick={() => handleActionClick(action.id as 'write' | 'prompt_from_image')}
                className={cn(
                  "w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-left transition-colors",
                  data.selectedAction === action.id
                    ? "bg-zinc-700 text-zinc-100"
                    : "hover:bg-zinc-800 text-zinc-400"
                )}
              >
                <DynamicIcon name={action.icon} className="w-4 h-4" />
                <span>{action.label}</span>
              </button>
            ))}
          </div>

          {/* Inline Output Display */}
          {data.content && (
            <div className="bg-zinc-950 rounded-lg p-3 text-sm text-zinc-300 max-h-40 overflow-y-auto">
              <p className="whitespace-pre-wrap">{data.content}</p>
            </div>
          )}

          {/* Plus Button */}
          <div className="flex justify-end">
            <button
              onClick={handlePlusClick}
              className="p-1.5 hover:bg-zinc-800 rounded-full transition-colors"
            >
              <Plus className="w-4 h-4 text-zinc-400" />
            </button>
          </div>
        </div>
      </BaseNode>

      {/* Generate from Node Popup */}
      {showGeneratePopup && (
        <GenerateFromNodePopup
          sourceNodeId={id}
          onClose={() => setShowGeneratePopup(false)}
        />
      )}
    </>
  );
};
```

#### 3.3.2 ImageNode - Image Generation
```typescript
// components/nodes/ImageNode.tsx

interface ImageNodeData {
  sourceImage?: string;       // Connected input image URL
  generatedImage?: string;    // Output image URL
  prompt: string;             // User's prompt for generation
  selectedAction: 'image_to_image' | null;
  status: NodeStatus;
  error?: string;
}

const ImageNode = ({ data, id, selected }: NodeProps<ImageNodeData>) => {
  const updateNodeData = useNodeDataUpdate(id);
  const [showGeneratePopup, setShowGeneratePopup] = useState(false);

  return (
    <>
      <BaseNode
        id={id}
        type="image"
        handles={{ inputs: ['any'], outputs: ['image'] }}
        className="w-64"
        selected={selected}
      >
        <div className="space-y-3">
          {/* Header */}
          <div className="flex items-center justify-between">
            <span className="font-medium text-zinc-200">Image</span>
            <StatusIndicator status={data.status} />
          </div>

          {/* Action Options */}
          <div className="space-y-2">
            <span className="text-xs text-zinc-500">Try to:</span>
            {NODE_ACTIONS.image.map(action => (
              <button
                key={action.id}
                onClick={() => updateNodeData({ selectedAction: action.id })}
                className={cn(
                  "w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-left transition-colors",
                  data.selectedAction === action.id
                    ? "bg-zinc-700 text-zinc-100"
                    : "hover:bg-zinc-800 text-zinc-400"
                )}
              >
                <DynamicIcon name={action.icon} className="w-4 h-4" />
                <span>{action.label}</span>
              </button>
            ))}
          </div>

          {/* Inline Output Display - Generated Image */}
          {data.generatedImage ? (
            <div className="relative rounded-lg overflow-hidden">
              <img
                src={data.generatedImage}
                alt="Generated"
                className="w-full aspect-square object-cover"
              />
            </div>
          ) : data.sourceImage ? (
            <div className="relative rounded-lg overflow-hidden opacity-50">
              <img
                src={data.sourceImage}
                alt="Source"
                className="w-full aspect-square object-cover"
              />
              <span className="absolute inset-0 flex items-center justify-center text-xs text-zinc-400">
                Waiting for generation...
              </span>
            </div>
          ) : (
            <div className="aspect-square bg-zinc-950 rounded-lg flex items-center justify-center">
              <span className="text-zinc-600 text-xs">No image connected</span>
            </div>
          )}

          {/* Plus Button */}
          <div className="flex justify-end">
            <button
              onClick={(e) => { e.stopPropagation(); setShowGeneratePopup(true); }}
              className="p-1.5 hover:bg-zinc-800 rounded-full transition-colors"
            >
              <Plus className="w-4 h-4 text-zinc-400" />
            </button>
          </div>
        </div>
      </BaseNode>

      {/* Generate from Node Popup */}
      {showGeneratePopup && (
        <GenerateFromNodePopup
          sourceNodeId={id}
          onClose={() => setShowGeneratePopup(false)}
        />
      )}
    </>
  );
};
```

#### 3.3.3 SourceNode - Uploaded Images
```typescript
// components/nodes/SourceNode.tsx

interface SourceNodeData {
  image: {
    id: string;
    url: string;              // Base64 data URL or blob URL
    metadata: {
      width: number;
      height: number;
      format: string;
    };
  } | null;
}

const SourceNode = ({ data, id, selected }: NodeProps<SourceNodeData>) => {
  const updateNodeData = useNodeDataUpdate(id);
  const [showGeneratePopup, setShowGeneratePopup] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle file upload - converts to base64
  const handleUpload = async (file: File) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const dataUrl = e.target?.result as string;

      // Get image dimensions
      const img = new Image();
      img.onload = () => {
        updateNodeData({
          image: {
            id: `src-${Date.now()}`,
            url: dataUrl,
            metadata: {
              width: img.width,
              height: img.height,
              format: file.type.split('/')[1] || 'unknown',
            },
          },
        });
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  };

  // Minimal toolbar actions for Source node
  const handleCrop = () => { /* Open crop modal */ };
  const handleDownload = () => {
    if (data.image) {
      const a = document.createElement('a');
      a.href = data.image.url;
      a.download = `source-${data.image.id}.png`;
      a.click();
    }
  };
  const handleFullscreen = () => { /* Open fullscreen modal */ };

  return (
    <>
      <BaseNode
        id={id}
        type="source"
        handles={{ outputs: ['image'] }}
        className="w-64"
        selected={selected}
      >
        <div className="space-y-3">
          {/* Header with Upload button */}
          <div className="flex items-center justify-between">
            <span className="font-medium text-zinc-200">Source</span>
            {data.image && (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="text-xs text-blue-400 hover:text-blue-300"
              >
                Replace
              </button>
            )}
          </div>

          {/* Image Display or Upload Zone */}
          {data.image ? (
            <div className="relative rounded-lg overflow-hidden group">
              <img
                src={data.image.url}
                alt="Source"
                className="w-full aspect-square object-cover"
              />
              {/* Minimal Toolbar - appears on hover */}
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 bg-zinc-900/90 backdrop-blur rounded-lg p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={handleCrop} className="p-1.5 hover:bg-zinc-800 rounded">
                  <Crop className="w-4 h-4 text-zinc-400" />
                </button>
                <button onClick={handleDownload} className="p-1.5 hover:bg-zinc-800 rounded">
                  <Download className="w-4 h-4 text-zinc-400" />
                </button>
                <button onClick={handleFullscreen} className="p-1.5 hover:bg-zinc-800 rounded">
                  <Maximize2 className="w-4 h-4 text-zinc-400" />
                </button>
              </div>
            </div>
          ) : (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="aspect-square bg-zinc-950 border-2 border-dashed border-zinc-700 hover:border-zinc-500 rounded-lg flex flex-col items-center justify-center cursor-pointer transition-colors"
            >
              <Upload className="w-8 h-8 text-zinc-600 mb-2" />
              <span className="text-xs text-zinc-500">Click to upload</span>
            </div>
          )}

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])}
            className="hidden"
          />

          {/* Plus Button */}
          <div className="flex justify-end">
            <button
              onClick={(e) => { e.stopPropagation(); setShowGeneratePopup(true); }}
              className="p-1.5 hover:bg-zinc-800 rounded-full transition-colors"
              disabled={!data.image}
            >
              <Plus className={cn("w-4 h-4", data.image ? "text-zinc-400" : "text-zinc-600")} />
            </button>
          </div>
        </div>
      </BaseNode>

      {/* Generate from Node Popup */}
      {showGeneratePopup && (
        <GenerateFromNodePopup
          sourceNodeId={id}
          onClose={() => setShowGeneratePopup(false)}
        />
      )}
    </>
  );
};
```

### 3.4 NodeInputPanel - Dynamic Input Attached to Node
```typescript
// components/ui/NodeInputPanel.tsx

/**
 * NodeInputPanel renders BELOW the selected node and moves with canvas zoom/pan.
 * It provides the prompt input interface for Text and Image nodes.
 */

interface NodeInputPanelProps {
  nodeId: string;
  nodeType: 'text' | 'image';
  nodePosition: { x: number; y: number };
  nodeHeight: number;
  onSubmit: (prompt: string) => void;
  isGenerating: boolean;
}

export function NodeInputPanel({
  nodeId,
  nodeType,
  nodePosition,
  nodeHeight,
  onSubmit,
  isGenerating,
}: NodeInputPanelProps) {
  const [prompt, setPrompt] = useState('');

  const model = FIXED_MODELS[nodeType];
  const placeholder = nodeType === 'text'
    ? 'Describe what you want to generate and adjust parameters below. (Enter to generate, Shift+Enter for new line)'
    : 'Type a prompt or press "/" for commands (Enter to send, Shift+Enter for new line)';

  const handleSubmit = () => {
    if (prompt.trim() && !isGenerating) {
      onSubmit(prompt);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  // Position panel below the node
  const panelStyle = {
    position: 'absolute' as const,
    left: nodePosition.x,
    top: nodePosition.y + nodeHeight + 16, // 16px gap below node
    width: 400, // Fixed width for panel
  };

  return (
    <div
      style={panelStyle}
      className="bg-zinc-900/95 backdrop-blur border border-zinc-800 rounded-xl p-3 shadow-xl"
    >
      {/* Connected Image Preview (for context) */}
      {nodeType === 'text' && (
        <div className="flex gap-2 mb-2">
          {/* Placeholder for connected image thumbnails */}
        </div>
      )}

      {/* Prompt Input */}
      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="w-full bg-transparent text-sm text-zinc-300 resize-none focus:outline-none min-h-[60px]"
        rows={2}
      />

      {/* Bottom Controls */}
      <div className="flex items-center justify-between pt-2 border-t border-zinc-800 mt-2">
        <div className="flex items-center gap-2">
          <span className="text-xs text-zinc-500">G</span>
          <span className="text-sm text-zinc-300">{model.name}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-zinc-500">1x</span>
          <span className="text-sm text-zinc-500">4</span>
          <button
            onClick={handleSubmit}
            disabled={isGenerating || !prompt.trim()}
            className={cn(
              "p-2 rounded-full transition-colors",
              isGenerating || !prompt.trim()
                ? "bg-zinc-700 text-zinc-500"
                : "bg-blue-600 hover:bg-blue-500 text-white"
            )}
          >
            <ArrowUp className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
```

### 3.5 GenerateFromNodePopup - "+" Button Menu
```typescript
// components/ui/GenerateFromNodePopup.tsx

/**
 * Popup that appears when clicking the "+" button on any node.
 * Shows all generation options (some disabled for MVP).
 */

interface GenerateFromNodePopupProps {
  sourceNodeId: string;
  position?: { x: number; y: number };
  onClose: () => void;
}

export function GenerateFromNodePopup({
  sourceNodeId,
  position,
  onClose,
}: GenerateFromNodePopupProps) {
  const { addNode, addEdge, nodes } = useWorkflowStore();
  const sourceNode = nodes.find(n => n.id === sourceNodeId);

  const handleSelect = (type: 'text' | 'image' | 'video' | 'editor') => {
    if (type === 'video' || type === 'editor') {
      // Disabled for MVP
      return;
    }

    // Calculate position for new node (to the right of source)
    const newPosition = {
      x: (sourceNode?.position.x || 0) + 300,
      y: sourceNode?.position.y || 0,
    };

    // Create new node
    const newNodeId = `${type}-${Date.now()}`;
    const newNode = {
      id: newNodeId,
      type,
      position: newPosition,
      data: getDefaultNodeData(type),
    };

    addNode(newNode);

    // Create edge from source to new node
    // Use SOURCE node's output handle type, not target type
    addEdge({
      id: `edge-${sourceNodeId}-${newNodeId}`,
      source: sourceNodeId,
      target: newNodeId,
      sourceHandle: sourceNode?.type === 'text' ? 'text' : 'image',
      targetHandle: 'any',
    });

    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40"
        onClick={onClose}
      />

      {/* Popup */}
      <div
        className="absolute z-50 bg-zinc-900 border border-zinc-800 rounded-xl p-2 w-56 shadow-xl"
        style={position ? { left: position.x, top: position.y } : undefined}
      >
        <div className="text-xs text-zinc-500 px-2 py-1 mb-1">
          Generate from this node
        </div>

        {GENERATE_OPTIONS.map(option => (
          <button
            key={option.id}
            onClick={() => handleSelect(option.id as any)}
            disabled={!option.enabled}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors",
              option.enabled
                ? "hover:bg-zinc-800 text-zinc-200"
                : "text-zinc-600 cursor-not-allowed"
            )}
          >
            <DynamicIcon name={option.icon} className="w-5 h-5" />
            <div>
              <div className="text-sm font-medium">{option.label}</div>
              <div className="text-xs text-zinc-500">{option.description}</div>
            </div>
          </button>
        ))}
      </div>
    </>
  );
}

// Helper to get default data for each node type
function getDefaultNodeData(type: string) {
  switch (type) {
    case 'text':
      return {
        content: '',
        selectedAction: null,
        status: 'idle',
      };
    case 'image':
      return {
        sourceImage: undefined,
        generatedImage: undefined,
        prompt: '',
        selectedAction: null,
        status: 'idle',
      };
    case 'source':
      return {
        image: null,
      };
    default:
      return {};
  }
}
```

### 3.6 BaseNode Component (Updated)
```typescript
// components/nodes/BaseNode.tsx

interface BaseNodeProps {
  id: string;
  type: string;
  children: React.ReactNode;
  handles: {
    inputs?: string[];
    outputs?: string[];
  };
  className?: string;
  selected?: boolean;
}

export function BaseNode({ id, type, children, handles, className, selected }: BaseNodeProps) {
  const nodeData = useNodeData(id);
  const status = nodeData?.status || 'idle';

  return (
    <div
      className={cn(
        "bg-zinc-900 border border-zinc-800 rounded-xl p-4 shadow-lg",
        "hover:border-zinc-700 transition-colors",
        selected && "border-blue-500/50 ring-1 ring-blue-500/20",
        status === 'processing' && "border-blue-500/50",
        status === 'completed' && "border-green-500/50",
        status === 'error' && "border-red-500/50",
        className
      )}
    >
      {/* Input Handles */}
      {handles.inputs?.map((input, i) => (
        <Handle
          key={`input-${input}`}
          type="target"
          position={Position.Left}
          id={input}
          style={{ top: `${((i + 1) / (handles.inputs!.length + 1)) * 100}%` }}
          className="!w-3 !h-3 !bg-zinc-600 !border-2 !border-zinc-800"
        />
      ))}

      {children}

      {/* Output Handles */}
      {handles.outputs?.map((output, i) => (
        <Handle
          key={`output-${output}`}
          type="source"
          position={Position.Right}
          id={output}
          style={{ top: `${((i + 1) / (handles.outputs!.length + 1)) * 100}%` }}
          className="!w-3 !h-3 !bg-blue-500 !border-2 !border-zinc-800"
        />
      ))}
    </div>
  );
}
```

---

## 4. REACTFLOW IMPLEMENTATION

### 4.1 Main Canvas Component
```typescript
// components/FlowCanvas.tsx

'use client';

import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  Panel,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Node,
  Edge,
  ConnectionMode,
  useReactFlow,
} from 'reactflow';
import 'reactflow/dist/style.css';

// MVP Node Types (simplified)
const nodeTypes = {
  text: TextNode,
  image: ImageNode,
  source: SourceNode,
};

// Custom edge styling
const edgeOptions = {
  type: 'smoothstep',
  style: {
    stroke: '#3f3f46', // zinc-700
    strokeWidth: 2,
  },
  animated: false,
};

export default function FlowCanvas() {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const reactFlowInstance = useReactFlow();

  // FREE-FORM CONNECTIONS - No validation (per user requirement)
  const onConnect = useCallback(
    (connection: Connection) => {
      // Allow ALL connections without validation
      setEdges((eds) => addEdge({ ...connection, ...edgeOptions }, eds));
    },
    []
  );

  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
  }, []);

  const addNode = useCallback((type: NodeType) => {
    const newNode: Node = {
      id: `${type}-${Date.now()}`,
      type,
      position: { x: 250, y: 250 },
      data: getDefaultNodeData(type),
    };
    setNodes((nds) => [...nds, newNode]);
  }, []);

  // Get selected node dimensions for positioning input panel
  const getNodeDimensions = useCallback((nodeId: string) => {
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return null;
    // Approximate dimensions - actual implementation would use refs
    return {
      position: node.position,
      height: node.type === 'source' ? 280 : 200,
    };
  }, [nodes]);

  // Handle generation from input panel
  const handleGenerate = useCallback(async (nodeId: string, prompt: string) => {
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return;

    // Update node status to processing
    setNodes(nds => nds.map(n =>
      n.id === nodeId ? { ...n, data: { ...n.data, status: 'processing' } } : n
    ));

    try {
      if (node.type === 'text') {
        const result = await fetch('/api/generate-text', {
          method: 'POST',
          body: JSON.stringify({ prompt, model: FIXED_MODELS.text.id }),
        }).then(res => res.json());

        setNodes(nds => nds.map(n =>
          n.id === nodeId ? { ...n, data: { ...n.data, content: result.text, status: 'completed' } } : n
        ));
      } else if (node.type === 'image') {
        const result = await fetch('/api/generate-image', {
          method: 'POST',
          body: JSON.stringify({
            prompt,
            model: FIXED_MODELS.image.id,
            sourceImage: node.data.sourceImage,
          }),
        }).then(res => res.json());

        setNodes(nds => nds.map(n =>
          n.id === nodeId ? { ...n, data: { ...n.data, generatedImage: result.imageUrl, status: 'completed' } } : n
        ));
      }
    } catch (error) {
      setNodes(nds => nds.map(n =>
        n.id === nodeId ? { ...n, data: { ...n.data, status: 'error', error: error.message } } : n
      ));
    }
  }, [nodes, setNodes]);

  return (
    <div className="h-screen w-full bg-zinc-950">
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
        defaultEdgeOptions={edgeOptions}
        fitView
        className="bg-zinc-950"
      >
        <Background
          color="#27272a"
          gap={20}
          size={1}
        />
        <Controls
          className="!bg-zinc-900 !border-zinc-800 !rounded-lg [&>button]:!bg-zinc-900 [&>button]:!border-zinc-800 [&>button]:hover:!bg-zinc-800"
        />
        <MiniMap
          className="!bg-zinc-900 !border-zinc-800 !rounded-lg"
          nodeColor="#3f3f46"
          maskColor="rgba(0,0,0,0.8)"
        />

        {/* Left Sidebar */}
        <Panel position="top-left" className="!top-4 !left-4">
          <LeftSidebar onAddNode={addNode} />
        </Panel>

        {/* Top Right - Logo & Actions */}
        <Panel position="top-right" className="!top-4 !right-4">
          <TopBar />
        </Panel>

        {/* Dynamic Input Panel - Attached to selected node */}
        {selectedNode && (selectedNode.type === 'text' || selectedNode.type === 'image') && (
          <NodeInputPanel
            nodeId={selectedNode.id}
            nodeType={selectedNode.type as 'text' | 'image'}
            nodePosition={selectedNode.position}
            nodeHeight={getNodeDimensions(selectedNode.id)?.height || 200}
            onSubmit={(prompt) => handleGenerate(selectedNode.id, prompt)}
            isGenerating={selectedNode.data.status === 'processing'}
          />
        )}
      </ReactFlow>
    </div>
  );
}
```

### 4.2 Left Sidebar Component (Updated for MVP)
```typescript
// components/LeftSidebar.tsx

/**
 * Left sidebar with two sections:
 * 1. Add Nodes - Text, Image (Video/Audio disabled for MVP)
 * 2. Add Source - Upload
 */

// Node types available for adding
const ADD_NODE_ITEMS = [
  {
    type: 'text' as const,
    label: 'Text',
    icon: Type,
    badge: 'Gemini3',
    description: 'Script, Ad copy, Brand text',
    enabled: true,
  },
  {
    type: 'image' as const,
    label: 'Image',
    icon: ImageIcon,
    badge: 'Banana Pro',
    description: 'Generate or transform images',
    enabled: true,
  },
  {
    type: 'video' as const,
    label: 'Video',
    icon: Film,
    badge: null,
    description: 'Create videos from images',
    enabled: false, // MVP disabled
  },
  {
    type: 'audio' as const,
    label: 'Audio',
    icon: Music,
    badge: 'Beta',
    description: 'Generate audio/music',
    enabled: false, // MVP disabled
  },
];

interface LeftSidebarProps {
  onAddNode: (type: NodeType) => void;
}

export function LeftSidebar({ onAddNode }: LeftSidebarProps) {
  const [showNodeMenu, setShowNodeMenu] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { addNode } = useWorkflowStore();

  // Handle upload - creates a Source node
  const handleUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const dataUrl = e.target?.result as string;

      const img = new Image();
      img.onload = () => {
        const newNode = {
          id: `source-${Date.now()}`,
          type: 'source',
          position: { x: 250, y: 250 },
          data: {
            image: {
              id: `src-${Date.now()}`,
              url: dataUrl,
              metadata: {
                width: img.width,
                height: img.height,
                format: file.type.split('/')[1] || 'unknown',
              },
            },
          },
        };
        addNode(newNode);
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="relative">
      {/* Main sidebar buttons */}
      <div className="flex flex-col gap-2 bg-zinc-900/90 backdrop-blur border border-zinc-800 rounded-xl p-2">
        {/* Add Node Button */}
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={() => setShowNodeMenu(!showNodeMenu)}
              className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
            >
              <Plus className="w-5 h-5 text-zinc-400" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="right">Add Node</TooltipContent>
        </Tooltip>

        {/* Other sidebar icons (templates, layers, etc.) */}
        <Tooltip>
          <TooltipTrigger asChild>
            <button className="p-2 hover:bg-zinc-800 rounded-lg transition-colors">
              <LayoutTemplate className="w-5 h-5 text-zinc-400" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="right">Templates</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <button className="p-2 hover:bg-zinc-800 rounded-lg transition-colors">
              <Layers className="w-5 h-5 text-zinc-400" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="right">Layers</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <button className="p-2 hover:bg-zinc-800 rounded-lg transition-colors">
              <MessageSquare className="w-5 h-5 text-zinc-400" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="right">Chat</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <button className="p-2 hover:bg-zinc-800 rounded-lg transition-colors">
              <History className="w-5 h-5 text-zinc-400" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="right">History</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <button className="p-2 hover:bg-zinc-800 rounded-lg transition-colors">
              <ImageIcon className="w-5 h-5 text-zinc-400" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="right">Gallery</TooltipContent>
        </Tooltip>
      </div>

      {/* Node Menu Dropdown */}
      {showNodeMenu && (
        <div className="absolute left-full ml-2 top-0 bg-zinc-900 border border-zinc-800 rounded-xl p-3 w-56 shadow-xl z-50">
          {/* Close button */}
          <button
            onClick={() => setShowNodeMenu(false)}
            className="absolute top-2 right-2 p-1 hover:bg-zinc-800 rounded"
          >
            <X className="w-4 h-4 text-zinc-500" />
          </button>

          {/* Add Nodes Section */}
          <div className="mb-4">
            <div className="text-xs text-zinc-500 px-2 py-1 mb-2">Add Nodes</div>
            {ADD_NODE_ITEMS.map(item => (
              <button
                key={item.type}
                onClick={() => {
                  if (item.enabled) {
                    onAddNode(item.type as NodeType);
                    setShowNodeMenu(false);
                  }
                }}
                disabled={!item.enabled}
                className={cn(
                  "w-full flex items-center gap-3 px-2 py-2 rounded-lg text-left transition-colors",
                  item.enabled
                    ? "hover:bg-zinc-800 text-zinc-200"
                    : "text-zinc-600 cursor-not-allowed opacity-50"
                )}
              >
                <item.icon className="w-5 h-5" />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{item.label}</span>
                    {item.badge && (
                      <span className={cn(
                        "text-[10px] px-1.5 py-0.5 rounded",
                        item.badge === 'Beta'
                          ? "bg-purple-500/20 text-purple-400"
                          : "bg-blue-500/20 text-blue-400"
                      )}>
                        {item.badge}
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-zinc-500">{item.description}</span>
                </div>
              </button>
            ))}
          </div>

          {/* Add Source Section */}
          <div>
            <div className="text-xs text-zinc-500 px-2 py-1 mb-2">Add Source</div>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full flex items-center gap-3 px-2 py-2 rounded-lg text-left hover:bg-zinc-800 text-zinc-200 transition-colors"
            >
              <Upload className="w-5 h-5" />
              <span className="text-sm font-medium">Upload</span>
            </button>
          </div>

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                handleUpload(file);
                setShowNodeMenu(false);
              }
              e.target.value = ''; // Reset for re-upload
            }}
            className="hidden"
          />
        </div>
      )}
    </div>
  );
}
```

---

## 5. STATE MANAGEMENT

### 5.1 Zustand Store with localStorage Persistence
```typescript
// store/workflowStore.ts

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Node, Edge } from 'reactflow';

interface WorkflowState {
  // Workflow data
  nodes: Node[];
  edges: Edge[];
  selectedNode: Node | null;

  // Execution state
  isExecuting: boolean;
  executionProgress: Record<string, number>;
  executionResults: Record<string, any>;

  // Generated assets (in-memory)
  generatedImages: Record<string, string>; // nodeId -> imageUrl

  // Actions
  setNodes: (nodes: Node[]) => void;
  setEdges: (edges: Edge[]) => void;
  addNode: (node: Node) => void;
  addEdge: (edge: Edge) => void;
  updateNode: (nodeId: string, data: any) => void;
  deleteNode: (nodeId: string) => void;
  setSelectedNode: (node: Node | null) => void;

  // Workflow actions
  executeWorkflow: () => Promise<void>;

  // Local workflow management (no server)
  exportWorkflow: () => string;           // Returns JSON string
  importWorkflow: (json: string) => void; // Loads workflow from JSON
  clearWorkflow: () => void;              // Resets everything
}

// Note: MVP uses FIXED_MODELS - no model/aspectRatio/quality selection needed

export const useWorkflowStore = create<WorkflowState>()(
  persist(
    (set, get) => ({
      // Initial state
      nodes: [],
      edges: [],
      selectedNode: null,
      isExecuting: false,
      executionProgress: {},
      executionResults: {},
      generatedImages: {},

      setNodes: (nodes) => set({ nodes }),
      setEdges: (edges) => set({ edges }),

      addNode: (node) => set((state) => ({
        nodes: [...state.nodes, node],
      })),

      addEdge: (edge) => set((state) => ({
        edges: [...state.edges, edge],
      })),

      updateNode: (nodeId, data) => set((state) => ({
        nodes: state.nodes.map((node) =>
          node.id === nodeId ? { ...node, data: { ...node.data, ...data } } : node
        ),
      })),

      deleteNode: (nodeId) => set((state) => ({
        nodes: state.nodes.filter((node) => node.id !== nodeId),
        edges: state.edges.filter(
          (edge) => edge.source !== nodeId && edge.target !== nodeId
        ),
      })),

      setSelectedNode: (node) => set({ selectedNode: node }),

      executeWorkflow: async () => {
        set({ isExecuting: true });
        const { nodes, edges } = get();
        const engine = new WorkflowEngine(nodes, edges);

        try {
          await engine.execute((nodeId, progress) => {
            set((state) => ({
              executionProgress: { ...state.executionProgress, [nodeId]: progress },
            }));
          });
        } finally {
          set({ isExecuting: false });
        }
      },

      // Export workflow to JSON string (for file download)
      exportWorkflow: () => {
        const { nodes, edges } = get();
        return JSON.stringify({
          nodes,
          edges,
          exportedAt: new Date().toISOString(),
          version: '1.0',
        }, null, 2);
      },

      // Import workflow from JSON string
      importWorkflow: (json: string) => {
        try {
          const data = JSON.parse(json);
          set({
            nodes: data.nodes || [],
            edges: data.edges || [],
            // Reset execution state
            executionProgress: {},
            executionResults: {},
            generatedImages: {},
          });
        } catch (error) {
          console.error('Failed to import workflow:', error);
          throw new Error('Invalid workflow file');
        }
      },

      // Clear all workflow data
      clearWorkflow: () => set({
        nodes: [],
        edges: [],
        selectedNode: null,
        executionProgress: {},
        executionResults: {},
        generatedImages: {},
      }),
    }),
    {
      name: 'storyboard-workflow', // localStorage key
      partialize: (state) => ({
        // Only persist these fields to localStorage
        nodes: state.nodes,
        edges: state.edges,
      }),
    }
  )
);
```

### 5.2 TopBar with Export/Import Actions
```typescript
// components/TopBar.tsx

import { useRef } from 'react';
import { Download, Upload, Trash2, FileJson } from 'lucide-react';
import { useWorkflowStore } from '@/store/workflowStore';

export function TopBar() {
  const { exportWorkflow, importWorkflow, clearWorkflow } = useWorkflowStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    const json = exportWorkflow();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `workflow-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          importWorkflow(e.target?.result as string);
        } catch (error) {
          alert('Failed to import workflow: Invalid file format');
        }
      };
      reader.readAsText(file);
    }
    // Reset input so same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClear = () => {
    if (confirm('Are you sure you want to clear the workflow? This cannot be undone.')) {
      clearWorkflow();
    }
  };

  return (
    <div className="flex items-center gap-2 bg-zinc-900/90 backdrop-blur border border-zinc-800 rounded-xl px-3 py-2">
      {/* Logo */}
      <div className="flex items-center gap-2 pr-3 border-r border-zinc-800">
        <span className="font-semibold text-zinc-200">Storyboard Studio</span>
      </div>

      {/* Actions */}
      <button
        onClick={handleExport}
        className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-zinc-300 hover:bg-zinc-800 rounded-lg transition-colors"
      >
        <Download className="w-4 h-4" />
        Export
      </button>

      <button
        onClick={() => fileInputRef.current?.click()}
        className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-zinc-300 hover:bg-zinc-800 rounded-lg transition-colors"
      >
        <Upload className="w-4 h-4" />
        Import
      </button>

      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleImport}
        className="hidden"
      />

      <div className="w-px h-6 bg-zinc-700" />

      <button
        onClick={handleClear}
        className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
      >
        <Trash2 className="w-4 h-4" />
        Clear
      </button>
    </div>
  );
}
```

---

## 6. API ROUTES (MVP)

MVP includes only 3 API routes matching the file structure in Section 9.

### 6.1 Image Generation API (Banana Pro)
```typescript
// app/api/generate-image/route.ts

import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { prompt, sourceImage } = body;

    // MVP uses fixed Banana Pro model
    const response = await fetch(process.env.BANANA_PRO_API_URL!, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.BANANA_PRO_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt,
        image: sourceImage, // Optional source image for image-to-image
      }),
    });

    const result = await response.json();
    const imageUrl = result.output || result.url || result.data?.[0]?.url;

    return NextResponse.json({ imageUrl });
  } catch (error) {
    console.error('Image generation failed:', error);
    return NextResponse.json({ error: 'Failed to generate image' }, { status: 500 });
  }
}
```

### 6.2 Text Generation API (Gemini 1.5 Pro)
```typescript
// app/api/generate-text/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json();

    // MVP uses fixed Gemini 1.5 Pro model
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    return NextResponse.json({ text });
  } catch (error) {
    console.error('Text generation failed:', error);
    return NextResponse.json({ error: 'Failed to generate text' }, { status: 500 });
  }
}
```

### 6.3 Image Analysis API (Gemini - for "Prompt from Image")
```typescript
// app/api/analyze-image/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: NextRequest) {
  try {
    const { imageUrl } = await req.json();

    // MVP uses fixed Gemini 1.5 Pro model
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });

    // Fetch image and convert to base64
    const imageResponse = await fetch(imageUrl);
    const imageBuffer = await imageResponse.arrayBuffer();
    const base64Image = Buffer.from(imageBuffer).toString('base64');

    const result = await model.generateContent([
      {
        inlineData: {
          mimeType: 'image/jpeg',
          data: base64Image,
        },
      },
      {
        text: `Analyze this image and provide:
1. Main subject and composition
2. Visual style and mood
3. Colors and lighting
4. Suggested prompt for AI image generation
5. Pose description if person is present

Format as JSON with keys: subject, style, colors, suggestedPrompt, poseDescription`,
      },
    ]);

    const text = result.response.text();
    const jsonMatch = text.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      return NextResponse.json({ error: 'Failed to parse analysis' }, { status: 500 });
    }

    return NextResponse.json(JSON.parse(jsonMatch[0]));
  } catch (error) {
    console.error('Image analysis failed:', error);
    return NextResponse.json({ error: 'Failed to analyze image' }, { status: 500 });
  }
}
```

### 6.4 Post-MVP API Routes (Reference Only)

The following API routes are planned for post-MVP phases:

- **`generate-poses/route.ts`** - Pose variation generation using Gemini
- **`generate-video/route.ts`** - Video generation using Kling 2.1
- **`image-edit/route.ts`** - Advanced image editing (redraw, erase, enhance, outpainting, cutout, changeAngle)

---

## 7. WORKFLOW EXECUTION ENGINE

```typescript
// lib/workflow-engine.ts

import { Node, Edge } from 'reactflow';

export class WorkflowEngine {
  private nodes: Node[];
  private edges: Edge[];
  private nodeResults: Map<string, any>;

  constructor(nodes: Node[], edges: Edge[]) {
    this.nodes = nodes;
    this.edges = edges;
    this.nodeResults = new Map();
  }

  getExecutionOrder(): string[] {
    const inDegree = new Map<string, number>();
    const adjacencyList = new Map<string, string[]>();

    this.nodes.forEach(node => {
      inDegree.set(node.id, 0);
      adjacencyList.set(node.id, []);
    });

    this.edges.forEach(edge => {
      adjacencyList.get(edge.source)!.push(edge.target);
      inDegree.set(edge.target, (inDegree.get(edge.target) || 0) + 1);
    });

    const queue: string[] = [];
    inDegree.forEach((degree, nodeId) => {
      if (degree === 0) queue.push(nodeId);
    });

    const order: string[] = [];
    while (queue.length > 0) {
      const nodeId = queue.shift()!;
      order.push(nodeId);

      adjacencyList.get(nodeId)!.forEach(neighbor => {
        const newDegree = inDegree.get(neighbor)! - 1;
        inDegree.set(neighbor, newDegree);
        if (newDegree === 0) queue.push(neighbor);
      });
    }

    if (order.length !== this.nodes.length) {
      throw new Error('Circular dependency detected in workflow');
    }

    return order;
  }

  getNodeInputs(nodeId: string): Record<string, any> {
    const inputs: Record<string, any> = {};
    const incomingEdges = this.edges.filter(edge => edge.target === nodeId);

    incomingEdges.forEach(edge => {
      const sourceResult = this.nodeResults.get(edge.source);
      const inputName = edge.targetHandle || 'default';
      inputs[inputName] = sourceResult;
    });

    return inputs;
  }

  // MVP Node Types: source, text, image
  async executeNode(node: Node, inputs: Record<string, any>): Promise<any> {
    let result;

    switch (node.type) {
      case 'source':
        // Source nodes just pass through their uploaded image
        result = node.data.image;
        break;

      case 'text':
        result = await this.executeTextNode(node, inputs);
        break;

      case 'image':
        result = await this.executeImageNode(node, inputs);
        break;

      default:
        result = node.data;
    }

    this.nodeResults.set(node.id, result);
    return result;
  }

  private async executeTextNode(node: Node, inputs: Record<string, any>): Promise<any> {
    const { selectedAction, content } = node.data;

    // If user wrote their own content, just return it
    if (selectedAction === 'write' && content) {
      return { text: content };
    }

    // If "Prompt from Image", analyze connected image
    if (selectedAction === 'prompt_from_image') {
      const sourceImage = inputs.any?.url || inputs.image?.url;
      if (!sourceImage) {
        throw new Error('No image connected for "Prompt from Image"');
      }

      const response = await fetch('/api/analyze-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl: sourceImage }),
      });

      return response.json();
    }

    // Default: generate text from prompt
    const response = await fetch('/api/generate-text', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: node.data.prompt || content }),
    });

    return response.json();
  }

  private async executeImageNode(node: Node, inputs: Record<string, any>): Promise<any> {
    const { prompt, selectedAction } = node.data;

    // Get source image from connected node (if any)
    const sourceImage = inputs.any?.url || inputs.image?.url;

    const response = await fetch('/api/generate-image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt,
        sourceImage, // For image-to-image transformation
      }),
    });

    return response.json();
  }

  async execute(
    onProgress?: (nodeId: string, progress: number) => void
  ): Promise<Map<string, any>> {
    const executionOrder = this.getExecutionOrder();

    for (let i = 0; i < executionOrder.length; i++) {
      const nodeId = executionOrder[i];
      const node = this.nodes.find(n => n.id === nodeId);

      if (!node) continue;

      const inputs = this.getNodeInputs(nodeId);

      try {
        await this.executeNode(node, inputs);

        if (onProgress) {
          onProgress(nodeId, ((i + 1) / executionOrder.length) * 100);
        }
      } catch (error) {
        console.error(`Error executing node ${nodeId}:`, error);
        throw error;
      }
    }

    return this.nodeResults;
  }
}
```

---

## 8. UI COMPONENTS

**Note**: MVP uses fixed models, so ModelSelector and AspectRatioSelector are not needed. These components are included for post-MVP reference only.

### 8.1 Status Indicator (MVP)
```typescript
// components/ui/StatusIndicator.tsx

interface StatusIndicatorProps {
  status: 'idle' | 'processing' | 'completed' | 'error';
}

export function StatusIndicator({ status }: StatusIndicatorProps) {
  const config = {
    idle: { color: 'bg-zinc-600', label: '' },
    processing: { color: 'bg-blue-500 animate-pulse', label: 'Processing...' },
    completed: { color: 'bg-green-500', label: 'Done' },
    error: { color: 'bg-red-500', label: 'Error' },
  };

  const { color, label } = config[status];

  if (status === 'idle') return null;

  return (
    <div className="flex items-center gap-1.5">
      <div className={cn("w-2 h-2 rounded-full", color)} />
      {label && <span className="text-xs text-zinc-400">{label}</span>}
    </div>
  );
}
```

### 8.2 Model Selector (Post-MVP)
```typescript
// components/ui/ModelSelector.tsx
// NOT USED IN MVP - models are fixed (Gemini 1.5 Pro for text, Banana Pro for images)

import { AI_MODELS } from '@/types/nodes';

interface ModelSelectorProps {
  value: string;
  onChange: (model: string) => void;
  className?: string;
}

export function ModelSelector({ value, onChange, className }: ModelSelectorProps) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className={cn("bg-zinc-800 border-zinc-700", className)}>
        <SelectValue>
          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-500">G</span>
            <span>{AI_MODELS.find(m => m.id === value)?.name || 'Select model'}</span>
          </div>
        </SelectValue>
      </SelectTrigger>
      <SelectContent className="bg-zinc-900 border-zinc-800">
        {AI_MODELS.map(model => (
          <SelectItem
            key={model.id}
            value={model.id}
            className="hover:bg-zinc-800"
          >
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <span>{model.name}</span>
                {model.description && (
                  <span className="text-xs text-zinc-500">{model.description}</span>
                )}
              </div>
              <span className="text-xs text-zinc-500">{model.time}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
```

### 8.3 Aspect Ratio Grid Selector (Post-MVP)
```typescript
// components/ui/AspectRatioSelector.tsx
// NOT USED IN MVP - aspect ratio is fixed/default

import { ASPECT_RATIOS } from '@/types/nodes';

interface AspectRatioSelectorProps {
  value: string;
  onChange: (ratio: string) => void;
}

export function AspectRatioSelector({ value, onChange }: AspectRatioSelectorProps) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button className="flex items-center gap-1 bg-zinc-800 px-2 py-1 rounded-lg text-sm">
          <div className="w-4 h-3 border border-zinc-600 rounded-sm" />
          <span>{value}</span>
          <ChevronDown className="w-3 h-3 text-zinc-500" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="bg-zinc-900 border-zinc-800 p-3 w-64">
        <div className="space-y-2">
          <span className="text-xs text-zinc-500">Quality</span>
          <button className="w-full py-2 bg-zinc-800 rounded-lg text-sm flex items-center justify-center gap-2">
            <Sparkles className="w-4 h-4" />
            Auto
          </button>
        </div>

        <div className="mt-3 space-y-2">
          <span className="text-xs text-zinc-500">Aspect Ratio</span>
          <div className="grid grid-cols-5 gap-1">
            {ASPECT_RATIOS.map(ratio => (
              <button
                key={ratio.value}
                onClick={() => {
                  onChange(ratio.value);
                  setOpen(false);
                }}
                className={cn(
                  "p-2 rounded-lg text-xs flex flex-col items-center gap-1",
                  value === ratio.value
                    ? "bg-blue-600"
                    : "bg-zinc-800 hover:bg-zinc-700"
                )}
              >
                <div
                  className="border border-current rounded-sm"
                  style={{
                    width: ratio.value === '21:9' ? 21 : ratio.value === '9:16' ? 9 : 12,
                    height: ratio.value === '21:9' ? 9 : ratio.value === '9:16' ? 16 : 12,
                  }}
                />
                <span>{ratio.label}</span>
              </button>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
```

### 8.4 Frame Selector (Post-MVP)
```typescript
// components/ui/FrameSelector.tsx

interface Frame {
  url: string;
  selected: boolean;
  timestamp?: number;
}

interface FrameSelectorProps {
  frames: Frame[];
  onSelect: (index: number) => void;
  maxSelection?: number;
}

export function FrameSelector({ frames, onSelect, maxSelection = 1 }: FrameSelectorProps) {
  return (
    <div className="space-y-2">
      <span className="text-sm font-medium text-zinc-300">Frame</span>
      <div className="flex gap-2 overflow-x-auto pb-2">
        <button className="w-12 h-12 flex-shrink-0 bg-zinc-900 rounded-lg flex items-center justify-center hover:bg-zinc-800">
          <MousePointer2 className="w-5 h-5 text-zinc-500" />
        </button>

        {frames.map((frame, index) => (
          <button
            key={index}
            onClick={() => onSelect(index)}
            className={cn(
              "relative w-12 h-12 flex-shrink-0 rounded-lg overflow-hidden border-2",
              frame.selected ? "border-blue-500" : "border-transparent hover:border-zinc-600"
            )}
          >
            <img
              src={frame.url}
              alt={`Frame ${index + 1}`}
              className="w-full h-full object-cover"
            />
            <span className="absolute bottom-0 right-0 text-[10px] bg-black/70 px-1 rounded-tl">
              {index + 1}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
```

---

## 9. FILE STRUCTURE (MVP)

```
ai-storyboard-editor/
├── app/
│   ├── api/
│   │   ├── analyze-image/route.ts    # Gemini 1.5 Pro image analysis (Prompt from Image)
│   │   ├── generate-image/route.ts   # Banana Pro image generation
│   │   └── generate-text/route.ts    # Gemini 1.5 Pro text generation
│   ├── layout.tsx
│   └── page.tsx                      # Main editor page
├── components/
│   ├── nodes/
│   │   ├── BaseNode.tsx              # Shared node wrapper with handles
│   │   ├── TextNode.tsx              # Text generation node
│   │   ├── ImageNode.tsx             # Image generation node
│   │   └── SourceNode.tsx            # Uploaded source images
│   ├── ui/
│   │   ├── GenerateFromNodePopup.tsx # "+" button popup menu
│   │   ├── NodeInputPanel.tsx        # Dynamic input panel (attached to node)
│   │   ├── StatusIndicator.tsx       # Node status badges
│   │   └── DynamicIcon.tsx           # Icon helper component
│   ├── FlowCanvas.tsx                # Main ReactFlow canvas
│   ├── LeftSidebar.tsx               # Add Nodes + Add Source sidebar
│   ├── TopBar.tsx                    # Logo, Export/Import/Clear actions
│   └── Providers.tsx                 # React providers wrapper
├── lib/
│   ├── api-clients/
│   │   ├── banana.ts                 # Banana Pro client
│   │   └── gemini.ts                 # Gemini 1.5 Pro client
│   ├── workflow-engine.ts            # Workflow execution logic
│   └── utils.ts                      # Utility functions
├── store/
│   └── workflowStore.ts              # Zustand with localStorage persist
├── types/
│   ├── nodes.ts                      # Node type definitions
│   └── workflow.ts                   # Workflow types
├── public/
│   └── assets/
├── .env.local                        # API keys only
├── next.config.js
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

**Note**: MVP has simplified structure with only 3 node types. No video, audio, or advanced editing APIs.

---

## 10. IMPLEMENTATION PHASES (MVP)

### Phase 1: Foundation
1. Set up Next.js 14+ project with TypeScript
2. Install ReactFlow, Zustand (with persist middleware), shadcn/ui
3. Implement dark theme design system (zinc color palette)
4. Set up Zustand store with localStorage persistence
5. Configure TailwindCSS with dark mode

### Phase 2: Core Canvas & Layout
1. Implement FlowCanvas with ReactFlow
2. Create BaseNode component with dark styling and status indicators
3. Build LeftSidebar with Add Nodes + Add Source sections
4. Build TopBar with Export/Import/Clear actions
5. Implement free-form connections (no validation)

### Phase 3: Node Types (MVP - 3 nodes)
1. **SourceNode** - Upload functionality with minimal toolbar (crop, download, fullscreen)
2. **TextNode** - Action options (Write your own content, Prompt from Image)
3. **ImageNode** - Action option (Image to Image)

### Phase 4: Dynamic UI Components
1. **NodeInputPanel** - Input panel attached below selected node
2. **GenerateFromNodePopup** - "+" button popup with generation options
3. Node selection state management
4. Panel positioning that follows canvas zoom/pan

### Phase 5: API Integrations (MVP)
1. Gemini 3 Pro text generation API route
2. Banana Pro image generation API route
3. Gemini analyze-image API route (for "Prompt from Image")
4. Error handling and loading states

### Phase 6: Workflow Execution
1. Implement basic WorkflowEngine class
2. Node execution for Text and Image types
3. Pass data through node connections
4. Progress tracking and status updates

### Phase 7: Polish & Testing
1. Workflow export/import (JSON files)
2. Error boundaries and user feedback
3. Keyboard shortcuts (optional)
4. Edge cases and cleanup

### Future Phases (Post-MVP)
- Video Generation nodes (Kling 2.1)
- Audio Generation nodes
- Advanced Image Editing toolbar
- Multiple model selection
- Connection validation rules

---

## 11. CRITICAL CONSIDERATIONS

### 11.1 Performance
- Lazy load node components
- Use React.memo for expensive components
- Optimize image loading with blur placeholders
- Debounce node position updates

### 11.2 Error Handling
```typescript
class WorkflowErrorBoundary extends React.Component {
  componentDidCatch(error: Error) {
    logError(error);
    toast.error('Workflow execution failed', {
      description: error.message,
      action: { label: 'Retry', onClick: () => this.props.retryWorkflow() },
    });
  }
}
```

### 11.3 Rate Limiting
- Implement per-model rate limits
- Queue requests for batch operations
- Show generation time estimates based on model

---

## 12. DEPLOYMENT

### 12.1 Environment Variables (MVP)
```bash
# .env.local
# Only AI API keys required for MVP - no database or storage credentials

# Image Generation API (Banana Pro - fixed model)
BANANA_PRO_API_URL="https://..."
BANANA_PRO_API_KEY="..."

# Text Generation & Image Analysis API (Gemini 3 Pro - fixed model)
GEMINI_API_KEY="..."

# Future APIs (Post-MVP)
# KLING_API_KEY="..."           # Video generation
# MIDJOURNEY_API_KEY="..."      # Additional image models
# SEEDREAM_API_URL="..."        # Additional image models
# REPLICATE_API_TOKEN="..."     # General purpose
```

**Note**: MVP requires only 2 API keys (Banana Pro for images, Gemini for text). No `DATABASE_URL`, `BLOB_READ_WRITE_TOKEN`, or `NEXTAUTH_*` variables required. The application runs entirely stateless on the server side, with all persistence handled in the browser via localStorage.

### 12.2 Vercel Configuration (MVP)
```json
{
  "functions": {
    "app/api/generate-image/route.ts": { "maxDuration": 120 },
    "app/api/generate-text/route.ts": { "maxDuration": 60 },
    "app/api/analyze-image/route.ts": { "maxDuration": 60 }
  }
}
```

---

## 13. TESTING STRATEGY

```typescript
describe('WorkflowEngine', () => {
  it('should generate correct execution order', () => {
    const nodes = [
      { id: '1', type: 'imageUpload', data: {} },
      { id: '2', type: 'autoGenerate', data: {} },
      { id: '3', type: 'generate4Post', data: {} },
    ];

    const edges = [
      { id: 'e1', source: '1', target: '2' },
      { id: 'e2', source: '2', target: '3' },
    ];

    const engine = new WorkflowEngine(nodes, edges);
    const order = engine.getExecutionOrder();

    expect(order).toEqual(['1', '2', '3']);
  });

  it('should detect circular dependencies', () => {
    const nodes = [
      { id: '1', type: 'autoGenerate', data: {} },
      { id: '2', type: 'generate4Post', data: {} },
    ];

    const edges = [
      { id: 'e1', source: '1', target: '2' },
      { id: 'e2', source: '2', target: '1' },
    ];

    const engine = new WorkflowEngine(nodes, edges);

    expect(() => engine.getExecutionOrder()).toThrow('Circular dependency');
  });
});
```

---

This specification provides a complete blueprint for building a production-ready AI storyboard workflow editor with the visual design and functionality shown in the reference screenshots. The ReactFlow-based approach maintains flexibility while providing a polished, dark-themed UI with all the necessary components for pose-based image generation and video creation workflows.
