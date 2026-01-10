"use client";

import React, { useState, useEffect } from "react";
import { Card } from "@/components/Card";
import Button from "@/components/Button";
import Input from "@/components/Input";
import { timeclock, vacations } from "@/services/api";
import { 
  Clock, 
  Play, 
  Square, 
  Calendar, 
  TrendingUp, 
  DollarSign, 
  History, 
  Umbrella,
  Plus,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  ClipboardList
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export default function TimeTrackingPage() {
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [summary, setSummary] = useState<any>(null);
  const [entries, setEntries] = useState<any[]>([]);
  const [myVacations, setMyVacations] = useState<any[]>([]);
  const [activeEntry, setActiveEntry] = useState<any>(null);
  const [taskDescription, setTaskDescription] = useState("");
  const [showVacationForm, setShowVacationForm] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [summaryData, entriesData, vacationsData] = await Promise.all([
        timeclock.getSummary(),
        timeclock.getMe(),
        vacations.getMe()
      ]);
      setSummary(summaryData);
      setEntries(entriesData);
      setMyVacations(vacationsData);
      
      // Find active entry
      const active = entriesData.find((e: any) => !e.check_out_time);
      setActiveEntry(active);
      if (active) setTaskDescription(active.task_description || "");
    } catch (err) {
      console.error("Error fetching time tracking data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCheckIn = async () => {
    try {
      setActionLoading(true);
      await timeclock.checkIn({ task_description: taskDescription });
      await fetchData();
    } catch (err) {
      alert("Error al iniciar turno");
    } finally {
      setActionLoading(false);
    }
  };

  const handleCheckOut = async () => {
    try {
      setActionLoading(true);
      await timeclock.checkOut({ task_description: taskDescription });
      setTaskDescription("");
      await fetchData();
    } catch (err) {
      alert("Error al finalizar turno");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRequestVacation = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    try {
      setActionLoading(true);
      await vacations.request({
        start_date: formData.get("start_date") as string,
        end_date: formData.get("end_date") as string,
        user_notes: formData.get("user_notes") as string,
      });
      setShowVacationForm(false);
      await fetchData();
    } catch (err) {
      alert("Error al solicitar vacaciones");
    } finally {
      setActionLoading(false);
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
            Registro de Horas
          </h1>
          <p className="text-[var(--color-foreground)]/60 mt-1 text-lg">
            Gestiona tu tiempo, tareas y vacaciones.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right hidden md:block">
            <p className="text-sm text-[var(--color-muted-foreground)] font-medium">Estado Actual</p>
            <p className={`text-lg font-bold ${activeEntry ? "text-green-600" : "text-[var(--color-muted-foreground)]"}`}>
              {activeEntry ? "En turno" : "Fuera de turno"}
            </p>
          </div>
          {activeEntry ? (
            <Button 
              variant="primary" 
              className="bg-red-500 hover:bg-red-600 text-white px-8 py-4 rounded-2xl shadow-lg shadow-red-200"
              onClick={handleCheckOut}
              loading={actionLoading}
            >
              <Square size={20} className="mr-2 fill-current" />
              Finalizar Turno
            </Button>
          ) : (
            <Button 
              variant="primary" 
              className="px-8 py-4 rounded-2xl shadow-lg shadow-primary/20"
              onClick={handleCheckIn}
              loading={actionLoading}
            >
              <Play size={20} className="mr-2 fill-current" />
              Iniciar Turno
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-12 gap-8">
        {/* Left Column: Active Task & Summary */}
        <div className="col-span-12 lg:col-span-8 space-y-8">
          {/* Active Task Input */}
          <Card className="p-8 border-none shadow-sm bg-[var(--color-background)]">
            <h3 className="text-xl font-bold text-[var(--color-foreground)] mb-6 flex items-center">
              <ClipboardList size={24} className="mr-2 text-primary" />
              ¿En qué estás trabajando?
            </h3>
            <textarea
              className="w-full p-4 border-2 border-beige/50 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/10 bg-[var(--color-light)]/20 transition-all min-h-[120px] text-lg"
              placeholder="Describe tu tarea actual..."
              value={taskDescription}
              onChange={(e) => setTaskDescription(e.target.value)}
            />
            {activeEntry && (
              <p className="mt-4 text-sm text-[var(--color-muted-foreground)]">
                Iniciado a las {format(new Date(activeEntry.check_in_time), "HH:mm", { locale: es })}
              </p>
            )}
          </Card>

          {/* KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6 border-none shadow-sm bg-[var(--color-background)] hover:shadow-md transition-all group">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-primary/10 rounded-2xl text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                  <Clock size={24} />
                </div>
                <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded-full">
                  {summary?.percentage_complete}%
                </span>
              </div>
              <p className="text-sm font-medium text-[var(--color-muted-foreground)] mb-1">Horas Realizadas</p>
              <h3 className="text-3xl font-bold text-[var(--color-foreground)]">{summary?.total_hours}h <span className="text-sm text-[var(--color-muted-foreground)] font-normal">/ {summary?.target_hours}h</span></h3>
            </Card>

            <Card className="p-6 border-none shadow-sm bg-[var(--color-background)] hover:shadow-md transition-all group">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-secondary/10 rounded-2xl text-secondary group-hover:bg-secondary group-hover:text-white transition-colors">
                  <DollarSign size={24} />
                </div>
              </div>
              <p className="text-sm font-medium text-[var(--color-muted-foreground)] mb-1">Generado este mes</p>
              <h3 className="text-3xl font-bold text-[var(--color-foreground)]">{summary?.estimated_earnings}€</h3>
            </Card>

            <Card className="p-6 border-none shadow-sm bg-[var(--color-background)] hover:shadow-md transition-all group">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-accent/10 rounded-2xl text-accent group-hover:bg-accent group-hover:text-white transition-colors">
                  <Umbrella size={24} />
                </div>
              </div>
              <p className="text-sm font-medium text-[var(--color-muted-foreground)] mb-1">Vacaciones Restantes</p>
              <h3 className="text-3xl font-bold text-[var(--color-foreground)]">12 <span className="text-sm text-[var(--color-muted-foreground)] font-normal">días</span></h3>
            </Card>
          </div>

          {/* History Table */}
          <Card className="border-none shadow-sm bg-[var(--color-background)] overflow-hidden">
            <div className="p-6 border-b border-gray-50 flex justify-between items-center">
              <h3 className="text-xl font-bold text-[var(--color-foreground)] flex items-center">
                <History size={24} className="mr-2 text-primary" />
                Historial Reciente
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-[var(--color-light)]/30 text-[var(--color-muted-foreground)] text-xs uppercase tracking-wider">
                    <th className="px-6 py-4 font-bold">Fecha</th>
                    <th className="px-6 py-4 font-bold">Entrada</th>
                    <th className="px-6 py-4 font-bold">Salida</th>
                    <th className="px-6 py-4 font-bold">Duración</th>
                    <th className="px-6 py-4 font-bold">Tarea</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {entries.filter(e => e.check_out_time).map((entry) => (
                    <tr key={entry.id} className="hover:bg-[var(--color-light)]/20 transition-colors">
                      <td className="px-6 py-4 text-sm font-bold text-[var(--color-foreground)]">
                        {format(new Date(entry.check_in_time), "dd MMM", { locale: es })}
                      </td>
                      <td className="px-6 py-4 text-sm text-[var(--color-muted-foreground)]">
                        {format(new Date(entry.check_in_time), "HH:mm")}
                      </td>
                      <td className="px-6 py-4 text-sm text-[var(--color-muted-foreground)]">
                        {format(new Date(entry.check_out_time), "HH:mm")}
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 bg-beige/30 text-primary text-xs font-bold rounded-lg">
                          {Math.floor(entry.duration_minutes / 60)}h {entry.duration_minutes % 60}m
                        </span>
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
        </div>

        {/* Right Column: Vacations */}
        <div className="col-span-12 lg:col-span-4 space-y-8">
          <Card className="p-8 border-none shadow-sm bg-[var(--color-background)]">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-[var(--color-foreground)] flex items-center">
                <Umbrella size={24} className="mr-2 text-primary" />
                Vacaciones
              </h3>
              <Button size="sm" variant="outline" onClick={() => setShowVacationForm(!showVacationForm)}>
                {showVacationForm ? "Cancelar" : "Solicitar"}
              </Button>
            </div>

            {showVacationForm && (
              <form onSubmit={handleRequestVacation} className="mb-8 p-4 bg-[var(--color-light)]/30 rounded-2xl border border-beige/50 space-y-4 animate-in fade-in slide-in-from-top-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[var(--color-muted-foreground)] uppercase">Inicio</label>
                    <input name="start_date" type="date" required className="w-full p-2 border border-beige rounded-lg text-sm" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[var(--color-muted-foreground)] uppercase">Fin</label>
                    <input name="end_date" type="date" required className="w-full p-2 border border-beige rounded-lg text-sm" />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[var(--color-muted-foreground)] uppercase">Notas</label>
                  <textarea name="user_notes" className="w-full p-2 border border-beige rounded-lg text-sm" placeholder="Opcional..." />
                </div>
                <Button type="submit" className="w-full" loading={actionLoading}>Enviar Solicitud</Button>
              </form>
            )}

            <div className="space-y-4">
              {myVacations.length === 0 ? (
                <p className="text-center py-8 text-[var(--color-muted-foreground)] text-sm italic">No has solicitado vacaciones aún.</p>
              ) : (
                myVacations.map((v) => (
                  <div key={v.id} className="p-4 border border-beige/50 rounded-2xl hover:bg-[var(--color-light)]/10 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center">
                        <Calendar size={16} className="text-primary mr-2" />
                        <span className="text-sm font-bold text-[var(--color-foreground)]">
                          {format(new Date(v.start_date), "dd/MM")} - {format(new Date(v.end_date), "dd/MM")}
                        </span>
                      </div>
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                        v.status === "approved" ? "bg-green-500/10 text-green-500" :
                        v.status === "rejected" ? "bg-red-100 text-red-700" :
                        "bg-yellow-100 text-yellow-700"
                      }`}>
                        {v.status === "approved" ? "Aprobado" : 
                         v.status === "rejected" ? "Rechazado" : "Pendiente"}
                      </span>
                    </div>
                    <p className="text-xs text-[var(--color-muted-foreground)]">{v.days_count} días solicitados</p>
                    {v.admin_notes && (
                      <div className="mt-2 p-2 bg-[var(--color-background)] rounded-lg border border-beige/30 text-[11px] text-[var(--color-muted-foreground)] italic">
                        <span className="font-bold not-italic">Admin:</span> {v.admin_notes}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </Card>

          {/* Tips / Info */}
          <Card className="p-6 bg-primary text-white border-none shadow-lg shadow-primary/20">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-[var(--color-background)]/20 rounded-xl">
                <TrendingUp size={24} />
              </div>
              <div>
                <h4 className="font-bold mb-1">Consejo de Productividad</h4>
                <p className="text-sm text-white/80 leading-relaxed">
                  Recuerda detallar tus tareas al finalizar el turno. Esto ayuda a los administradores a entender mejor el flujo de trabajo.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
