"use client";

import React, { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { TrendingUp } from "lucide-react";
import { WidgetConfigOptions } from "../types";

// Datos mensuales (últimos 6 meses)
const dataMonthly = [
  { name: "Ene", ingresos: 4000, gastos: 2400 },
  { name: "Feb", ingresos: 3000, gastos: 1398 },
  { name: "Mar", ingresos: 2000, gastos: 9800 },
  { name: "Abr", ingresos: 2780, gastos: 3908 },
  { name: "May", ingresos: 1890, gastos: 4800 },
  { name: "Jun", ingresos: 2390, gastos: 3800 },
];

// Datos trimestrales
const dataQuarterly = [
  { name: "Q1", ingresos: 9000, gastos: 13598 },
  { name: "Q2", ingresos: 7060, gastos: 12508 },
  { name: "Q3", ingresos: 8280, gastos: 11900 },
  { name: "Q4", ingresos: 9500, gastos: 10200 },
];

// Datos anuales
const dataYearly = [
  { name: "2022", ingresos: 28000, gastos: 35000 },
  { name: "2023", ingresos: 32000, gastos: 30000 },
  { name: "2024", ingresos: 38000, gastos: 32000 },
];

interface RevenueBarChartWidgetProps extends WidgetConfigOptions {}

export function RevenueBarChartWidget({
  chartType = "bar",
  showLegend = true,
  dateRange = "month",
}: RevenueBarChartWidgetProps) {
  const [localDateRange, setLocalDateRange] = useState(dateRange);

  // Sync with prop changes
  useEffect(() => {
    setLocalDateRange(dateRange);
  }, [dateRange]);

  // Select data based on date range
  const getData = () => {
    switch (localDateRange) {
      case "quarter":
        return dataQuarterly;
      case "year":
        return dataYearly;
      case "month":
      default:
        return dataMonthly;
    }
  };

  const data = getData();

  const renderChart = () => {
    const commonProps = {
      data,
      margin: { top: 5, right: 10, left: 0, bottom: 5 },
    };

    const commonAxisProps = {
      axisLine: false,
      tickLine: false,
      tick: { fill: "#6B7280", fontSize: 12 },
    };

    if (chartType === "line") {
      return (
        <LineChart {...commonProps}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
          <XAxis dataKey="name" {...commonAxisProps} />
          <YAxis {...commonAxisProps} width={50} />
          <Tooltip
            contentStyle={{
              borderRadius: "8px",
              border: "none",
              boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
            }}
          />
          {showLegend && <Legend />}
          <Line type="monotone" dataKey="ingresos" stroke="var(--color-primary)" strokeWidth={2} name="Ingresos" dot={{ r: 4 }} />
          <Line type="monotone" dataKey="gastos" stroke="var(--color-secondary)" strokeWidth={2} name="Gastos" dot={{ r: 4 }} />
        </LineChart>
      );
    }

    if (chartType === "area") {
      return (
        <AreaChart {...commonProps}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
          <XAxis dataKey="name" {...commonAxisProps} />
          <YAxis {...commonAxisProps} width={50} />
          <Tooltip
            contentStyle={{
              borderRadius: "8px",
              border: "none",
              boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
            }}
          />
          {showLegend && <Legend />}
          <Area type="monotone" dataKey="ingresos" fill="var(--color-primary)" fillOpacity={0.3} stroke="var(--color-primary)" strokeWidth={2} name="Ingresos" />
          <Area type="monotone" dataKey="gastos" fill="var(--color-secondary)" fillOpacity={0.3} stroke="var(--color-secondary)" strokeWidth={2} name="Gastos" />
        </AreaChart>
      );
    }

    // Default: bar chart
    return (
      <BarChart {...commonProps}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
        <XAxis dataKey="name" {...commonAxisProps} />
        <YAxis {...commonAxisProps} width={50} />
        <Tooltip
          contentStyle={{
            borderRadius: "8px",
            border: "none",
            boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
          }}
        />
        {showLegend && <Legend />}
        <Bar dataKey="ingresos" fill="var(--color-primary)" radius={[4, 4, 0, 0]} name="Ingresos" />
        <Bar dataKey="gastos" fill="var(--color-secondary)" radius={[4, 4, 0, 0]} name="Gastos" />
      </BarChart>
    );
  };

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-beige h-full flex flex-col overflow-hidden">
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-dark text-sm">Ingresos vs Gastos</h3>
        </div>
        <select
          className="text-xs border border-beige rounded-md px-2 py-1 text-secondary"
          aria-label="Período de tiempo"
          value={localDateRange}
          onChange={(e) => setLocalDateRange(e.target.value as "month" | "quarter" | "year")}
        >
          <option value="month">Últimos 6 meses</option>
          <option value="quarter">Trimestral</option>
          <option value="year">Anual</option>
        </select>
      </div>

      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          {renderChart()}
        </ResponsiveContainer>
      </div>
    </div>
  );
}
