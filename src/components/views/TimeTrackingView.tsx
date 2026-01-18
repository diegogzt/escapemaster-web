"use client";

import React, { useState, useEffect } from "react";
import { Card } from "@/components/Card";
import Button from "@/components/Button";
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
  Loader2,
  ClipboardList
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useDataStore } from "@/stores/data-store";
import { useAuth } from "@/context/AuthContext";

export function TimeTrackingView() {
  const { user } = useAuth();
  const { timeTrackingState, setTimeTrackingState } = useDataStore();
  const [loading, setLoading] = useState(!timeTrackingState.lastFetched);
  const [actionLoading, setActionLoading] = useState(false);
  const [taskDescription, setTaskDescription] = useState("");
  const [showVacationForm, setShowVacationForm] = useState(false);

  const { summary, entries, vacations: myVacations } = timeTrackingState;
  const activeEntry = entries.find((e: any) => !e.check_out_time);

  const fetchData = async () => {
    // Basic cache check (1 minute)
    const isFresh = timeTrackingState.lastFetched && (Date.now() - timeTrackingState.lastFetched < 60000);
    if (isFresh && entries.length > 0) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const [summaryData, entriesData, vacationsData] = await Promise.all([
        timeclock.getSummary(),
        timeclock.getMe(),
        vacations.getMe()
      ]);
      
      setTimeTrackingState({
        summary: summaryData,
        entries: entriesData,
        vacations: vacationsData,
        lastFetched: Date.now()
      });

      const active = entriesData.find((e: any) => !e.check_out_time);
      if (active) setTaskDescription(active.task_description || "");
    } catch (err) {
      console.error("Error fetching time tracking data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleCheckIn = async () => {
    try {
      setActionLoading(true);
      await timeclock.checkIn({ task_description: taskDescription });
      setTimeTrackingState({ lastFetched: 0 }); // Invalidate cache
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
      setTimeTrackingState({ lastFetched: 0 }); // Invalidate cache
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
      setTimeTrackingState({ lastFetched: 0 }); // Invalidate cache
      await fetchData();
    } catch (err) {
      alert("Error al solicitar vacaciones");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin" size={48} /></div>;

  return (
    <div className="space-y-8 w-full pb-12">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 bg-[var(--color-background)] p-6 rounded-2xl border border-beige/50 shadow-sm">
        <div>
          <h1 className="text-4xl font-bold text-primary tracking-tight">Registro de Horas</h1>
          <p className="text-[var(--color-foreground)]/60 mt-1 text-lg">Gestiona tu tiempo, tareas y vacaciones.</p>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="primary" className={activeEntry ? "bg-red-500" : ""} onClick={activeEntry ? handleCheckOut : handleCheckIn} loading={actionLoading}>
            {activeEntry ? <Square size={20} className="mr-2" /> : <Play size={20} className="mr-2" />}
            {activeEntry ? "Finalizar Turno" : "Iniciar Turno"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-8">
        <div className="col-span-12 lg:col-span-12 space-y-8">
          <Card className="p-8">
            <h3 className="text-xl font-bold mb-6 flex items-center"><ClipboardList size={24} className="mr-2" />¿En qué estás trabajando?</h3>
            <textarea className="w-full p-4 border rounded-2xl min-h-[120px]" placeholder="Describe tu tarea..." value={taskDescription} onChange={(e) => setTaskDescription(e.target.value)} />
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6"><p className="text-sm font-medium opacity-60">Horas Realizadas</p><h3 className="text-3xl font-bold">{summary?.total_hours}h / {summary?.target_hours}h</h3></Card>
            {(user?.role?.name === 'admin' || user?.role?.name === 'manager' || user?.permissions?.includes('view_reports')) && (
              <Card className="p-6"><p className="text-sm font-medium opacity-60">Generado este mes</p><h3 className="text-3xl font-bold">{summary?.estimated_earnings}€</h3></Card>
            )}
            <Card className="p-6"><p className="text-sm font-medium opacity-60">Vacaciones Restantes</p><h3 className="text-3xl font-bold">12 días</h3></Card>
          </div>

          <Card className="overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-[var(--color-light)]/30">
                <tr><th className="p-4">Fecha</th><th className="p-4">Entrada</th><th className="p-4">Salida</th><th className="p-4">Duración</th></tr>
              </thead>
              <tbody>
                {entries.filter(e => e.check_out_time).map(e => (
                  <tr key={e.id} className="border-t">
                    <td className="p-4">{format(new Date(e.check_in_time), "dd MMM")}</td>
                    <td className="p-4">{format(new Date(e.check_in_time), "HH:mm")}</td>
                    <td className="p-4">{format(new Date(e.check_out_time), "HH:mm")}</td>
                    <td className="p-4">{Math.floor(e.duration_minutes / 60)}h {e.duration_minutes % 60}m</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </div>
      </div>
    </div>
  );
}
