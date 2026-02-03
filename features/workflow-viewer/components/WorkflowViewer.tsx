'use client';

import { useCallback } from 'react';
import { ReactFlowProvider } from '@xyflow/react';

import { ViewerHeader } from './ViewerHeader';
import { ReadOnlyFlowCanvas } from './ReadOnlyFlowCanvas';
import type { WorkflowData } from '../types';

interface WorkflowViewerProps {
  workflow: WorkflowData;
  onClose: () => void;
  onClone?: (workflowId: string) => void;
}

export function WorkflowViewer({ workflow, onClose, onClone }: WorkflowViewerProps) {
  const handleClone = useCallback(() => {
    if (onClone) {
      onClone(workflow.id);
    }
    // Mock: just log for now
    console.log('Clone workflow:', workflow.id);
  }, [workflow.id, onClone]);

  return (
    <main className="flex-1 flex flex-col h-full p-4 overflow-hidden">
      {/* Header bar */}
      <ViewerHeader
        projectName={workflow.projectName}
        author={workflow.author}
        onBack={onClose}
        onClone={handleClone}
      />

      {/* Canvas container with border and padding */}
      <div className="flex-1 mt-4 rounded-xl border bg-muted/20 overflow-hidden">
        <ReactFlowProvider>
          <ReadOnlyFlowCanvas
            nodes={workflow.nodes}
            edges={workflow.edges}
          />
        </ReactFlowProvider>
      </div>
    </main>
  );
}
