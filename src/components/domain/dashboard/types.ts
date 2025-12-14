import { ReactNode } from "react";

export type WidgetType =
  | "stats"
  | "upcoming"
  | "team"
  | "revenue"
  | "calendar"
  | "notes"
  | "revenue-chart"
  | "occupancy-chart"
  | "quarterly-stats"
  | "revenue-table";

// Widget-specific configuration options
export interface WidgetConfigOptions {
  // Stats widget
  showTrends?: boolean;
  columns?: number;
  // Chart widgets
  chartType?: "bar" | "line" | "area";
  showLegend?: boolean;
  dateRange?: "week" | "month" | "quarter" | "year";
  // Calendar widget
  defaultView?: "month" | "week" | "day";
  showWeekends?: boolean;
  // Notes widget
  maxNotes?: number;
  // Upcoming sessions
  limit?: number;
  showPastSessions?: boolean;
  // Revenue table
  pageSize?: number;
  sortBy?: string;
  // Generic
  title?: string;
  refreshInterval?: number; // in seconds
}

export interface WidgetConfig {
  id: string;
  type: WidgetType;
  title?: string;
  colSpan?: number;
  rowSpan?: number;
  config?: WidgetConfigOptions; // Widget-specific settings
}

export interface WidgetDefinition {
  type: WidgetType;
  title: string;
  description: string;
  component: React.ComponentType<WidgetConfigOptions>;
  defaultColSpan: number;
  defaultRowSpan?: number;
  // Define which config options this widget supports
  configurableOptions?: (keyof WidgetConfigOptions)[];
  defaultConfig?: WidgetConfigOptions;
}
