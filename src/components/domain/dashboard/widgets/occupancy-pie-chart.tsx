"use client";

import React, { useRef, useEffect, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import { PieChart as PieChartIcon } from "lucide-react";
import { WidgetConfigOptions } from "../types";
import { dashboard } from "@/services/api";

const COLORS = [
  "var(--color-primary)",
  "var(--color-secondary)",
  "#F59E0B",
  "#EF4444",
  "#10B981",
];

interface OccupancyPieChartWidgetProps extends WidgetConfigOptions {}

export function OccupancyPieChartWidget({
  showLegend = true,
}: OccupancyPieChartWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 200, height: 200 });
  const [data, setData] = useState<{ name: string; value: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        setDimensions({ width, height });
      }
    };

    updateDimensions();

    // Use ResizeObserver for responsive updates
    const resizeObserver = new ResizeObserver(updateDimensions);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => resizeObserver.disconnect();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const stats = await dashboard.getStats("month"); // Default to month for occupancy
        if (stats && Array.isArray(stats.top_rooms)) {
             const chartData = stats.top_rooms.map((room: any) => ({
                 name: room.name,
                 value: room.count || 0
             }));
             setData(chartData);
        } else {
             setData([]);
        }
      } catch (error) {
        console.error("Failed to fetch occupancy stats", error);
      } finally {
        setLoading(false);
        // Delay visual readiness slightly
        setTimeout(() => setIsReady(true), 300);
      }
    };
    fetchData();
  }, []);

  // Calculate dynamic radii based on available space
  const minDim = Math.max(0, Math.min(
    dimensions.width,
    dimensions.height - (showLegend ? 40 : 0)
  ));
  const outerRadius = Math.max(10, minDim * 0.35);
  const innerRadius = Math.max(5, outerRadius * 0.6);

  return (
    <div className="bg-[var(--color-background)] p-4 rounded-xl shadow-sm border border-[var(--color-beige)] h-full flex flex-col overflow-hidden">
      <div className="flex items-center gap-2 mb-2 flex-shrink-0">
        <PieChartIcon className="h-5 w-5 text-primary" />
        <h3 className="font-semibold text-[var(--color-foreground)] text-sm">Ocupación por Sala (Top 5)</h3>
      </div>

      <div ref={containerRef} className="flex-1 min-h-[240px]">
        {loading ? (
             <div className="h-full w-full flex items-center justify-center text-[var(--color-muted-foreground)]">Cargando...</div>
        ) : data.length === 0 ? (
             <div className="h-full w-full flex items-center justify-center text-[var(--color-muted-foreground)] text-sm p-4 text-center">No hay reservas registradas en este periodo.</div>
        ) : dimensions.width > 0 && dimensions.height > 0 ? (
        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={innerRadius}
              outerRadius={outerRadius}
              fill="#8884d8"
              paddingAngle={5}
              dataKey="value"
              isAnimationActive={isReady}
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip />
            {showLegend && (
              <Legend
                verticalAlign="bottom"
                height={36}
                wrapperStyle={{ fontSize: "12px" }}
              />
            )}
          </PieChart>
        </ResponsiveContainer>
        ) : null}
      </div>
    </div>
  );
}
