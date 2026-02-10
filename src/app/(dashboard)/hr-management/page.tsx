"use client";

import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { Card } from "@/components/Card";
import Button from "@/components/Button";
import { timeclock, vacations } from "@/services/api";
import { 
  Users, 
  Clock, 
  Calendar, 
  Check, 
  X, 
  Search, 
  Filter,
  Download,
  Loader2,
  Umbrella,
  AlertCircle,
  DollarSign
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export default function HRManagementPage() {
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [allEntries, setAllEntries] = useState<any[]>([]);
  const [pendingVacations, setPendingVacations] = useState<any[]>([]);
  const [stats, setStats] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"entries" | "vacations" | "stats">("entries");

  const fetchData = async () => {
    try {
      setLoading(true);
      const [entriesData, vacationsData] = await Promise.all([
        timeclock.getAll(),
        vacations.getAll()
      ]);
      setAllEntries(entriesData);
      setPendingVacations(vacationsData.filter((v: any) => v.status === "pending"));
      
      // Calculate stats per user
      const userStats: any = {};
      entriesData.forEach((entry: any) => {
        const userId = entry.user_id;
        if (!userStats[userId]) {
          userStats[userId] = {
            name: entry.user_name || `Usuario ${userId}`,
            total_hours: 0,
            entries_count: 0,
          };
        }
        if (entry.duration_minutes) {
          userStats[userId].total_hours += entry.duration_minutes / 60;
        }
        userStats[userId].entries_count += 1;
      });
      setStats(Object.values(userStats));
    } catch (err) {
      console.error("Error fetching HR data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleVacationAction = async (id: string, status: "approved" | "rejected") => {
    const notes = prompt(`Notas para el empleado (${status === "approved" ? "opcional" : "obligatorio"}):`);
    if (status === "rejected" && !notes) return;

    try {
      setActionLoading(`vacation-${id}`);
      await vacations.updateStatus(id, { status, admin_notes: notes || "" });
      await fetchData();
    } catch (err) {
      toast.error("Error al actualizar estado de vacaciones");
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin text-primary" size={48} />
      </div>
    );
  }

  return (
    <div className="space-y-8 w-full pb-12 px-4 lg:px-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 bg-[var(--color-background)] p-6 rounded-2xl border border-beige/50 shadow-sm">
        <div>
          <h1 className="text-4xl font-bold text-primary tracking-tight">
            Gestión de RRHH
          </h1>
          <p className="text-[var(--color-foreground)]/60 mt-1 text-lg">
            Control de horarios, vacaciones y nóminas de Game Masters.
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="rounded-xl">
            <Download size={18} className="mr-2" />
            Exportar CSV
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-beige/30 pb-px">
        <button
          onClick={() => setActiveTab("entries")}
          className={`pb-4 px-2 text-sm font-bold transition-all relative ${
            activeTab === "entries" ? "text-primary" : "text-[var(--color-muted-foreground)] hover:text-[var(--color-muted-foreground)]"
          }`}
        >
          Registros de Tiempo
          {activeTab === "entries" && <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-t-full" />}
        </button>
        <button
          onClick={() => setActiveTab("vacations")}
          className={`pb-4 px-2 text-sm font-bold transition-all relative ${
            activeTab === "vacations" ? "text-primary" : "text-[var(--color-muted-foreground)] hover:text-[var(--color-muted-foreground)]"
          }`}
        >
          Vacaciones Pendientes
          {pendingVacations.length > 0 && (
            <span className="ml-2 bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">
              {pendingVacations.length}
            </span>
          )}
          {activeTab === "vacations" && <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-t-full" />}
        </button>
        <button
          onClick={() => setActiveTab("stats")}
          className={`pb-4 px-2 text-sm font-bold transition-all relative ${
            activeTab === "stats" ? "text-primary" : "text-[var(--color-muted-foreground)] hover:text-[var(--color-muted-foreground)]"
          }`}
        >
          Resumen Mensual
          {activeTab === "stats" && <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-t-full" />}
        </button>
      </div>

      {/* Content */}
      {activeTab === "entries" && (
        <Card className="border-none shadow-sm bg-[var(--color-background)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-[var(--color-light)]/30 text-[var(--color-muted-foreground)] text-xs uppercase tracking-wider">
                  <th className="px-6 py-4 font-bold">Empleado</th>
                  <th className="px-6 py-4 font-bold">Fecha</th>
                  <th className="px-6 py-4 font-bold">Entrada</th>
                  <th className="px-6 py-4 font-bold">Salida</th>
                  <th className="px-6 py-4 font-bold">Duración</th>
                  <th className="px-6 py-4 font-bold">Tarea</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {allEntries.map((entry) => (
                  <tr key={entry.id} className="hover:bg-[var(--color-light)]/20 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                          {entry.user_name?.charAt(0) || "U"}
                        </div>
                        <span className="text-sm font-bold text-[var(--color-foreground)]">{entry.user_name || "Usuario"}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-[var(--color-muted-foreground)]">
                      {format(new Date(entry.check_in_time), "dd/MM/yyyy")}
                    </td>
                    <td className="px-6 py-4 text-sm text-[var(--color-muted-foreground)]">
                      {format(new Date(entry.check_in_time), "HH:mm")}
                    </td>
                    <td className="px-6 py-4 text-sm text-[var(--color-muted-foreground)]">
                      {entry.check_out_time ? format(new Date(entry.check_out_time), "HH:mm") : "-"}
                    </td>
                    <td className="px-6 py-4">
                      {entry.duration_minutes ? (
                        <span className="px-2 py-1 bg-beige/30 text-primary text-xs font-bold rounded-lg">
                          {Math.floor(entry.duration_minutes / 60)}h {entry.duration_minutes % 60}m
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-green-500/10 text-green-500 text-xs font-bold rounded-lg animate-pulse">
                          En curso
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-[var(--color-muted-foreground)] max-w-xs truncate">
                      {entry.task_description || "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {activeTab === "vacations" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pendingVacations.length === 0 ? (
            <div className="col-span-full py-12 text-center bg-[var(--color-background)] rounded-2xl border border-dashed border-beige">
              <Umbrella size={48} className="mx-auto text-beige mb-4" />
              <p className="text-[var(--color-muted-foreground)] font-medium">No hay solicitudes de vacaciones pendientes.</p>
            </div>
          ) : (
            pendingVacations.map((v) => (
              <Card key={v.id} className="p-6 border-none shadow-sm bg-[var(--color-background)] flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                      {v.user_name?.charAt(0) || "U"}
                    </div>
                    <div>
                      <h4 className="font-bold text-[var(--color-foreground)]">{v.user_name || "Usuario"}</h4>
                      <p className="text-xs text-[var(--color-muted-foreground)]">Solicitado el {format(new Date(v.created_at), "dd MMM")}</p>
                    </div>
                  </div>
                  <div className="bg-[var(--color-light)]/30 p-4 rounded-xl mb-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-[var(--color-muted-foreground)]">Periodo:</span>
                      <span className="font-bold text-[var(--color-foreground)]">
                        {format(new Date(v.start_date), "dd/MM")} - {format(new Date(v.end_date), "dd/MM")}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-[var(--color-muted-foreground)]">Días totales:</span>
                      <span className="font-bold text-primary">{v.days_count} días</span>
                    </div>
                  </div>
                  {v.user_notes && (
                    <div className="mb-6">
                      <p className="text-xs font-bold text-[var(--color-muted-foreground)] uppercase mb-1">Notas del empleado:</p>
                      <p className="text-sm text-[var(--color-muted-foreground)] italic">"{v.user_notes}"</p>
                    </div>
                  )}
                </div>
                <div className="flex gap-3">
                  <Button 
                    variant="outline" 
                    className="flex-1 border-red-200 text-red-600 hover:bg-red-50"
                    onClick={() => handleVacationAction(v.id, "rejected")}
                    loading={actionLoading === `vacation-${v.id}`}
                  >
                    <X size={18} className="mr-2" />
                    Rechazar
                  </Button>
                  <Button 
                    className="flex-1"
                    onClick={() => handleVacationAction(v.id, "approved")}
                    loading={actionLoading === `vacation-${v.id}`}
                  >
                    <Check size={18} className="mr-2" />
                    Aprobar
                  </Button>
                </div>
              </Card>
            ))
          )}
        </div>
      )}

      {activeTab === "stats" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stats.map((user, idx) => (
            <Card key={idx} className="p-6 border-none shadow-sm bg-[var(--color-background)]">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-bold text-xl">
                  {user.name.charAt(0)}
                </div>
                <div>
                  <h4 className="font-bold text-lg text-[var(--color-foreground)]">{user.name}</h4>
                  <p className="text-sm text-[var(--color-muted-foreground)]">{user.entries_count} turnos este mes</p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-[var(--color-muted-foreground)] font-medium">Horas Totales</span>
                    <span className="font-bold text-[var(--color-foreground)]">{user.total_hours.toFixed(1)}h</span>
                  </div>
                  <div className="w-full h-2 bg-[var(--color-light)] rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary rounded-full" 
                      style={{ width: `${Math.min((user.total_hours / 160) * 100, 100)}%` }}
                    />
                  </div>
                </div>
                <div className="pt-4 border-t border-beige/30 flex justify-between items-center">
                  <div className="flex items-center text-secondary">
                    <DollarSign size={18} className="mr-1" />
                    <span className="text-sm font-bold">Estimado:</span>
                  </div>
                  <span className="text-xl font-bold text-[var(--color-foreground)]">
                    {(user.total_hours * 12).toFixed(2)}€
                  </span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
