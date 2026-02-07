"use client";

import React, { useState, useEffect, useRef } from "react";
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
  const [localDateRange, setLocalDateRange] = useState<"month" | "quarter" | "year" | "semester" | "week">(dateRange as any);
  const [data, setData] = useState<RevenueDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [isReady, setIsReady] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        setDimensions({ width, height });
      }
    };

    updateDimensions();
    const resizeObserver = new ResizeObserver(updateDimensions);
    if (containerRef.current) resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  // Sync with prop changes
  useEffect(() => {
    setLocalDateRange(dateRange);
  }, [dateRange]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await dashboard.getRevenue(localDateRange);
        if (response && Array.isArray(response.labels)) {
          const chartData = response.labels.map((label: string, index: number) => ({
            name: label,
            ingresos: (response.data && response.data[index]) || 0,
            gastos: response.expenses ? (response.expenses[index] || 0) : 0,
          }));
          setData(chartData);
        } else {
          setData([]);
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

    const formatXAxis = (tick: any) => {
      if (typeof tick === "string" && tick.includes("-") && tick.length === 10) {
        // Assume YYYY-MM-DD and show only DD
        return tick.split("-")[2];
      }
      return tick;
    };

    const commonAxisProps = {
      axisLine: false,
      tickLine: false,
      tick: { fill: "#6B7280", fontSize: 10 },
      tickFormatter: formatXAxis,
    };



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

      <div ref={containerRef} className="flex-1 min-h-[240px] relative">
        {loading ? (
             <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[var(--color-background)] z-10">
               <Loader2 className="w-6 h-6 animate-spin text-primary/50" />
               <p className="text-xs font-medium text-[var(--color-muted-foreground)] animate-pulse">
                 Cargando...
               </p>
             </div>
        ) : data.length === 0 ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-6 text-center">
              <p className="text-sm font-medium text-[var(--color-muted-foreground)]">
                No hay datos
              </p>
            </div>
        ) : dimensions.width > 0 && dimensions.height > 0 ? (
             <ResponsiveContainer width="100%" height="100%" minHeight={240}>
               {renderChart()}
             </ResponsiveContainer>
        ) : null}
      </div>
    </div>
  );
}
