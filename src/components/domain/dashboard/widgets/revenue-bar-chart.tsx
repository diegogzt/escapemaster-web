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
import { dashboard } from "@/services/api";

interface RevenueBarChartWidgetProps extends WidgetConfigOptions {}

interface RevenueDataPoint {
  name: string;
  ingresos: number;
  gastos: number;
}

export function RevenueBarChartWidget({
  chartType = "bar",
  showLegend = true,
  dateRange = "month",
}: RevenueBarChartWidgetProps) {
  const [localDateRange, setLocalDateRange] = useState(dateRange);
  const [data, setData] = useState<RevenueDataPoint[]>([]);
  const [loading, setLoading] = useState(true);

  // Sync with prop changes
  useEffect(() => {
    setLocalDateRange(dateRange);
  }, [dateRange]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await dashboard.getRevenue(localDateRange);
        if (response && response.labels) {
          const chartData = response.labels.map((label: string, index: number) => ({
            name: label,
            ingresos: response.data[index] || 0,
            gastos: 0, // Expenses not yet tracked in backend
          }));
          setData(chartData);
        }
      } catch (error) {
        console.error("Failed to fetch revenue", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [localDateRange]);

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

    if (loading) {
        return <div className="h-full w-full flex items-center justify-center text-[var(--color-muted-foreground)]">Cargando datos...</div>;
    }
    
    if (data.length === 0) {
        return <div className="h-full w-full flex items-center justify-center text-[var(--color-muted-foreground)]">No hay datos de ingresos disponibles.</div>;
    }

    if (chartType === "line") {
      return (
        <LineChart {...commonProps}>
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            stroke="#E5E7EB"
          />
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
          <Line
            type="monotone"
            dataKey="ingresos"
            stroke="var(--color-primary)"
            strokeWidth={2}
            name="Ingresos"
            dot={{ r: 4 }}
          />
          {/* Hide expenses line if all 0? Or just show flat line at 0 */}
           <Line
            type="monotone"
            dataKey="gastos"
            stroke="var(--color-secondary)"
            strokeWidth={2}
            name="Gastos"
            dot={{ r: 4 }}
          />
        </LineChart>
      );
    }

    if (chartType === "area") {
      return (
        <AreaChart {...commonProps}>
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            stroke="#E5E7EB"
          />
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
          <Area
            type="monotone"
            dataKey="ingresos"
            fill="var(--color-primary)"
            fillOpacity={0.3}
            stroke="var(--color-primary)"
            strokeWidth={2}
            name="Ingresos"
          />
           <Area
            type="monotone"
            dataKey="gastos"
            fill="var(--color-secondary)"
            fillOpacity={0.3}
            stroke="var(--color-secondary)"
            strokeWidth={2}
            name="Gastos"
          />
        </AreaChart>
      );
    }

    // Default: bar chart
    return (
      <BarChart {...commonProps}>
        <CartesianGrid
          strokeDasharray="3 3"
          vertical={false}
          stroke="#E5E7EB"
        />
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
    );
  };

  return (
    <div className="bg-[var(--color-background)] p-4 rounded-xl shadow-sm border border-[var(--color-beige)] h-full flex flex-col overflow-hidden">
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-[var(--color-foreground)] text-sm">
            Ingresos vs Gastos
          </h3>
        </div>
        <select
          className="text-xs border border-[var(--color-beige)] rounded-md px-2 py-1 text-secondary"
          aria-label="Período de tiempo"
          value={localDateRange}
          onChange={(e) =>
            setLocalDateRange(e.target.value as "month" | "quarter" | "year")
          }
        >
          <option value="month">Últimos 6 meses (Mes)</option>
          <option value="quarter">Trimestral</option>
          <option value="year">Anual</option>
        </select>
      </div>

      <div className="flex-1 min-h-[240px]">
        <ResponsiveContainer width="100%" height="100%">
          {renderChart()}
        </ResponsiveContainer>
      </div>
    </div>
  );
}
