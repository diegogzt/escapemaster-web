"use client";

import React from "react";
import { cn } from "@/utils";

interface WidgetLayoutConfig {
  id: string;
  type: string;
  colSpan: number;
  rowSpan: number;
}

interface TemplatePreviewProps {
  layout: WidgetLayoutConfig[];
  className?: string;
  maxCols?: number;
  scale?: number;
}

// Widget type to color mapping for visual distinction
const WIDGET_COLORS: Record<string, string> = {
  stats: "bg-blue-200",
  upcoming: "bg-green-200",
  team: "bg-purple-200",
  revenue: "bg-yellow-200",
  calendar: "bg-pink-200",
  notes: "bg-orange-200",
  "revenue-chart": "bg-indigo-200",
  "occupancy-chart": "bg-teal-200",
  "quarterly-stats": "bg-cyan-200",
  "revenue-table": "bg-rose-200",
};

const WIDGET_LABELS: Record<string, string> = {
  stats: "S",
  upcoming: "U",
  team: "T",
  revenue: "R",
  calendar: "C",
  notes: "N",
  "revenue-chart": "RC",
  "occupancy-chart": "OC",
  "quarterly-stats": "QS",
  "revenue-table": "RT",
};

/**
 * TemplatePreview - Renders a miniature visual representation of a dashboard layout
 * Shows the relative positions and sizes of widgets as colored boxes
 */
export function TemplatePreview({
  layout,
  className,
  maxCols = 48,
  scale = 2, // Each column = 2px
}: TemplatePreviewProps) {
  if (!layout || layout.length === 0) {
    return (
      <div className={cn("w-full h-16 bg-gray-100 rounded flex items-center justify-center", className)}>
        <span className="text-xs text-gray-400">Sin widgets</span>
      </div>
    );
  }

  // Calculate total height needed
  const widgetPositions: { widget: WidgetLayoutConfig; top: number; left: number }[] = [];
  
  // Simple layout algorithm: stack widgets in order
  let rowStart = 0;
  let maxRowHeight = 0;
  let currentCol = 0;
  
  layout.forEach((widget) => {
    const colSpan = widget.colSpan || 24;
    const rowSpan = widget.rowSpan || 8;
    
    // If widget doesn't fit in current row, move to next row
    if (currentCol + colSpan > maxCols) {
      rowStart += maxRowHeight;
      currentCol = 0;
      maxRowHeight = 0;
    }
    
    widgetPositions.push({
      widget,
      top: rowStart,
      left: currentCol,
    });
    
    currentCol += colSpan;
    maxRowHeight = Math.max(maxRowHeight, rowSpan);
  });
  
  const totalHeight = rowStart + maxRowHeight;
  
  // Scale factor for display
  const colWidth = scale;
  const rowHeight = scale * 0.8;
  
  return (
    <div
      className={cn("relative bg-gray-50 rounded overflow-hidden border border-gray-200", className)}
      style={{
        width: maxCols * colWidth,
        height: totalHeight * rowHeight,
        minHeight: 40,
      }}
    >
      {widgetPositions.map(({ widget, top, left }) => {
        const color = WIDGET_COLORS[widget.type] || "bg-gray-300";
        const label = WIDGET_LABELS[widget.type] || "?";
        
        return (
          <div
            key={widget.id}
            className={cn(
              "absolute rounded-sm flex items-center justify-center text-[6px] font-bold text-gray-600 border border-white/50",
              color
            )}
            style={{
              left: left * colWidth,
              top: top * rowHeight,
              width: (widget.colSpan || 24) * colWidth - 1,
              height: (widget.rowSpan || 8) * rowHeight - 1,
            }}
            title={widget.type}
          >
            {label}
          </div>
        );
      })}
    </div>
  );
}

/**
 * TemplatePreviewCompact - Smaller version for dropdown lists
 */
export function TemplatePreviewCompact({
  layout,
  className,
}: {
  layout: WidgetLayoutConfig[];
  className?: string;
}) {
  return (
    <TemplatePreview
      layout={layout}
      className={cn("w-24", className)}
      scale={1.5}
    />
  );
}
