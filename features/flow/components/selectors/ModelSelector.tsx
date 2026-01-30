'use client';

import { MODEL_SPECS_LIST } from '@/lib/modelSpecs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface ModelSelectorProps {
  value: string;
  onChange: (modelId: string) => void;
  disabled?: boolean;
}

export function ModelSelector({ value, onChange, disabled }: ModelSelectorProps) {
  const selectedModel = MODEL_SPECS_LIST.find((m) => m.id === value);

  return (
    <Select value={value} onValueChange={onChange} disabled={disabled}>
      <SelectTrigger className="h-8 w-auto gap-1.5 border-none bg-secondary px-2 text-sm shadow-none hover:bg-accent">
        <SelectValue placeholder="Select model">
          {selectedModel?.name || 'Select model'}
        </SelectValue>
      </SelectTrigger>
      <SelectContent side="top" align="start">
        {MODEL_SPECS_LIST.map((model) => (
          <SelectItem key={model.id} value={model.id}>
            {model.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
