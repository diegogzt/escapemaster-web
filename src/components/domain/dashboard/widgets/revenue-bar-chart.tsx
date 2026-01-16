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
import { TrendingUp, Loader2 } from "lucide-react";
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
  const [isReady, setIsReady] = useState(false);

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
            gastos: response.expenses ? (response.expenses[index] || 0) : 0, // Attempt to read expenses
          }));
          setData(chartData);
        }
      } catch (error) {
        console.error("Failed to fetch revenue", error);
      } finally {
        setLoading(false);
        setTimeout(() => setIsReady(true), 300);
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
      return (
        <div className="h-full w-full flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-primary/50" />
          <p className="text-xs font-medium text-[var(--color-muted-foreground)] animate-pulse">
            Cargando datos...
          </p>
        </div>
      );
    }

    if (data.length === 0) {
      return (
        <div className="h-full w-full flex flex-col items-center justify-center gap-2 px-6 text-center">
          <p className="text-sm font-medium text-[var(--color-muted-foreground)]">
            No hay datos de ingresos disponibles
          </p>
          <p className="text-xs text-secondary">
            Prueba a cambiar el rango de fechas
          </p>
        </div>
      );
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
            isAnimationActive={isReady}
          />
          {/* Hide expenses line if all 0? Or just show flat line at 0 */}
           <Line
            type="monotone"
            dataKey="gastos"
            stroke="var(--color-secondary)"
            strokeWidth={2}
            name="Gastos"
            dot={{ r: 4 }}
            isAnimationActive={isReady}
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
            isAnimationActive={isReady}
          />
           <Area
            type="monotone"
            dataKey="gastos"
            fill="var(--color-secondary)"
            fillOpacity={0.3}
            stroke="var(--color-secondary)"
            strokeWidth={2}
            name="Gastos"
            isAnimationActive={isReady}
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
          isAnimationActive={isReady}
        />
         <Bar
          dataKey="gastos"
          fill="var(--color-secondary)"
          radius={[4, 4, 0, 0]}
          name="Gastos"
          isAnimationActive={isReady}
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
            setLocalDateRange(e.target.value as "month" | "quarter" | "year" | "semester")
          }
        >
          <option value="month">Último mes</option>
          <option value="semester">Últimos 6 meses</option>
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
