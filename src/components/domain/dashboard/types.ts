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
  | "revenue-table"
  | "fiscal"
  | "projected";

// Widget-specific configuration options
export interface WidgetConfigOptions {
  // Stats widget
  showTrends?: boolean;
  columns?: number;
  visibleStats?: string[]; // e.g. ["revenue", "bookings", "customers", "rooms"]
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
  defaultPeriod?: "week" | "month" | "quarter" | "year";
  targetMonthly?: number;
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
  minColSpan?: number;
  minRowSpan?: number;
  // Define which config options this widget supports
  configurableOptions?: (keyof WidgetConfigOptions)[];
  defaultConfig?: WidgetConfigOptions;
}
