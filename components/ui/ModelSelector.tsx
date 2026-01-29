'use client';

import { useState } from 'react';
import * as Popover from '@radix-ui/react-popover';
import { ChevronDown, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MODEL_SPECS_LIST, type ModelSpec } from '@/lib/modelSpecs';

interface ModelSelectorProps {
  value: string;
  onChange: (modelId: string) => void;
  disabled?: boolean;
}

export function ModelSelector({ value, onChange, disabled }: ModelSelectorProps) {
  const [open, setOpen] = useState(false);
  const selectedModel = MODEL_SPECS_LIST.find((m) => m.id === value);

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <button
          disabled={disabled}
          className={cn(
            'flex items-center gap-1.5 bg-surface-secondary px-2 py-1 rounded-lg',
            'hover:bg-interactive-hover transition-colors',
            'text-sm text-theme-text-primary',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
        >
          <span className="max-w-[120px] truncate">
            {selectedModel?.name || 'Select model'}
          </span>
          <ChevronDown
            className={cn(
              'w-3 h-3 transition-transform duration-200 flex-shrink-0',
              open && 'rotate-180'
            )}
          />
        </button>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          className={cn(
            'z-50 bg-surface-primary border border-node rounded-xl p-2 shadow-xl',
            'w-[220px] max-h-[300px] overflow-auto',
            'animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95',
            'data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2'
          )}
          side="top"
          align="start"
          sideOffset={8}
        >
          <div className="space-y-1">
            {MODEL_SPECS_LIST.map((model) => (
              <ModelOption
                key={model.id}
                model={model}
                selected={model.id === value}
                onSelect={() => {
                  onChange(model.id);
                  setOpen(false);
                }}
              />
            ))}
          </div>

          <Popover.Arrow className="fill-surface-primary" />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}

interface ModelOptionProps {
  model: ModelSpec;
  selected: boolean;
  onSelect: () => void;
}

function ModelOption({ model, selected, onSelect }: ModelOptionProps) {
  return (
    <button
      onClick={onSelect}
      className={cn(
        'w-full flex items-center gap-2 px-2 py-2 rounded-lg transition-colors text-left',
        selected
          ? 'bg-interactive-active'
          : 'hover:bg-interactive-hover'
      )}
    >
      <span className="flex-1 text-sm text-theme-text-primary truncate">
        {model.name}
      </span>
      {selected && (
        <Check className="w-4 h-4 text-blue-400 flex-shrink-0" />
      )}
    </button>
  );
}
