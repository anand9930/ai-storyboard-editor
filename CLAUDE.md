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

### Feature-Based Structure

The project uses a feature-based organization for multi-page scalability:

```
├── app/                          # Next.js app router
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Home page (flow editor)
│   ├── (flow)/api/               # Flow-specific API routes
│   │   ├── generate-image/
│   │   └── generate-text/
│   └── api/storage/              # App-wide API routes
├── features/                     # Feature modules
│   └── flow/                     # Flow editor feature
│       ├── components/           # React components
│       │   ├── FlowCanvas.tsx    # Main canvas
│       │   ├── nodes/            # Node components
│       │   ├── toolbars/         # Toolbar components
│       │   ├── context-menus/    # Context menu components
│       │   ├── editors/          # Text editor components
│       │   ├── selectors/        # Popover selectors
│       │   ├── popups/           # Popup dialogs
│       │   └── layout/           # Flow-specific layout
│       ├── hooks/                # Flow-specific hooks
│       ├── lib/                  # Flow-specific utilities
│       ├── store/                # Zustand store
│       ├── types/                # TypeScript types
│       └── index.ts              # Feature barrel export
├── components/                   # Shared components
│   ├── ui/                       # Reusable UI (ErrorBoundary)
│   └── providers/                # Global providers
├── hooks/                        # App-wide hooks (useImageUpload)
└── lib/                          # App-wide utilities
    ├── utils.ts                  # Generic utilities (cn)
    ├── modelSpecs.ts             # AI model specifications
    ├── storage/                  # R2 storage service
    └── modelProviders/           # AI provider implementations
```

### Flow Feature (`features/flow/`)

**Type System:**
- `types/nodes.ts` - Node type definitions with proper generics (AppNode, TextNode, ImageNode, SourceNode)

**Configuration:**
- `lib/flowConfig.ts` - Centralized nodeTypes, defaultEdgeOptions, and connection validation

**Custom Hooks:**
- `hooks/useSourceConnection.ts` - Tracks source image connections
- `hooks/useUndoRedoShortcuts.ts` - Keyboard shortcuts for undo/redo
- `hooks/useGroupExecution.ts` - Group node execution logic

**Node Components:**
- All nodes in `components/nodes/` use `NodeProps<NodeType>` generic for proper typing
- BaseNode provides common functionality (handles, toolbar, resizing)

**State Management:**
- `store/workflowStore.ts` - Zustand store with temporal history (zundo)

### Styling

**File Structure:**
- `app/globals.css` - Entry point (imports all style modules)
- `app/styles/base.css` - CSS variables, Tailwind, light/dark theming
- `app/styles/flow.css` - React Flow component overrides
- `app/styles/editor.css` - TipTap editor styles
- `app/styles/scrollbar.css` - Scrollbar styling

**CSS Variable Patterns:**
- Variables use OKLCH color values: `--background: oklch(1 0 0)`
- Usage: `var(--variable-name)` directly (OKLCH values include the function)
- For opacity: use `color-mix(in oklch, var(--color) 50%, transparent)`
- Prefixes by category: `--flow-*`, `--node-*`, `--surface-*`, `--text-*`, `--scrollbar-*`
- Light mode in `:root`, dark mode in `.dark`

**Spacing Tokens:**

The project uses semantic spacing tokens defined in `app/styles/base.css` for consistent spacing:

| Token | Value | Tailwind Class | Use Case |
|-------|-------|----------------|----------|
| `--spacing-xs` | 4px | `gap-xs`, `p-xs` | Dense toolbar gaps |
| `--spacing-sm` | 8px | `gap-sm`, `p-sm` | Compact containers, popups |
| `--spacing-md` | 12px | `gap-md`, `p-md` | Standard internal spacing |
| `--spacing-lg` | 16px | `gap-lg`, `p-lg` | Standard container padding |
| `--spacing-xl` | 24px | `gap-xl`, `p-xl` | Generous containers (Card, Dialog) |

Component-specific tokens:
- `p-node` / `--spacing-node-padding` - Node internal padding (16px)
- `gap-toolbar` / `--spacing-toolbar-gap` - Toolbar item gaps (4px)
- `p-toolbar` / `--spacing-toolbar-padding` - Toolbar container padding (4px)
- `p-panel` / `--spacing-panel-padding` - Panel container padding (16px)
- `p-popup` / `--spacing-popup-padding` - Popup/popover padding (8px)

Fixed dimensions:
- `w-node`, `h-node` / `--node-default-size` - Default node size (240px)
- `w-panel-sm` / `--panel-width-sm` - Small panels (224px)
- `w-panel-md` / `--panel-width-md` - Medium panels (280px)
- `w-panel-lg` / `--panel-width-lg` - Large panels (500px)

**Usage Guidelines:**
```typescript
// Prefer semantic tokens over raw Tailwind values
<Card className="w-panel-lg p-panel">     // Good
<Card className="w-[500px] p-4">          // Avoid

<NodeToolbar className="gap-toolbar p-toolbar">  // Good
<NodeToolbar className="gap-1 p-1">              // Avoid

// For inline styles with dimensions
style={{ width: 'var(--node-default-size)' }}   // Good
style={{ width: '240px' }}                       // Avoid
```

**React Flow Styling:**
- Override React Flow classes in `flow.css` using project CSS variables
- Reference: `react-flow-references/packages/system/src/styles/` for xyflow patterns

### Import Conventions

**Feature imports:**
```typescript
// Import from feature barrel
import { FlowCanvas, useWorkflowStore } from '@/features/flow';

// Or import specific modules
import { useWorkflowStore } from '@/features/flow/store/workflowStore';
import type { AppNode } from '@/features/flow/types/nodes';
```

**App-wide imports:**
```typescript
import { cn } from '@/lib/utils';
import { useImageUpload } from '@/hooks/useImageUpload';
import { ErrorBoundary } from '@/components/ui';
```

### shadcn/ui Components

The project uses shadcn/ui for UI components:

**Configuration:**
- `components.json` - shadcn CLI configuration
- Components installed in `components/ui/`

**Usage:**
```typescript
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
```

**Available Components:**
54 components including: accordion, alert, avatar, badge, button, card, checkbox, dialog, dropdown-menu, form, input, label, popover, select, separator, sheet, skeleton, slider, switch, table, tabs, textarea, toggle, tooltip, and more.

**Adding New Components:**
```bash
npx shadcn@latest add [component-name]
```
