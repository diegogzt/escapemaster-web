"use client";

import React, { useState, useEffect } from "react";
import { Card } from "@/components/Card";
import Button from "@/components/Button";
import Input from "@/components/Input";
import { bookings as bookingsApi, rooms as roomsApi, dashboard } from "@/services/api";
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
  Loader2,
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

// Room colors palette
const ROOM_COLORS = ["#FF6B6B", "#4ECDC4", "#FFE66D", "#9B59B6", "#3498DB", "#E67E22"];

interface RevenueData {
  name: string;
  ingresos: number;
  gastos: number;
  beneficio: number;
}

interface RoomPopularity {
  name: string;
  value: number;
  color: string;
  [key: string]: string | number;
}

interface HourlyData {
  time: string;
  ocupacion: number;
}

interface ExpenseData {
  name: string;
  value: number;
}

// Default expenses (no API endpoint yet - can be extended later)
const DEFAULT_EXPENSES: ExpenseData[] = [
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
  
  // API data states
  const [loading, setLoading] = useState(true);
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [roomPopularity, setRoomPopularity] = useState<RoomPopularity[]>([]);
  const [hourlyDistribution, setHourlyDistribution] = useState<HourlyData[]>([]);
  const [expensesData] = useState<ExpenseData[]>(DEFAULT_EXPENSES); // TODO: Connect to expenses API
  const [stats, setStats] = useState({ totalRevenue: 0, totalBookings: 0, profit: 0 });

  // Fetch data from API
  useEffect(() => {
    async function fetchReportData() {
      try {
        setLoading(true);
        const [bookingsData, roomsData, dashboardStats] = await Promise.all([
          bookingsApi.list(),
          roomsApi.list(),
          dashboard.getStats(),
        ]);
        
        // Calculate revenue by day of week
        const dayNames = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
        const revenueByDay: Record<string, { ingresos: number; count: number }> = {};
        dayNames.forEach(d => { revenueByDay[d] = { ingresos: 0, count: 0 }; });
        
        // Calculate room popularity
        const roomBookings: Record<string, number> = {};
        
        // Calculate hourly distribution
        const hourlyData: Record<string, number> = {
          "10:00": 0, "12:00": 0, "14:00": 0, "16:00": 0, "18:00": 0, "20:00": 0, "22:00": 0
        };
        
        let totalRevenue = 0;
        
        // API returns: id, start_time, total_price, room_name, booking_status
        (bookingsData || []).forEach((b: any) => {
          const price = Number(b.total_price) || 0;
          totalRevenue += price;
          
          // Revenue by day - parse from start_time
          if (b.start_time) {
            const startTime = new Date(b.start_time);
            const day = startTime.getDay();
            const dayName = dayNames[day];
            if (revenueByDay[dayName]) {
              revenueByDay[dayName].ingresos += price;
              revenueByDay[dayName].count++;
            }
            
            // Hourly distribution
            const hour = startTime.getHours();
            const hourSlot = hour < 11 ? "10:00" : hour < 13 ? "12:00" : hour < 15 ? "14:00" : 
                            hour < 17 ? "16:00" : hour < 19 ? "18:00" : hour < 21 ? "20:00" : "22:00";
            hourlyData[hourSlot] = (hourlyData[hourSlot] || 0) + 1;
          }
          
          // Room popularity
          const roomName = b.room_name || "Sin sala";
          roomBookings[roomName] = (roomBookings[roomName] || 0) + 1;
        });
        
        // Transform to chart data
        const transformedRevenue: RevenueData[] = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"].map(d => ({
          name: d,
          ingresos: revenueByDay[d]?.ingresos || 0,
          gastos: Math.round((revenueByDay[d]?.ingresos || 0) * 0.3), // Estimate 30% costs
          beneficio: Math.round((revenueByDay[d]?.ingresos || 0) * 0.7),
        }));
        setRevenueData(transformedRevenue);
        
        // Transform room popularity
        const totalBookingsCount = Object.values(roomBookings).reduce((a, b) => a + b, 0);
        const transformedRooms: RoomPopularity[] = Object.entries(roomBookings)
          .map(([name, count], index) => ({
            name: name.length > 12 ? name.substring(0, 12) + "..." : name,
            value: totalBookingsCount > 0 ? Math.round((count / totalBookingsCount) * 100) : 0,
            color: ROOM_COLORS[index % ROOM_COLORS.length],
          }))
          .slice(0, 5);
        setRoomPopularity(transformedRooms);
        
        // Transform hourly
        const transformedHourly: HourlyData[] = Object.entries(hourlyData).map(([time, count]) => {
          const maxCount = Math.max(...Object.values(hourlyData), 1);
          return {
            time,
            ocupacion: Math.round((count / maxCount) * 100),
          };
        });
        setHourlyDistribution(transformedHourly);
        
        // Set stats
        setStats({
          totalRevenue,
          totalBookings: (bookingsData || []).length,
          profit: Math.round(totalRevenue * 0.7),
        });
        
      } catch (err) {
        console.error("Error fetching report data:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchReportData();
  }, []);

  const handleExport = (format: "csv" | "xlsx") => {
    // Export functionality
    const headers = ["Dia", "Ingresos", "Gastos", "Beneficio"];
    const rows = revenueData.map((d) => [
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

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-2" />
          <p className="text-gray-600">Cargando reportes...</p>
        </div>
      </div>
    );
  }

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
                <BarChart data={revenueData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
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
                            backgroundColor: (roomPopularity[i % roomPopularity.length]?.color || "#ccc") + "15",
                            color: roomPopularity[i % roomPopularity.length]?.color || "#666",
                          }}
                        >
                          {roomPopularity[i % roomPopularity.length]?.name || "Sin sala"}
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
                    data={roomPopularity}
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={8}
                    dataKey="value"
                  >
                    {roomPopularity.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-6 space-y-3">
              {roomPopularity.map((room, i) => (
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
                <AreaChart data={hourlyDistribution}>
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
              {expensesData.map((expense, i) => {
                const total = expensesData.reduce((acc, curr) => acc + curr.value, 0);
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
