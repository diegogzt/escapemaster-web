"use client";

import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import { PieChart as PieChartIcon } from "lucide-react";

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

export function OccupancyPieChartWidget() {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-beige h-full flex flex-col">
      <div className="flex items-center gap-2 mb-6">
        <PieChartIcon className="h-5 w-5 text-primary" />
        <h3 className="font-semibold text-dark">Ocupación por Sala</h3>
      </div>

      <div className="flex-1 min-h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
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
            <Legend verticalAlign="bottom" height={36} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
