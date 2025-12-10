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

export interface WidgetConfig {
  id: string;
  type: WidgetType;
  title?: string;
  colSpan?: number; // 1, 2, 3, 4 (based on grid-cols-4)
  rowSpan?: number; // 1, 2, 3, 4 (based on grid rows)
}

export interface WidgetDefinition {
  type: WidgetType;
  title: string;
  description: string;
  component: React.ComponentType<any>;
  defaultColSpan: number;
  defaultRowSpan?: number;
}
