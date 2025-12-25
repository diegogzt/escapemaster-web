"use client";

import React, { useState } from "react";
import { Card } from "@/components/Card";
import Button from "@/components/Button";
import Input from "@/components/Input";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts";
import {
  Download,
  Calendar,
  TrendingUp,
  Users,
  DollarSign,
  Activity,
  Filter,
  Plus,
  CreditCard,
  AlertCircle,
  Wallet,
  X,
} from "lucide-react";

// Palette Colors
const COLORS = {
  primary: "#2c5f2d",
  secondary: "#97bc62",
  accent: "#d4a373",
  dark: "#1a3c1e",
  beige: "#f4e9cd",
  error: "#cc0303",
  white: "#ffffff",
};

// Mock Data
const REVENUE_DATA = [
  { name: "Lun", ingresos: 1200, gastos: 400, beneficio: 800 },
  { name: "Mar", ingresos: 900, gastos: 350, beneficio: 550 },
  { name: "Mié", ingresos: 1500, gastos: 500, beneficio: 1000 },
  { name: "Jue", ingresos: 1800, gastos: 600, beneficio: 1200 },
  { name: "Vie", ingresos: 2500, gastos: 800, beneficio: 1700 },
  { name: "Sáb", ingresos: 3200, gastos: 1000, beneficio: 2200 },
  { name: "Dom", ingresos: 2800, gastos: 900, beneficio: 1900 },
];

// Room colors are user-defined and fixed per room
const ROOM_POPULARITY = [
  { name: "La Prisión", value: 45, color: "#FF6B6B" }, // User defined color
  { name: "El Faraón", value: 30, color: "#4ECDC4" }, // User defined color
  { name: "Lab. Zombie", value: 25, color: "#FFE66D" }, // User defined color
];

const HOURLY_DISTRIBUTION = [
  { time: "10:00", ocupacion: 20 },
  { time: "12:00", ocupacion: 45 },
  { time: "14:00", ocupacion: 30 },
  { time: "16:00", ocupacion: 65 },
  { time: "18:00", ocupacion: 90 },
  { time: "20:00", ocupacion: 95 },
  { time: "22:00", ocupacion: 80 },
];

const EXPENSES_DATA = [
  { name: "Alquiler", value: 2000 },
  { name: "Nóminas", value: 4500 },
  { name: "Marketing", value: 1200 },
  { name: "Mantenimiento", value: 800 },
  { name: "Otros", value: 500 },
];

export default function ReportsPage() {
  const [dateRange, setDateRange] = useState("week");
  const [customDateStart, setCustomDateStart] = useState("");
  const [customDateEnd, setCustomDateEnd] = useState("");
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [showChartForm, setShowChartForm] = useState(false);

  const handleExport = (format: "csv" | "xlsx") => {
    // Mock export functionality
    const headers = ["Dia", "Ingresos", "Gastos", "Beneficio"];
    const rows = REVENUE_DATA.map((d) => [
      d.name,
      d.ingresos,
      d.gastos,
      d.beneficio,
    ]);

    let content = "";
    if (format === "csv") {
      content = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
      const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `reporte_financiero_${new Date().toISOString().split("T")[0]}.csv`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      alert(
        "La exportación a Excel requiere una librería adicional. Descargando CSV por defecto."
      );
      handleExport("csv");
    }
  };

  return (
    <div className="space-y-4 w-full max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary">
            Reportes y Finanzas
          </h1>
          <p className="text-dark opacity-75">
            Visión general del rendimiento de tu Escape Room
          </p>
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          <div className="bg-white border border-beige rounded-lg flex items-center px-3 py-2">
            <Calendar size={18} className="text-gray-400 mr-2" />
            <select
              className="bg-transparent border-none text-sm focus:outline-none text-dark min-w-[100px]"
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
            >
              <option value="today">Hoy</option>
              <option value="week">Esta Semana</option>
              <option value="month">Este Mes</option>
              <option value="3months">Últimos 3 Meses</option>
              <option value="6months">Últimos 6 Meses</option>
              <option value="year">Este Año</option>
              <option value="custom">Personalizado</option>
            </select>
          </div>

          {dateRange === "custom" && (
            <div className="flex gap-2 items-center bg-white border border-beige rounded-lg px-2 py-1">
              <input
                type="date"
                className="text-sm border-none focus:ring-0 p-1"
                value={customDateStart}
                onChange={(e) => setCustomDateStart(e.target.value)}
              />
              <span className="text-gray-400">-</span>
              <input
                type="date"
                className="text-sm border-none focus:ring-0 p-1"
                value={customDateEnd}
                onChange={(e) => setCustomDateEnd(e.target.value)}
              />
            </div>
          )}

          <Button variant="secondary" onClick={() => handleExport("csv")}>
            <Download size={18} className="mr-2" />
            Exportar CSV
          </Button>
          <Button variant="outline" onClick={() => setShowExpenseForm(true)}>
            <CreditCard size={18} className="mr-2" />
            Registrar Gasto
          </Button>
          <Button variant="primary" onClick={() => setShowChartForm(true)}>
            <Plus size={18} className="mr-2" />
            Crear Gráfica
          </Button>
        </div>
      </div>

      {/* Expense Form Modal */}
      {showExpenseForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md relative animate-in fade-in zoom-in duration-200">
            <button
              onClick={() => setShowExpenseForm(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-dark"
            >
              <X size={20} />
            </button>
            <h3 className="text-xl font-bold text-primary mb-4">
              Registrar Nuevo Gasto
            </h3>
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                setShowExpenseForm(false);
                alert("Gasto registrado");
              }}
            >
              <Input
                label="Concepto"
                placeholder="Ej. Factura de luz"
                required
              />
              <Input
                label="Monto (€)"
                type="number"
                placeholder="0.00"
                required
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Categoría
                </label>
                <select className="w-full rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary">
                  <option>Alquiler</option>
                  <option>Nóminas</option>
                  <option>Marketing</option>
                  <option>Mantenimiento</option>
                  <option>Suministros</option>
                  <option>Otros</option>
                </select>
              </div>
              <Input label="Fecha" type="date" required />
              <div className="flex justify-end gap-2 mt-6">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setShowExpenseForm(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit">Guardar Gasto</Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Create Chart Modal */}
      {showChartForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-lg relative animate-in fade-in zoom-in duration-200">
            <button
              onClick={() => setShowChartForm(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-dark"
            >
              <X size={20} />
            </button>
            <h3 className="text-xl font-bold text-primary mb-4">
              Crear Nueva Gráfica
            </h3>
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                setShowChartForm(false);
                alert("Gráfica creada");
              }}
            >
              <Input
                label="Título del Gráfico"
                placeholder="Ej. Reservas por día de la semana"
                required
              />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tipo de Gráfico
                  </label>
                  <select className="w-full rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary">
                    <option value="bar">Barras</option>
                    <option value="line">Líneas</option>
                    <option value="pie">Circular (Pie)</option>
                    <option value="area">Área</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fuente de Datos
                  </label>
                  <select className="w-full rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary">
                    <option value="revenue">Ingresos</option>
                    <option value="bookings">Reservas</option>
                    <option value="occupancy">Ocupación</option>
                    <option value="expenses">Gastos</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Métrica Principal
                </label>
                <select className="w-full rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary">
                  <option>Suma Total</option>
                  <option>Promedio</option>
                  <option>Conteo</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 mt-6">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setShowChartForm(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit">Crear Gráfica</Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Financial KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6 border-l-4 border-l-primary shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-500 mb-1 font-medium">
                Ingresos Totales
              </p>
              <h3 className="text-2xl font-bold text-dark">13.900€</h3>
              <span className="text-xs text-primary flex items-center mt-1 font-medium">
                <TrendingUp size={12} className="mr-1" /> +12.5% vs periodo
                anterior
              </span>
            </div>
            <div className="p-3 bg-primary/10 rounded-xl text-primary">
              <DollarSign size={24} />
            </div>
          </div>
        </Card>

        <Card className="p-6 border-l-4 border-l-secondary shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-500 mb-1 font-medium">
                Beneficio Neto
              </p>
              <h3 className="text-2xl font-bold text-dark">8.450€</h3>
              <span className="text-xs text-primary flex items-center mt-1 font-medium">
                <TrendingUp size={12} className="mr-1" /> +15.2% vs periodo
                anterior
              </span>
            </div>
            <div className="p-3 bg-secondary/10 rounded-xl text-secondary">
              <Wallet size={24} />
            </div>
          </div>
        </Card>

        <Card className="p-6 border-l-4 border-l-accent shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-500 mb-1 font-medium">
                Gastos Operativos
              </p>
              <h3 className="text-2xl font-bold text-dark">5.450€</h3>
              <span className="text-xs text-red-500 flex items-center mt-1 font-medium">
                <TrendingUp size={12} className="mr-1" /> +2.1% vs periodo
                anterior
              </span>
            </div>
            <div className="p-3 bg-accent/10 rounded-xl text-accent">
              <CreditCard size={24} />
            </div>
          </div>
        </Card>

        <Card className="p-6 border-l-4 border-l-error shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-500 mb-1 font-medium">
                Tasa de Cancelación
              </p>
              <h3 className="text-2xl font-bold text-dark">4.2%</h3>
              <span className="text-xs text-primary flex items-center mt-1 font-medium">
                <TrendingUp size={12} className="mr-1 rotate-180" /> -0.5% vs
                periodo anterior
              </span>
            </div>
            <div className="p-3 bg-red-100 rounded-xl text-error">
              <AlertCircle size={24} />
            </div>
          </div>
        </Card>
      </div>

      {/* Operational KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-beige rounded-full text-dark">
              <Activity size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-500">Reservas Totales</p>
              <p className="text-xl font-bold text-dark">139</p>
            </div>
          </div>
        </Card>
        <Card className="p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-beige rounded-full text-dark">
              <Users size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-500">Jugadores</p>
              <p className="text-xl font-bold text-dark">642</p>
            </div>
          </div>
        </Card>
        <Card className="p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-beige rounded-full text-dark">
              <DollarSign size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-500">Ticket Medio</p>
              <p className="text-xl font-bold text-dark">100€</p>
            </div>
          </div>
        </Card>
        <Card className="p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-beige rounded-full text-dark">
              <Activity size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-500">Ocupación Media</p>
              <p className="text-xl font-bold text-dark">78%</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Revenue vs Expenses Chart */}
        <Card className="p-6 shadow-md">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-lg text-dark">Balance Financiero</h3>
            <Button variant="ghost" size="sm">
              <Filter size={16} />
            </Button>
          </div>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={REVENUE_DATA}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#E5E5E5"
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: COLORS.dark }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: COLORS.dark }}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: "8px",
                    border: "none",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  }}
                  cursor={{ fill: "transparent" }}
                />
                <Legend />
                <Bar
                  dataKey="ingresos"
                  name="Ingresos"
                  fill={COLORS.primary}
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="gastos"
                  name="Gastos"
                  fill={COLORS.error}
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="beneficio"
                  name="Beneficio"
                  fill={COLORS.secondary}
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Hourly Occupancy Area Chart */}
        <Card className="p-6 shadow-md">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-lg text-dark">Ocupación por Hora</h3>
          </div>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={HOURLY_DISTRIBUTION}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient
                    id="colorOcupacion"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="5%"
                      stopColor={COLORS.primary}
                      stopOpacity={0.8}
                    />
                    <stop
                      offset="95%"
                      stopColor={COLORS.primary}
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="time"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: COLORS.dark }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: COLORS.dark }}
                  unit="%"
                />
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#E5E5E5"
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: "8px",
                    border: "none",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="ocupacion"
                  stroke={COLORS.primary}
                  fillOpacity={1}
                  fill="url(#colorOcupacion)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Room Popularity Pie Chart */}
        <Card className="p-6 shadow-md">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-lg text-dark">
              Popularidad de Salas
            </h3>
            <span className="text-xs text-gray-500">
              *Colores asignados por sala
            </span>
          </div>
          <div className="flex flex-col md:flex-row items-center justify-center h-[350px]">
            <div className="w-full h-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={ROOM_POPULARITY}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={120}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {ROOM_POPULARITY.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.color}
                        strokeWidth={0}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    iconType="circle"
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </Card>

        {/* Expenses Breakdown */}
        <Card className="p-6 shadow-md">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-lg text-dark">Desglose de Gastos</h3>
          </div>
          <div className="h-[350px] w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={EXPENSES_DATA}
                  cx="50%"
                  cy="50%"
                  outerRadius={120}
                  fill="#8884d8"
                  dataKey="value"
                  label={({
                    name,
                    percent,
                  }: {
                    name?: string;
                    percent?: number;
                  }) =>
                    `${name || ""} ${(percent ? percent * 100 : 0).toFixed(0)}%`
                  }
                >
                  {EXPENSES_DATA.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={
                        [
                          COLORS.primary,
                          COLORS.secondary,
                          COLORS.accent,
                          COLORS.dark,
                          COLORS.beige,
                        ][index % 5]
                      }
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Recent Activity Table */}
      <Card className="p-6 shadow-md">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-bold text-lg text-dark">Últimas Transacciones</h3>
          <Button variant="ghost" size="sm" className="text-primary">
            Ver todas
          </Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-gray-500 border-b border-beige">
                <th className="pb-3 font-medium pl-4">ID</th>
                <th className="pb-3 font-medium">Cliente</th>
                <th className="pb-3 font-medium">Sala</th>
                <th className="pb-3 font-medium">Fecha</th>
                <th className="pb-3 font-medium text-right pr-4">Monto</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-beige">
              {[1, 2, 3, 4, 5].map((i) => (
                <tr key={i} className="hover:bg-beige/20 transition-colors">
                  <td className="py-3 text-gray-500 pl-4">#RES-{1000 + i}</td>
                  <td className="py-3 font-medium text-dark">Cliente {i}</td>
                  <td className="py-3">
                    <span
                      className="px-2 py-1 rounded-full text-xs font-medium"
                      style={{
                        backgroundColor: ROOM_POPULARITY[i % 3].color + "20",
                        color: ROOM_POPULARITY[i % 3].color,
                      }}
                    >
                      {ROOM_POPULARITY[i % 3].name}
                    </span>
                  </td>
                  <td className="py-3 text-gray-500">21 Dic, 2025</td>
                  <td className="py-3 text-right font-bold text-primary pr-4">
                    +120€
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
