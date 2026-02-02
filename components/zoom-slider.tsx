"use client";

import React from "react";
import { Maximize, Minus, Plus } from "lucide-react";

import {
  Panel,
  useViewport,
  useStore,
  useReactFlow,
  type PanelProps,
} from "@xyflow/react";

import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ZoomSlider({
  className,
  orientation = "horizontal",
  ...props
}: Omit<PanelProps, "children"> & {
  orientation?: "horizontal" | "vertical";
}) {
  const { zoom } = useViewport();
  const { zoomTo, zoomIn, zoomOut, fitView } = useReactFlow();
  const minZoom = useStore((state) => state.minZoom);
  const maxZoom = useStore((state) => state.maxZoom);

  return (
    <Panel
      className={cn(
        "bg-card text-card-foreground border border-border flex gap-0.5 rounded-lg p-0.5",
        orientation === "horizontal" ? "flex-row" : "flex-col",
        className,
      )}
      {...props}
    >
      <div
        className={cn(
          "flex gap-0.5",
          orientation === "horizontal" ? "flex-row" : "flex-col-reverse",
        )}
      >
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={() => zoomOut({ duration: 300 })}
        >
          <Minus className="h-3 w-3" />
        </Button>
        <Slider
          className={cn(
            orientation === "horizontal" ? "w-24" : "h-24",
          )}
          orientation={orientation}
          value={[zoom]}
          min={minZoom}
          max={maxZoom}
          step={0.01}
          onValueChange={(values) => zoomTo(values[0])}
        />
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={() => zoomIn({ duration: 300 })}
        >
          <Plus className="h-3 w-3" />
        </Button>
      </div>
      <Button
        className={cn(
          "tabular-nums h-7 px-1.5 text-xs",
          orientation === "horizontal"
            ? "min-w-[40px]"
            : "w-7",
        )}
        variant="ghost"
        onClick={() => zoomTo(1, { duration: 300 })}
      >
        {(100 * zoom).toFixed(0)}%
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7"
        onClick={() => fitView({ duration: 300 })}
      >
        <Maximize className="h-3 w-3" />
      </Button>
    </Panel>
  );
}
