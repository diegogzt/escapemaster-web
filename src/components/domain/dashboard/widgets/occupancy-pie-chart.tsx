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

const data = [
  { name: "La Mazmorra", value: 400 },
  { name: "El Laboratorio", value: 300 },
  { name: "La Mansión", value: 300 },
  { name: "Bunker", value: 200 },
];

const COLORS = [
  "var(--color-primary)",
  "var(--color-secondary)",
  "#F59E0B",
  "#EF4444",
];

interface OccupancyPieChartWidgetProps extends WidgetConfigOptions {}

export function OccupancyPieChartWidget({
  showLegend = true,
}: OccupancyPieChartWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 200, height: 200 });

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

  // Calculate dynamic radii based on available space
  const minDim = Math.min(dimensions.width, dimensions.height - (showLegend ? 40 : 0));
  const outerRadius = Math.max(30, minDim * 0.35);
  const innerRadius = Math.max(20, outerRadius * 0.6);

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-beige h-full flex flex-col overflow-hidden">
      <div className="flex items-center gap-2 mb-2 flex-shrink-0">
        <PieChartIcon className="h-5 w-5 text-primary" />
        <h3 className="font-semibold text-dark text-sm">Ocupación por Sala</h3>
      </div>

      <div ref={containerRef} className="flex-1 min-h-[240px]">
        <ResponsiveContainer width="100%" height="100%">
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
      </div>
    </div>
  );
}
