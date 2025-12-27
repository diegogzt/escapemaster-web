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
    <div className="space-y-8 w-full pb-12 px-4 lg:px-8">
      {/* Header - More compact and desktop-oriented */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 bg-white p-6 rounded-2xl border border-beige/50 shadow-sm">
        <div>
          <h1 className="text-4xl font-bold text-primary tracking-tight">
            Panel de Control Financiero
          </h1>
          <p className="text-dark/60 mt-1 text-lg">
            Análisis detallado del rendimiento y métricas operativas.
          </p>
        </div>
        <div className="flex flex-wrap gap-3 items-center w-full lg:w-auto">
          <div className="bg-light/50 border border-beige rounded-xl flex items-center px-4 py-2.5 focus-within:ring-2 focus-within:ring-primary/20 transition-all">
            <Calendar size={18} className="text-primary mr-2" />
            <select
              className="bg-transparent border-none text-sm font-semibold focus:outline-none text-dark w-full lg:min-w-[160px]"
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

          <div className="flex gap-2">
            <Button variant="outline" onClick={() => handleExport("csv")} className="bg-white">
              <Download size={18} className="mr-2" />
              Exportar
            </Button>
            <Button variant="primary" onClick={() => setShowExpenseForm(true)} className="shadow-lg shadow-primary/20">
              <Plus size={18} className="mr-2" />
              Nuevo Registro
            </Button>
          </div>
        </div>
      </div>

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-12 gap-8">
        {/* Left Column: KPIs and Main Charts (8 cols) */}
        <div className="col-span-12 lg:col-span-8 space-y-8">
          {/* Financial KPIs - 4 per row on desktop */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            <Card className="p-6 border-none shadow-sm bg-white hover:shadow-md transition-all group">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-primary/10 rounded-2xl text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                  <DollarSign size={24} />
                </div>
                <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded-full">
                  +12.5%
                </span>
              </div>
              <p className="text-sm font-medium text-gray-500 mb-1">Ingresos Totales</p>
              <h3 className="text-3xl font-bold text-dark">13.900€</h3>
            </Card>

            <Card className="p-6 border-none shadow-sm bg-white hover:shadow-md transition-all group">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-secondary/10 rounded-2xl text-secondary group-hover:bg-secondary group-hover:text-white transition-colors">
                  <Wallet size={24} />
                </div>
                <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded-full">
                  +15.2%
                </span>
              </div>
              <p className="text-sm font-medium text-gray-500 mb-1">Beneficio Neto</p>
              <h3 className="text-3xl font-bold text-dark">8.450€</h3>
            </Card>

            <Card className="p-6 border-none shadow-sm bg-white hover:shadow-md transition-all group">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-accent/10 rounded-2xl text-accent group-hover:bg-accent group-hover:text-white transition-colors">
                  <CreditCard size={24} />
                </div>
                <span className="text-xs font-bold text-red-500 bg-red-50 px-2 py-1 rounded-full">
                  +2.1%
                </span>
              </div>
              <p className="text-sm font-medium text-gray-500 mb-1">Gastos</p>
              <h3 className="text-3xl font-bold text-dark">5.450€</h3>
            </Card>

            <Card className="p-6 border-none shadow-sm bg-white hover:shadow-md transition-all group">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-red-50 rounded-2xl text-error group-hover:bg-error group-hover:text-white transition-colors">
                  <AlertCircle size={24} />
                </div>
                <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded-full">
                  -0.5%
                </span>
              </div>
              <p className="text-sm font-medium text-gray-500 mb-1">Cancelaciones</p>
              <h3 className="text-3xl font-bold text-dark">4.2%</h3>
            </Card>
          </div>

          {/* Main Chart: Balance Financiero */}
          <Card className="p-8 border-none shadow-sm bg-white">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h3 className="text-xl font-bold text-dark">Balance Financiero Semanal</h3>
                <p className="text-sm text-gray-500">Comparativa de ingresos vs gastos operativos</p>
              </div>
              <div className="flex gap-2">
                <div className="flex items-center text-xs font-medium text-gray-500 mr-4">
                  <span className="w-3 h-3 bg-primary rounded-full mr-1.5"></span> Ingresos
                </div>
                <div className="flex items-center text-xs font-medium text-gray-500">
                  <span className="w-3 h-3 bg-error rounded-full mr-1.5"></span> Gastos
                </div>
              </div>
            </div>
            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={REVENUE_DATA} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0F0F0" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#9CA3AF', fontSize: 12 }} 
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#9CA3AF', fontSize: 12 }}
                  />
                  <Tooltip
                    cursor={{ fill: '#F9FAFB' }}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="ingresos" fill={COLORS.primary} radius={[6, 6, 0, 0]} barSize={32} />
                  <Bar dataKey="gastos" fill={COLORS.error} radius={[6, 6, 0, 0]} barSize={32} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Recent Activity Table */}
          <Card className="border-none shadow-sm bg-white overflow-hidden">
            <div className="p-6 border-b border-gray-50 flex justify-between items-center">
              <h3 className="text-xl font-bold text-dark">Últimas Transacciones</h3>
              <Button variant="ghost" size="sm" className="text-primary font-bold">
                Ver historial completo
              </Button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-light/30 text-gray-500 text-xs uppercase tracking-wider">
                    <th className="px-6 py-4 font-bold">Referencia</th>
                    <th className="px-6 py-4 font-bold">Cliente</th>
                    <th className="px-6 py-4 font-bold">Sala / Servicio</th>
                    <th className="px-6 py-4 font-bold">Fecha</th>
                    <th className="px-6 py-4 font-bold text-right">Monto</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <tr key={i} className="hover:bg-light/20 transition-colors group">
                      <td className="px-6 py-4 text-sm text-gray-500 font-mono">#RES-{1000 + i}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="w-8 h-8 rounded-full bg-beige/40 flex items-center justify-center text-primary font-bold text-xs mr-3">
                            C{i}
                          </div>
                          <span className="text-sm font-bold text-dark">Cliente {i}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide"
                          style={{
                            backgroundColor: ROOM_POPULARITY[i % 3].color + "15",
                            color: ROOM_POPULARITY[i % 3].color,
                          }}
                        >
                          {ROOM_POPULARITY[i % 3].name}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">21 Dic, 2025</td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-sm font-bold text-primary">+120,00€</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Right Column: Secondary Charts and Stats (4 cols) */}
        <div className="col-span-12 lg:col-span-4 space-y-8">
          {/* Room Popularity */}
          <Card className="p-8 border-none shadow-sm bg-white">
            <h3 className="text-xl font-bold text-dark mb-6">Popularidad de Salas</h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={ROOM_POPULARITY}
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={8}
                    dataKey="value"
                  >
                    {ROOM_POPULARITY.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-6 space-y-3">
              {ROOM_POPULARITY.map((room, i) => (
                <div key={i} className="flex justify-between items-center">
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full mr-3" style={{ backgroundColor: room.color }}></div>
                    <span className="text-sm font-medium text-dark">{room.name}</span>
                  </div>
                  <span className="text-sm font-bold text-dark">{room.value}%</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Hourly Occupancy */}
          <Card className="p-8 border-none shadow-sm bg-white">
            <h3 className="text-xl font-bold text-dark mb-6">Picos de Ocupación</h3>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={HOURLY_DISTRIBUTION}>
                  <defs>
                    <linearGradient id="colorOcc" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.3}/>
                      <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0F0F0" />
                  <XAxis dataKey="time" hide />
                  <Tooltip />
                  <Area 
                    type="monotone" 
                    dataKey="ocupacion" 
                    stroke={COLORS.primary} 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorOcc)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 p-4 bg-light/30 rounded-xl border border-beige/30">
              <p className="text-xs text-dark/60 leading-relaxed">
                <span className="font-bold text-primary">Tip:</span> El pico máximo de ocupación se registra a las <span className="font-bold">20:00h</span>. Considera reforzar el personal en este horario.
              </p>
            </div>
          </Card>

          {/* Expenses Breakdown */}
          <Card className="p-8 border-none shadow-sm bg-white">
            <h3 className="text-xl font-bold text-dark mb-6">Distribución de Gastos</h3>
            <div className="space-y-6">
              {EXPENSES_DATA.map((expense, i) => {
                const total = EXPENSES_DATA.reduce((acc, curr) => acc + curr.value, 0);
                const percentage = (expense.value / total) * 100;
                return (
                  <div key={i} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-gray-600">{expense.name}</span>
                      <span className="font-bold text-dark">{expense.value}€</span>
                    </div>
                    <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-accent rounded-full" 
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
