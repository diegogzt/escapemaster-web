"use client";

import React, { useState, useEffect } from "react";
import { Card } from "@/components/Card";
import Button from "@/components/Button";
import { reports as reportsApi, widgets as widgetsApi } from "@/services/api";
import { CalculatorModal } from "@/components/domain/dashboard/reports/CalculatorModal";
import { FiscalWidget } from "@/components/domain/dashboard/widgets/FiscalWidget";
import { ProjectedEarningsWidget } from "@/components/domain/dashboard/widgets/ProjectedEarningsWidget";
import {
  Download,
  Calendar,
  Calculator,
  LayoutDashboard,
  FileText,
  Loader2,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState<"operational" | "fiscal">("operational");
  const [showCalculator, setShowCalculator] = useState(false);
  const [loading, setLoading] = useState(false); // Managed by widgets mostly, but kept for global actions

  // Fiscal Filter State
  const [fiscalYear, setFiscalYear] = useState(new Date().getFullYear().toString());
  const [fiscalPeriod, setFiscalPeriod] = useState("year"); // year, 1T, 2T, 3T, 4T

  // Fiscal Data State
  const [fiscalData, setFiscalData] = useState<any>(null);

  // Fetch Fiscal Data when filters change
  useEffect(() => {
    if (activeTab === "fiscal") {
      fetchFiscalData();
    }
  }, [activeTab, fiscalYear, fiscalPeriod]);

  const fetchFiscalData = async () => {
    try {
      setLoading(true);
      let startDate, endDate;
      const year = parseInt(fiscalYear);

      if (fiscalPeriod === "year") {
        startDate = `${year}-01-01`;
        endDate = `${year}-12-31`;
      } else {
        const q = parseInt(fiscalPeriod[0]); // 1, 2, 3, 4
        // Calculate quarter dates
        const startMonth = (q - 1) * 3; // 0, 3, 6, 9
        startDate = new Date(year, startMonth, 1).toISOString().split('T')[0];
        // End of quarter
        const endMonthDate = new Date(year, startMonth + 3, 0);
        endDate = endMonthDate.toISOString().split('T')[0];
      }

      const data = await reportsApi.getRevenue({
        start_date: startDate,
        end_date: endDate,
        type: "actual",
        group_by: fiscalPeriod === "year" ? "quarter" : "month"
      });
      setFiscalData(data);
    } catch (err) {
      console.error("Error fetching fiscal data", err);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format: "pdf" | "excel") => {
    try {
      // In a real app we would use the blob response
      await reportsApi.exportBookings(format);
      alert("Reporte descargado correctamente (Simulado)");
    } catch (error) {
       console.error("Export failed", error);
    }
  };

  return (
    <div className="space-y-8 w-full pb-12 px-4 lg:px-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 bg-[var(--color-background)] p-6 rounded-2xl border border-[var(--color-beige)]/50 shadow-sm">
        <div>
          <h1 className="text-4xl font-bold text-primary tracking-tight">
            Reportes y Finanzas
          </h1>
          <p className="text-[var(--color-foreground)]/60 mt-1 text-lg">
            Control fiscal y operativo de tu negocio.
          </p>
        </div>
        
        <div className="flex flex-wrap gap-3 items-center w-full lg:w-auto">
          {activeTab === "fiscal" && (
            <div className="flex gap-2">
              <select 
                value={fiscalYear}
                onChange={(e) => setFiscalYear(e.target.value)}
                className="bg-[var(--color-light)] border-none rounded-xl px-4 py-2.5 font-bold text-sm focus:ring-2 focus:ring-primary/20"
              >
                {[0, 1, 2].map(i => (
                  <option key={i} value={new Date().getFullYear() - i}>{new Date().getFullYear() - i}</option>
                ))}
              </select>
              <select 
                value={fiscalPeriod}
                onChange={(e) => setFiscalPeriod(e.target.value)}
                className="bg-[var(--color-light)] border-none rounded-xl px-4 py-2.5 font-bold text-sm focus:ring-2 focus:ring-primary/20"
              >
                <option value="year">Año Completo</option>
                <option value="1T">1º Trimestre</option>
                <option value="2T">2º Trimestre</option>
                <option value="3T">3º Trimestre</option>
                <option value="4T">4º Trimestre</option>
              </select>
            </div>
          )}

          <Button variant="outline" onClick={() => setShowCalculator(true)} className="bg-[var(--color-background)]">
            <Calculator size={18} className="mr-2" />
            Calculadora
          </Button>

          <Button variant="primary" onClick={() => handleExport("pdf")} className="shadow-lg shadow-primary/20">
            <Download size={18} className="mr-2" />
            Exportar Informe
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[var(--color-beige)] space-x-8">
        <button
          onClick={() => setActiveTab("operational")}
          className={`pb-4 px-2 font-bold text-sm transition-all relative ${
            activeTab === "operational"
              ? "text-primary"
              : "text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]"
          }`}
        >
          <div className="flex items-center gap-2">
            <LayoutDashboard size={18} />
            Visión Operativa
          </div>
          {activeTab === "operational" && (
            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-t-full" />
          )}
        </button>
        <button
          onClick={() => setActiveTab("fiscal")}
          className={`pb-4 px-2 font-bold text-sm transition-all relative ${
            activeTab === "fiscal"
              ? "text-primary"
              : "text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]"
          }`}
        >
          <div className="flex items-center gap-2">
            <FileText size={18} />
            Visión Fiscal
          </div>
          {activeTab === "fiscal" && (
            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-t-full" />
          )}
        </button>
      </div>

      {/* Content */}
      <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
        {activeTab === "operational" ? (
          <div className="grid grid-cols-12 gap-8">
            {/* Projected Earnings Widget */}
            <div className="col-span-12 md:col-span-4 h-[350px]">
              <ProjectedEarningsWidget className="h-full" />
            </div>
            
            {/* Fiscal Widget (Mini) */}
            <div className="col-span-12 md:col-span-8 h-[350px]">
               <FiscalWidget className="h-full" />
            </div>

            {/* TODO: Add more operational widgets like Occupancy here if needed */}
          </div>
        ) : (
          <div className="space-y-8">
             {/* Fiscal Detailed View */}
             <div className="grid grid-cols-12 gap-8">
               <Card className="col-span-12 lg:col-span-8 p-8 border-none shadow-sm bg-[var(--color-background)]">
                 <div className="flex justify-between items-center mb-8">
                   <h3 className="text-xl font-bold text-[var(--color-foreground)]">
                     Evolución de Ingresos ({fiscalPeriod === 'year' ? fiscalYear : `${fiscalPeriod} ${fiscalYear}`})
                   </h3>
                 </div>
                 
                 {loading ? (
                   <div className="h-[300px] flex items-center justify-center">
                     <Loader2 className="animate-spin text-primary w-8 h-8" />
                   </div>
                 ) : (
                   <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={fiscalData?.breakdown || []} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                        <XAxis 
                          dataKey="label" 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{ fill: '#9CA3AF', fontSize: 12 }} 
                          dy={10}
                        />
                        <YAxis 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{ fill: '#9CA3AF', fontSize: 12 }}
                          tickFormatter={(value) => `€${value/1000}k`}
                        />
                        <Tooltip
                          cursor={{ fill: '#F9FAFB' }}
                          contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                          formatter={(value: number) => [`€${value.toLocaleString()}`, "Ingresos"]}
                        />
                        <Bar dataKey="amount" fill="#2c5f2d" radius={[6, 6, 0, 0]} barSize={48} />
                      </BarChart>
                    </ResponsiveContainer>
                   </div>
                 )}
               </Card>
               
               <Card className="col-span-12 lg:col-span-4 p-8 border-none shadow-sm bg-[var(--color-background)]">
                  <h3 className="text-xl font-bold text-[var(--color-foreground)] mb-6">Resumen del Periodo</h3>
                  <div className="space-y-6">
                    <div>
                      <p className="text-sm text-[var(--color-muted-foreground)] mb-1">Total Facturado</p>
                      <p className="text-3xl font-bold text-[var(--color-foreground)]">
                        €{fiscalData?.total_revenue?.toLocaleString() || "0"}
                      </p>
                    </div>
                    <div className="h-px bg-[var(--color-beige)]"></div>
                    <div>
                       <p className="text-sm text-[var(--color-muted-foreground)] mb-1">IVA (Est. 21%)</p>
                      <p className="text-xl font-bold text-[var(--color-muted-foreground)]">
                        €{((fiscalData?.total_revenue || 0) * 0.21).toLocaleString()}
                      </p>
                    </div>
                    <div>
                       <p className="text-sm text-[var(--color-muted-foreground)] mb-1">Base Imponible</p>
                      <p className="text-xl font-bold text-primary">
                        €{((fiscalData?.total_revenue || 0) * 0.79).toLocaleString()}
                      </p>
                    </div>
                  </div>
               </Card>
             </div>
          </div>
        )}
      </div>

      <CalculatorModal isOpen={showCalculator} onClose={() => setShowCalculator(false)} />
    </div>
  );
}

