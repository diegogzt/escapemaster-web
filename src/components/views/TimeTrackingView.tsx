"use client";

import React, { useState, useEffect } from "react";
import { toast } from "sonner";
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
  ClipboardList,
  Plus,
  CheckCircle2,
  XCircle,
  AlertCircle,
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
  const [elapsedMinutes, setElapsedMinutes] = useState(0);

  const { summary, entries, vacations: myVacations } = timeTrackingState;
  const activeEntry = entries.find((e: any) => !e.check_out_time);

  // Live timer for active session
  useEffect(() => {
    if (!activeEntry) {
      setElapsedMinutes(0);
      return;
    }
    const compute = () =>
      Math.floor(
        (Date.now() - new Date(activeEntry.check_in_time).getTime()) / 60000
      );
    setElapsedMinutes(compute());
    const interval = setInterval(() => setElapsedMinutes(compute()), 30000);
    return () => clearInterval(interval);
  }, [activeEntry?.check_in_time]);

  const fetchData = async () => {
    const isFresh =
      timeTrackingState.lastFetched &&
      Date.now() - timeTrackingState.lastFetched < 60000;
    if (isFresh && entries.length > 0) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const [summaryData, entriesData, vacationsData] = await Promise.all([
        timeclock.getSummary(),
        timeclock.getMe(),
        vacations.getMe(),
      ]);
      setTimeTrackingState({
        summary: summaryData && !summaryData.error ? summaryData : null,
        entries: Array.isArray(entriesData) ? entriesData : [],
        vacations: Array.isArray(vacationsData) ? vacationsData : [],
        lastFetched: Date.now(),
      });
      const active = entriesData.find((e: any) => !e.check_out_time);
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
      setTimeTrackingState({ lastFetched: 0 });
      await fetchData();
    } catch (err) {
      toast.error("Error al iniciar turno");
    } finally {
      setActionLoading(false);
    }
  };

  const handleCheckOut = async () => {
    try {
      setActionLoading(true);
      await timeclock.checkOut({ task_description: taskDescription });
      setTaskDescription("");
      setTimeTrackingState({ lastFetched: 0 });
      await fetchData();
    } catch (err) {
      toast.error("Error al finalizar turno");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRequestVacation = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
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
      setTimeTrackingState({ lastFetched: 0 });
      await fetchData();
    } catch (err) {
      toast.error("Error al solicitar vacaciones");
    } finally {
      setActionLoading(false);
    }
  };

  // Vacation days: prefer explicit remaining field, fall back to total - used
  const vacationDaysRemaining: number | null =
    summary?.vacation_days_remaining ??
    (summary
      ? (summary.vacation_days_total ?? 0) - (summary.vacation_days_used ?? 0)
      : null);

  // Hours progress
  const totalHours = summary?.total_hours ?? 0;
  const targetHours = summary?.target_hours ?? 0;
  const hoursProgress =
    targetHours > 0 ? Math.min((totalHours / targetHours) * 100, 100) : 0;

  const canViewEarnings =
    user?.role?.name === "admin" ||
    user?.role?.name === "manager" ||
    user?.permissions?.includes("view_reports");

  const formatElapsed = (minutes: number) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m`;
  };

  const getVacationStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle2 size={16} className="text-green-600" />;
      case "rejected":
        return <XCircle size={16} className="text-red-500" />;
      default:
        return <AlertCircle size={16} className="text-yellow-500" />;
    }
  };

  const getVacationStatusLabel = (status: string) => {
    switch (status) {
      case "approved":
        return "Aprobada";
      case "rejected":
        return "Rechazada";
      default:
        return "Pendiente";
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center p-24">
        <Loader2 className="animate-spin text-[var(--color-primary)]" size={48} />
      </div>
    );

  return (
    <div className="space-y-6 w-full pb-16">
      {/* ── Page Header ── */}
      <div
        className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 p-8 rounded-[2.5rem] border border-[var(--color-beige)] bg-[var(--color-background)]"
      >
        <div>
          <h1 className="text-4xl font-black tracking-tight text-[var(--color-foreground)]">
            Registro de Horas
          </h1>
          <p className="text-[var(--color-muted-foreground)] mt-1 text-base">
            Gestiona tu tiempo, tareas y vacaciones.
          </p>
        </div>
        <button
          onClick={activeEntry ? handleCheckOut : handleCheckIn}
          disabled={actionLoading}
          className={[
            "flex items-center gap-3 px-7 py-4 rounded-2xl font-black text-lg text-white tracking-tight transition-all",
            "disabled:opacity-60 disabled:cursor-not-allowed",
            activeEntry
              ? "bg-red-500 hover:bg-red-600 shadow-lg shadow-red-200"
              : "bg-[var(--color-primary)] hover:opacity-90 shadow-lg shadow-green-200",
          ].join(" ")}
        >
          {actionLoading ? (
            <Loader2 size={22} className="animate-spin" />
          ) : activeEntry ? (
            <Square size={22} />
          ) : (
            <Play size={22} />
          )}
          {activeEntry ? "Finalizar Turno" : "Iniciar Turno"}
        </button>
      </div>

      {/* ── Active Session Banner ── */}
      {activeEntry && (
        <div className="flex items-center gap-4 px-6 py-4 bg-green-50 border border-green-200 rounded-2xl">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-600" />
          </span>
          <div className="flex-1">
            <span className="font-black text-green-800 tracking-tight">
              Turno activo
            </span>
            {activeEntry.task_description && (
              <span className="text-green-700 ml-2 text-sm">
                — {activeEntry.task_description}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 text-green-700 font-bold">
            <Clock size={16} />
            <span>{formatElapsed(elapsedMinutes)}</span>
          </div>
        </div>
      )}

      {/* ── Stats Grid ── */}
      <div
        className={[
          "grid gap-5",
          canViewEarnings ? "grid-cols-1 md:grid-cols-3" : "grid-cols-1 md:grid-cols-2",
        ].join(" ")}
      >
        {/* Hours card */}
        <div className="rounded-2xl border border-[var(--color-beige)] bg-[var(--color-background)] p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[var(--color-light)]">
              <Clock size={20} className="text-[var(--color-primary)]" />
            </div>
            <span className="text-sm font-semibold text-[var(--color-muted-foreground)]">
              Horas del mes
            </span>
          </div>
          <p className="font-bold text-3xl text-[var(--color-foreground)] tracking-tight">
            {totalHours}h{" "}
            <span className="text-lg font-semibold text-[var(--color-muted-foreground)]">
              / {targetHours}h
            </span>
          </p>
          <div className="space-y-1">
            <div className="h-2 rounded-full bg-[var(--color-light)]">
              <div
                className="h-2 rounded-full bg-[var(--color-primary)] transition-all duration-500"
                style={{ width: `${hoursProgress}%` }}
              />
            </div>
            <p className="text-xs text-[var(--color-muted-foreground)]">
              {hoursProgress.toFixed(0)}% completado
            </p>
          </div>
        </div>

        {/* Earnings card — admin/manager only */}
        {canViewEarnings && (
          <div className="rounded-2xl border border-[var(--color-beige)] bg-[var(--color-background)] p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-[var(--color-light)]">
                <DollarSign size={20} className="text-[var(--color-primary)]" />
              </div>
              <span className="text-sm font-semibold text-[var(--color-muted-foreground)]">
                Ingresos estimados
              </span>
            </div>
            <p className="font-bold text-3xl text-[var(--color-foreground)] tracking-tight">
              {summary?.estimated_earnings != null
                ? `${summary.estimated_earnings}€`
                : "—"}
            </p>
            <p className="text-xs text-[var(--color-muted-foreground)]">Este mes</p>
          </div>
        )}

        {/* Vacation days card */}
        <div className="rounded-2xl border border-[var(--color-beige)] bg-[var(--color-background)] p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[var(--color-light)]">
              <Umbrella size={20} className="text-[var(--color-primary)]" />
            </div>
            <span className="text-sm font-semibold text-[var(--color-muted-foreground)]">
              Vacaciones restantes
            </span>
          </div>
          <p className="font-bold text-3xl text-[var(--color-foreground)] tracking-tight">
            {vacationDaysRemaining !== null
              ? `${vacationDaysRemaining} días`
              : "—"}
          </p>
          {summary?.vacation_days_total != null && (
            <p className="text-xs text-[var(--color-muted-foreground)]">
              De {summary.vacation_days_total} días totales
            </p>
          )}
        </div>
      </div>

      {/* ── Task Input ── */}
      <div className="rounded-3xl border border-[var(--color-beige)] bg-[var(--color-background)] p-6 space-y-4">
        <h2 className="font-black tracking-tight text-xl text-[var(--color-foreground)] flex items-center gap-2">
          <ClipboardList size={22} className="text-[var(--color-primary)]" />
          ¿En qué estás trabajando?
        </h2>
        <textarea
          className="w-full p-4 border border-[var(--color-beige)] rounded-2xl min-h-[110px] bg-[var(--color-background)] text-[var(--color-foreground)] placeholder:text-[var(--color-muted-foreground)] resize-none focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30 transition-all text-sm"
          placeholder="Describe tu tarea actual..."
          value={taskDescription}
          onChange={(e) => setTaskDescription(e.target.value)}
        />
      </div>

      {/* ── History Table ── */}
      <div className="rounded-3xl border border-[var(--color-beige)] bg-[var(--color-background)] overflow-hidden">
        <div className="px-6 py-5 border-b border-[var(--color-beige)]">
          <h2 className="font-black tracking-tight text-xl text-[var(--color-foreground)] flex items-center gap-2">
            <History size={22} className="text-[var(--color-primary)]" />
            Historial
          </h2>
        </div>
        {entries.filter((e: any) => e.check_out_time).length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-[var(--color-muted-foreground)] gap-3">
            <Clock size={40} className="opacity-30" />
            <p className="font-semibold">Sin registros completados</p>
            <p className="text-sm opacity-70">
              Inicia un turno para comenzar a registrar tu tiempo.
            </p>
          </div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-[var(--color-light)]/50 text-[var(--color-muted-foreground)]">
                <th className="px-6 py-3 font-semibold">Fecha</th>
                <th className="px-6 py-3 font-semibold">Entrada</th>
                <th className="px-6 py-3 font-semibold">Salida</th>
                <th className="px-6 py-3 font-semibold">Duración</th>
                <th className="px-6 py-3 font-semibold hidden md:table-cell">Tarea</th>
              </tr>
            </thead>
            <tbody>
              {entries
                .filter((e: any) => e.check_out_time)
                .map((e: any, i: number) => (
                  <tr
                    key={e.id}
                    className={[
                      "border-t border-[var(--color-beige)] transition-colors hover:bg-[var(--color-light)]/30",
                    ].join(" ")}
                  >
                    <td className="px-6 py-4 font-semibold text-[var(--color-foreground)]">
                      {format(new Date(e.check_in_time), "dd MMM", { locale: es })}
                    </td>
                    <td className="px-6 py-4 text-[var(--color-muted-foreground)]">
                      {format(new Date(e.check_in_time), "HH:mm")}
                    </td>
                    <td className="px-6 py-4 text-[var(--color-muted-foreground)]">
                      {format(new Date(e.check_out_time), "HH:mm")}
                    </td>
                    <td className="px-6 py-4 font-bold text-[var(--color-foreground)]">
                      {Math.floor(e.duration_minutes / 60)}h{" "}
                      {e.duration_minutes % 60}m
                    </td>
                    <td className="px-6 py-4 text-[var(--color-muted-foreground)] hidden md:table-cell max-w-xs truncate">
                      {e.task_description || (
                        <span className="italic opacity-50">Sin descripción</span>
                      )}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ── Vacation Section ── */}
      <div className="rounded-3xl border border-[var(--color-beige)] bg-[var(--color-background)] overflow-hidden">
        <div className="px-6 py-5 border-b border-[var(--color-beige)] flex items-center justify-between">
          <h2 className="font-black tracking-tight text-xl text-[var(--color-foreground)] flex items-center gap-2">
            <Umbrella size={22} className="text-[var(--color-primary)]" />
            Vacaciones
          </h2>
          <button
            onClick={() => setShowVacationForm((v) => !v)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--color-primary)] text-white text-sm font-bold hover:opacity-90 transition-all"
          >
            <Plus size={16} />
            Solicitar
          </button>
        </div>

        {/* Vacation request form */}
        {showVacationForm && (
          <form
            onSubmit={handleRequestVacation}
            className="px-6 py-5 border-b border-[var(--color-beige)] bg-[var(--color-light)]/30 space-y-4"
          >
            <h3 className="font-black text-base tracking-tight text-[var(--color-foreground)]">
              Nueva solicitud de vacaciones
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[var(--color-muted-foreground)]">
                  Fecha inicio
                </label>
                <input
                  type="date"
                  name="start_date"
                  required
                  className="w-full px-4 py-2.5 border border-[var(--color-beige)] rounded-xl bg-[var(--color-background)] text-[var(--color-foreground)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[var(--color-muted-foreground)]">
                  Fecha fin
                </label>
                <input
                  type="date"
                  name="end_date"
                  required
                  className="w-full px-4 py-2.5 border border-[var(--color-beige)] rounded-xl bg-[var(--color-background)] text-[var(--color-foreground)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30"
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[var(--color-muted-foreground)]">
                Notas (opcional)
              </label>
              <textarea
                name="user_notes"
                rows={2}
                className="w-full px-4 py-2.5 border border-[var(--color-beige)] rounded-xl bg-[var(--color-background)] text-[var(--color-foreground)] text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30"
                placeholder="Añade un comentario..."
              />
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={actionLoading}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--color-primary)] text-white text-sm font-bold hover:opacity-90 transition-all disabled:opacity-60"
              >
                {actionLoading && <Loader2 size={14} className="animate-spin" />}
                Enviar solicitud
              </button>
              <button
                type="button"
                onClick={() => setShowVacationForm(false)}
                className="px-5 py-2.5 rounded-xl border border-[var(--color-beige)] text-[var(--color-muted-foreground)] text-sm font-semibold hover:bg-[var(--color-light)] transition-all"
              >
                Cancelar
              </button>
            </div>
          </form>
        )}

        {/* Vacation list */}
        {!myVacations || myVacations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-[var(--color-muted-foreground)] gap-3">
            <Calendar size={36} className="opacity-30" />
            <p className="font-semibold">Sin solicitudes de vacaciones</p>
          </div>
        ) : (
          <ul className="divide-y divide-[var(--color-beige)]">
            {myVacations.map((v: any) => (
              <li
                key={v.id}
                className="flex items-center justify-between px-6 py-4 hover:bg-[var(--color-light)]/30 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-[var(--color-light)]">
                    <Calendar size={16} className="text-[var(--color-primary)]" />
                  </div>
                  <div>
                    <p className="font-bold text-sm text-[var(--color-foreground)]">
                      {format(new Date(v.start_date), "dd MMM yyyy", { locale: es })}
                      {" — "}
                      {format(new Date(v.end_date), "dd MMM yyyy", { locale: es })}
                    </p>
                    {v.user_notes && (
                      <p className="text-xs text-[var(--color-muted-foreground)] mt-0.5">
                        {v.user_notes}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getVacationStatusIcon(v.status)}
                  <span
                    className={[
                      "text-xs font-bold px-3 py-1 rounded-full",
                      v.status === "approved"
                        ? "bg-green-100 text-green-700"
                        : v.status === "rejected"
                        ? "bg-red-100 text-red-600"
                        : "bg-yellow-100 text-yellow-700",
                    ].join(" ")}
                  >
                    {getVacationStatusLabel(v.status)}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
