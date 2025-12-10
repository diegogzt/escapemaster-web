"use client";

import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { TrendingUp } from "lucide-react";

const data = [
  { name: "Ene", ingresos: 4000, gastos: 2400 },
  { name: "Feb", ingresos: 3000, gastos: 1398 },
  { name: "Mar", ingresos: 2000, gastos: 9800 },
  { name: "Abr", ingresos: 2780, gastos: 3908 },
  { name: "May", ingresos: 1890, gastos: 4800 },
  { name: "Jun", ingresos: 2390, gastos: 3800 },
  { name: "Jul", ingresos: 3490, gastos: 4300 },
];

export function RevenueBarChartWidget() {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-beige h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-dark">Ingresos vs Gastos</h3>
        </div>
        <select className="text-sm border-beige rounded-md px-2 py-1 text-secondary">
          <option>Últimos 6 meses</option>
          <option>Este año</option>
        </select>
      </div>

      <div className="flex-1 min-h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#E5E7EB"
            />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#6B7280" }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#6B7280" }}
            />
            <Tooltip
              contentStyle={{
                borderRadius: "8px",
                border: "none",
                boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
              }}
            />
            <Legend />
            <Bar
              dataKey="ingresos"
              fill="var(--color-primary)"
              radius={[4, 4, 0, 0]}
              name="Ingresos"
            />
            <Bar
              dataKey="gastos"
              fill="var(--color-secondary)"
              radius={[4, 4, 0, 0]}
              name="Gastos"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
