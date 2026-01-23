# AI Storyboard Workflow Editor

A node-based visual workflow editor for AI content generation built with Next.js 14+, ReactFlow, and Zustand.

## Features

- **Node-Based Editor**: Visual workflow creation with draggable nodes
- **Three Node Types**:
  - **Source Node**: Upload and manage images
  - **Text Node**: Generate text with AI (Gemini 3 Pro)
  - **Image Node**: Generate/transform images (Banana Pro)
- **Dynamic Input Panels**: Context-aware prompt input attached below selected nodes
- **Free-Form Connections**: Connect any node to any other
- **Dark Theme**: Modern zinc-based dark UI
- **Workflow Persistence**: Export/import workflows as JSON, auto-save to localStorage

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- API keys for Gemini and Banana Pro

### Installation

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.local.example .env.local
# Edit .env.local with your API keys

# Run development server
npm run dev
```

### Environment Variables

Create a `.env.local` file with:

```env
GEMINI_API_KEY=your_gemini_api_key_here
BANANA_PRO_API_URL=https://api.banana.dev/v1/generate
BANANA_PRO_API_KEY=your_banana_api_key_here
```

## Usage

1. **Add Nodes**: Click the "+" button in the left sidebar
2. **Upload Images**: Add a Source node and upload an image
3. **Connect Nodes**: Drag from output handles (right) to input handles (left)
4. **Generate Content**: Select a node and use the input panel at the bottom
5. **Export/Import**: Use the top bar buttons to save and load workflows

## Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Flow Editor**: @xyflow/react (ReactFlow)
- **State Management**: Zustand with persist middleware
- **Styling**: TailwindCSS
- **AI APIs**: Google Gemini, Banana Pro

## Project Structure

```
ai-storyboard-editor/
├── app/
│   ├── api/           # API routes for AI generation
│   ├── globals.css    # Global styles
│   ├── layout.tsx     # Root layout
│   └── page.tsx       # Main editor page
├── components/
│   ├── nodes/         # Node components (Source, Text, Image)
│   ├── ui/            # UI components (panels, popups)
│   ├── FlowCanvas.tsx # Main ReactFlow canvas
│   ├── LeftSidebar.tsx
│   └── TopBar.tsx
├── lib/
│   ├── api-clients/   # API client helpers
│   ├── utils.ts       # Utility functions
│   └── workflow-engine.ts
├── store/
│   └── workflowStore.ts
└── types/
    ├── nodes.ts
    └── workflow.ts
```

## License

MIT
