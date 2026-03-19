"use client";

import React, { useState, useEffect } from "react";
import { Card } from "@/components/Card";
import Button from "@/components/Button";
import { gamemaster, rooms as roomsApi } from "@/services/api";
import { toast } from "sonner";
import {
  Gamepad2,
  Clock,
  Users,
  CheckCircle,
  AlertCircle,
  Play,
  Timer,
  Trophy,
  XCircle,
  ChevronRight,
  ArrowLeft,
  Clipboard,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SessionItem {
  id: string;
  time: string;
  room_name: string;
  room_id: string;
  customer_name: string;
  players: number;
  status: string;
  checked_in: boolean;
  has_extras: boolean;
}

interface BookingDetail {
  id: string;
  room: { id: string; name: string; duration_minutes: number };
  customer: { name: string; email: string; phone: string };
  scheduled_time: string;
  players_count: number;
  status: string;
  checked_in_at: string | null;
  extras: { type: string; price: number; details: any }[];
  total_price: number;
  notes: string | null;
}

interface ChecklistItem {
  id: string;
  order: number;
  title: string;
  is_required: boolean;
}

type View = "schedule" | "detail";

export function GameMasterView() {
  const [sessions, setSessions] = useState<SessionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterRoom, setFilterRoom] = useState("");
  const [filterStatus, setFilterStatus] = useState<string[]>([]);
  const [filterSearch, setFilterSearch] = useState("");
  const [filterDate, setFilterDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [allRooms, setAllRooms] = useState<any[]>([]);
  const [view, setView] = useState<View>("schedule");
  const [selectedBooking, setSelectedBooking] = useState<BookingDetail | null>(null);
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [completedItems, setCompletedItems] = useState<Set<string>>(new Set());
  const [showResultModal, setShowResultModal] = useState(false);
  const [resultForm, setResultForm] = useState({ escaped: true, escape_time_minutes: 0, escape_time_seconds: 0, hints_used: 0, notes: "" });
  const [actionLoading, setActionLoading] = useState(false);
  const [todayDate, setTodayDate] = useState("");

  useEffect(() => {
    fetchSchedule();
    fetchRooms();
    setTodayDate(new Date().toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long", year: "numeric" }));
  }, []);

  const fetchRooms = async () => {
    try {
      const data = await roomsApi.list();
      setAllRooms(Array.isArray(data?.rooms) ? data.rooms : Array.isArray(data) ? data : []);
    } catch { /* ignore */ }
  };

  const fetchSchedule = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (filterRoom) params.room_id = filterRoom;
      if (filterStatus.length > 0) params.status = filterStatus;
      if (filterSearch) params.search = filterSearch;
      if (filterDate) {
        params.date_from = `${filterDate}T00:00:00Z`;
        params.date_to = `${filterDate}T23:59:59Z`;
      }
      const data = await gamemaster.getToday(params);
      setSessions(Array.isArray(data?.bookings) ? data.bookings : []);
    } catch (err: any) {
      if (err?.response?.status !== 404) {
        console.error("Failed to load schedule:", err);
        toast.error("Error al cargar las sesiones");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchSchedule();
    }, 300);
    return () => clearTimeout(timer);
  }, [filterRoom, filterStatus, filterSearch, filterDate]);

  const openDetail = async (bookingId: string) => {
    try {
      const data = await gamemaster.getBooking(bookingId);
      setSelectedBooking(data);
      if (data.room?.id) {
        try {
          const cl = await gamemaster.getChecklist(data.room.id);
          setChecklist(Array.isArray(cl?.checklist) ? cl.checklist : []);
        } catch { setChecklist([]); }
      }
      setCompletedItems(new Set());
      setView("detail");
    } catch {
      toast.error("Error al cargar el detalle");
    }
  };

  const handleCheckIn = async (bookingId: string) => {
    setActionLoading(true);
    try {
      await gamemaster.checkIn(bookingId);
      toast.success("Check-in realizado correctamente");
      fetchSchedule();
      if (selectedBooking?.id === bookingId) {
        const updated = await gamemaster.getBooking(bookingId);
        setSelectedBooking(updated);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Error en el check-in");
    } finally {
      setActionLoading(false);
    }
  };

  const handleCompleteItem = async (itemId: string) => {
    if (!selectedBooking) return;
    try {
      await gamemaster.completeChecklistItem(selectedBooking.id, itemId);
      setCompletedItems(prev => new Set(prev).add(itemId));
    } catch {
      toast.error("Error al completar el item");
    }
  };

  const handleRecordResult = async () => {
    if (!selectedBooking) return;
    setActionLoading(true);
    try {
      const totalSeconds = (resultForm.escape_time_minutes * 60) + resultForm.escape_time_seconds;
      const res = await gamemaster.recordResult(selectedBooking.id, {
        escaped: resultForm.escaped,
        escape_time_seconds: resultForm.escaped ? totalSeconds : undefined,
        hints_used: resultForm.hints_used,
        notes: resultForm.notes || undefined,
      });
      toast.success(`Sesión finalizada. ${res.xp_awarded ? `+${res.xp_awarded} XP otorgados` : ""}`);
      setShowResultModal(false);
      setView("schedule");
      fetchSchedule();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Error al registrar resultado");
    } finally {
      setActionLoading(false);
    }
  };

  const statusConfig: Record<string, { label: string; color: string; strip: string; icon: React.ComponentType<any> }> = {
    confirmed: { label: "Confirmada", color: "bg-blue-100 text-blue-700", strip: "bg-blue-400", icon: Clock },
    checked_in: { label: "En juego", color: "bg-emerald-100 text-emerald-700", strip: "bg-emerald-500", icon: Play },
    completed: { label: "Completada", color: "bg-gray-100 text-gray-500", strip: "bg-gray-300", icon: CheckCircle },
    pending: { label: "Pendiente", color: "bg-amber-100 text-amber-700", strip: "bg-amber-400", icon: AlertCircle },
  };

  // === DETAIL VIEW ===
  if (view === "detail" && selectedBooking) {
    const b = selectedBooking;
    const sc = statusConfig[b.status] || statusConfig.pending;

    return (
      <div className="p-6 max-w-3xl mx-auto space-y-5">
        {/* Back button */}
        <button
          onClick={() => setView("schedule")}
          className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] transition-colors"
        >
          <ArrowLeft size={16} />
          Volver al horario
        </button>

        {/* Room header */}
        <div className="rounded-[2.5rem] bg-[var(--color-background)] border border-[var(--color-beige)] p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-3xl font-black tracking-tight text-[var(--color-foreground)]">
                {b.room.name}
              </h1>
              <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--color-light)] text-sm font-medium text-[var(--color-muted-foreground)]">
                <Clock size={13} />
                {new Date(b.scheduled_time).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}
                <span className="text-[var(--color-beige)]">·</span>
                {b.room.duration_minutes} min
              </div>
            </div>
            <span className={cn("flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold", sc.color)}>
              <sc.icon size={12} />
              {sc.label}
            </span>
          </div>
        </div>

        {/* Customer card */}
        <div className="rounded-3xl border border-[var(--color-beige)] bg-[var(--color-background)] p-5">
          <h3 className="font-black tracking-tight text-base mb-4 flex items-center gap-2 text-[var(--color-foreground)]">
            <Users size={17} />
            Información del cliente
          </h3>
          <div className="grid grid-cols-2 gap-x-6 gap-y-4">
            <div>
              <p className="text-xs text-[var(--color-muted-foreground)] uppercase tracking-wide mb-0.5">Nombre</p>
              <p className="font-semibold text-sm">{b.customer.name || "N/A"}</p>
            </div>
            <div>
              <p className="text-xs text-[var(--color-muted-foreground)] uppercase tracking-wide mb-0.5">Jugadores</p>
              <p className="font-semibold text-sm">{b.players_count}</p>
            </div>
            <div>
              <p className="text-xs text-[var(--color-muted-foreground)] uppercase tracking-wide mb-0.5">Email</p>
              <p className="font-semibold text-sm">{b.customer.email || "—"}</p>
            </div>
            <div>
              <p className="text-xs text-[var(--color-muted-foreground)] uppercase tracking-wide mb-0.5">Teléfono</p>
              <p className="font-semibold text-sm">{b.customer.phone || "—"}</p>
            </div>
          </div>
          {b.notes && (
            <div className="mt-4 p-3 rounded-2xl bg-amber-50 border border-amber-100 text-sm">
              <span className="font-bold text-amber-800">Notas:</span>{" "}
              <span className="text-amber-700">{b.notes}</span>
            </div>
          )}
          {(b.extras || []).length > 0 && (
            <div className="mt-4">
              <p className="text-xs font-bold uppercase tracking-wide text-[var(--color-muted-foreground)] mb-2">Extras contratados</p>
              <div className="flex flex-wrap gap-2">
                {(b.extras || []).map((e, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold"
                    style={{ backgroundColor: "color-mix(in srgb, var(--color-primary) 12%, transparent)", color: "var(--color-primary)" }}
                  >
                    {e.type} · {e.price}€
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Checklist */}
        {checklist.length > 0 && (
          <div className="rounded-3xl border border-[var(--color-beige)] bg-[var(--color-background)] p-5">
            <h3 className="font-black tracking-tight text-base mb-4 flex items-center gap-2 text-[var(--color-foreground)]">
              <Clipboard size={17} />
              Checklist pre-sesión
              <span className="ml-auto text-xs font-semibold text-[var(--color-muted-foreground)]">
                {completedItems.size}/{checklist.length}
              </span>
            </h3>
            <div className="space-y-1">
              {checklist.map(item => {
                const done = completedItems.has(item.id);
                return (
                  <label
                    key={item.id}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-2xl cursor-pointer transition-colors",
                      done ? "bg-emerald-50" : "hover:bg-[var(--color-light)]"
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={done}
                      onChange={() => handleCompleteItem(item.id)}
                      className="w-5 h-5 rounded-md border-2 border-[var(--color-beige)] accent-[var(--color-primary)] flex-shrink-0"
                    />
                    <span className={cn(
                      "text-sm flex-1",
                      done ? "line-through text-[var(--color-muted-foreground)]" : "text-[var(--color-foreground)]"
                    )}>
                      {item.title}
                    </span>
                    {item.is_required && !done && (
                      <span className="text-xs font-bold text-red-500 flex-shrink-0">Requerido</span>
                    )}
                    {done && <CheckCircle size={14} className="text-emerald-500 flex-shrink-0" />}
                  </label>
                );
              })}
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-3 pt-1">
          {b.status === "confirmed" && (
            <button
              onClick={() => handleCheckIn(b.id)}
              disabled={actionLoading}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3.5 text-sm font-bold bg-[var(--color-primary)] text-white transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {actionLoading ? <Loader2 size={16} className="animate-spin" /> : <Play size={16} />}
              Check-in jugadores
            </button>
          )}
          {b.status === "checked_in" && (
            <button
              onClick={() => {
                setResultForm({ escaped: true, escape_time_minutes: 0, escape_time_seconds: 0, hints_used: 0, notes: "" });
                setShowResultModal(true);
              }}
              disabled={actionLoading}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3.5 text-sm font-bold bg-[var(--color-primary)] text-white transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              <Trophy size={16} />
              Finalizar sesión
            </button>
          )}
        </div>

        {/* Result Modal */}
        {showResultModal && (
          <div
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
            onClick={() => setShowResultModal(false)}
          >
            <div
              className="w-full max-w-md rounded-3xl bg-white shadow-2xl p-6"
              onClick={(e: React.MouseEvent) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 mb-6">
                <div
                  className="w-10 h-10 rounded-2xl flex items-center justify-center"
                  style={{ backgroundColor: "color-mix(in srgb, var(--color-primary) 15%, transparent)" }}
                >
                  <Trophy size={18} style={{ color: "var(--color-primary)" }} />
                </div>
                <h3 className="text-xl font-black tracking-tight text-[var(--color-foreground)]">
                  Resultado de la sesión
                </h3>
              </div>

              <div className="space-y-5">
                {/* Escaped toggle */}
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-[var(--color-muted-foreground)] mb-2">
                    ¿Escaparon?
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setResultForm(f => ({ ...f, escaped: true }))}
                      className={cn(
                        "flex flex-col items-center justify-center gap-1.5 p-4 rounded-2xl border-2 font-bold text-sm transition-all",
                        resultForm.escaped
                          ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                          : "border-[var(--color-beige)] text-[var(--color-muted-foreground)] hover:bg-[var(--color-light)]"
                      )}
                    >
                      <CheckCircle size={26} />
                      ¡Escaparon!
                    </button>
                    <button
                      onClick={() => setResultForm(f => ({ ...f, escaped: false }))}
                      className={cn(
                        "flex flex-col items-center justify-center gap-1.5 p-4 rounded-2xl border-2 font-bold text-sm transition-all",
                        !resultForm.escaped
                          ? "border-red-500 bg-red-50 text-red-600"
                          : "border-[var(--color-beige)] text-[var(--color-muted-foreground)] hover:bg-[var(--color-light)]"
                      )}
                    >
                      <XCircle size={26} />
                      No escaparon
                    </button>
                  </div>
                </div>

                {/* Escape time */}
                {resultForm.escaped && (
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-[var(--color-muted-foreground)] mb-2">
                      Tiempo de escape
                    </p>
                    <div className="flex gap-3">
                      <div className="flex-1">
                        <input
                          type="number"
                          min={0}
                          max={120}
                          value={resultForm.escape_time_minutes}
                          onChange={e => setResultForm(f => ({ ...f, escape_time_minutes: +e.target.value }))}
                          className="w-full p-2.5 border border-[var(--color-beige)] rounded-xl text-center text-lg font-bold bg-[var(--color-background)]"
                        />
                        <p className="text-xs text-center text-[var(--color-muted-foreground)] mt-1">Minutos</p>
                      </div>
                      <div className="flex items-center pb-5 text-xl font-black text-[var(--color-muted-foreground)]">:</div>
                      <div className="flex-1">
                        <input
                          type="number"
                          min={0}
                          max={59}
                          value={resultForm.escape_time_seconds}
                          onChange={e => setResultForm(f => ({ ...f, escape_time_seconds: +e.target.value }))}
                          className="w-full p-2.5 border border-[var(--color-beige)] rounded-xl text-center text-lg font-bold bg-[var(--color-background)]"
                        />
                        <p className="text-xs text-center text-[var(--color-muted-foreground)] mt-1">Segundos</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Hints */}
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-[var(--color-muted-foreground)] mb-2">
                    Pistas utilizadas
                  </p>
                  <div className="flex items-center justify-center gap-4">
                    <button
                      onClick={() => setResultForm(f => ({ ...f, hints_used: Math.max(0, f.hints_used - 1) }))}
                      className="w-10 h-10 rounded-full border-2 border-[var(--color-beige)] flex items-center justify-center text-lg font-black hover:bg-[var(--color-light)] transition-colors"
                    >
                      −
                    </button>
                    <span className="text-3xl font-black w-14 text-center tabular-nums">{resultForm.hints_used}</span>
                    <button
                      onClick={() => setResultForm(f => ({ ...f, hints_used: f.hints_used + 1 }))}
                      className="w-10 h-10 rounded-full border-2 border-[var(--color-beige)] flex items-center justify-center text-lg font-black hover:bg-[var(--color-light)] transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-[var(--color-muted-foreground)] mb-2">
                    Notas (opcional)
                  </p>
                  <textarea
                    value={resultForm.notes}
                    onChange={e => setResultForm(f => ({ ...f, notes: e.target.value }))}
                    rows={2}
                    className="w-full p-3 border border-[var(--color-beige)] rounded-2xl resize-none text-sm bg-[var(--color-background)] focus:outline-none focus:border-[var(--color-primary)]"
                    placeholder="Comentarios sobre la sesión..."
                  />
                </div>

                {/* Modal actions */}
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => setShowResultModal(false)}
                    className="flex-1 rounded-2xl px-4 py-3 text-sm font-bold border border-[var(--color-beige)] text-[var(--color-foreground)] hover:bg-[var(--color-light)] transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleRecordResult}
                    disabled={actionLoading}
                    className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-bold bg-[var(--color-primary)] text-white transition-opacity hover:opacity-90 disabled:opacity-60"
                  >
                    {actionLoading ? <Loader2 size={15} className="animate-spin" /> : null}
                    Guardar resultado
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // === SCHEDULE VIEW ===
  const totalPlayers = sessions.reduce((acc, s) => acc + s.players, 0);
  const activeNow = sessions.filter(s => s.status === "checked_in").length;
  const completedCount = sessions.filter(s => s.status === "completed").length;
  const isActiveFilter = filterStatus.includes("checked_in");

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="rounded-[2.5rem] bg-[var(--color-background)] border border-[var(--color-beige)] p-6">
        <div className="flex flex-col gap-5">
          {/* Title row */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-4xl font-black tracking-tight text-[var(--color-foreground)] flex items-center gap-3">
                <Gamepad2 size={36} style={{ color: "var(--color-primary)" }} />
                Game Master
              </h1>
              <p className="mt-1 text-sm font-medium text-[var(--color-muted-foreground)] capitalize">
                {todayDate}
              </p>
            </div>
            <button
              onClick={fetchSchedule}
              className="flex-shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-2xl border border-[var(--color-beige)] text-sm font-semibold text-[var(--color-muted-foreground)] hover:bg-[var(--color-light)] transition-colors"
            >
              <Loader2 size={14} className={cn(loading && "animate-spin")} />
              Actualizar
            </button>
          </div>

          {/* Stats pills */}
          <div className="flex flex-wrap gap-2">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--color-light)] text-sm font-semibold text-[var(--color-foreground)]">
              <Gamepad2 size={14} style={{ color: "var(--color-primary)" }} />
              <span className="font-black">{sessions.length}</span>
              <span className="text-[var(--color-muted-foreground)]">sesiones</span>
            </div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 text-sm font-semibold text-emerald-700">
              <Play size={13} />
              <span className="font-black">{activeNow}</span>
              <span className="font-medium">en juego</span>
            </div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 text-sm font-semibold text-gray-600">
              <CheckCircle size={13} />
              <span className="font-black">{completedCount}</span>
              <span className="font-medium">completadas</span>
            </div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 text-sm font-semibold text-blue-700">
              <Users size={13} />
              <span className="font-black">{totalPlayers}</span>
              <span className="font-medium">jugadores</span>
            </div>
          </div>

          {/* Toolbar */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Search */}
            <div className="relative flex-1 min-w-[160px]">
              <Users
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-muted-foreground)]"
              />
              <input
                type="text"
                placeholder="Buscar cliente..."
                value={filterSearch}
                onChange={(e) => setFilterSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-2 rounded-xl border border-[var(--color-beige)] bg-[var(--color-background)] text-sm focus:outline-none focus:border-[var(--color-primary)]"
              />
            </div>

            {/* Date */}
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="px-3 py-2 rounded-xl border border-[var(--color-beige)] bg-[var(--color-background)] text-sm focus:outline-none focus:border-[var(--color-primary)]"
            />

            {/* Room filter */}
            <select
              value={filterRoom}
              onChange={e => setFilterRoom(e.target.value)}
              className="px-3 py-2 rounded-xl border border-[var(--color-beige)] bg-[var(--color-background)] text-sm focus:outline-none focus:border-[var(--color-primary)]"
            >
              <option value="">Todas las salas</option>
              {allRooms.map(r => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>

            {/* Active filter pill toggle */}
            <button
              onClick={() => setFilterStatus(prev => prev.includes("checked_in") ? [] : ["checked_in"])}
              className={cn(
                "inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold border-2 transition-all",
                isActiveFilter
                  ? "bg-emerald-500 border-emerald-500 text-white"
                  : "border-[var(--color-beige)] text-[var(--color-muted-foreground)] hover:bg-[var(--color-light)]"
              )}
            >
              <Play size={13} />
              Activos ahora
            </button>
          </div>
        </div>
      </div>

      {/* Session list */}
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 size={32} className="animate-spin" style={{ color: "var(--color-primary)" }} />
        </div>
      ) : sessions.length === 0 ? (
        <div className="rounded-3xl border border-[var(--color-beige)] bg-[var(--color-background)] p-12 text-center">
          <Gamepad2 size={48} className="mx-auto mb-4 text-[var(--color-muted-foreground)]" />
          <h3 className="text-lg font-black tracking-tight mb-1 text-[var(--color-foreground)]">
            No hay sesiones
          </h3>
          <p className="text-sm text-[var(--color-muted-foreground)]">
            No se encontraron sesiones para los filtros aplicados.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {sessions.map(session => {
            const sc = statusConfig[session.status] || statusConfig.pending;
            const Icon = sc.icon;
            return (
              <div
                key={session.id}
                onClick={() => openDetail(session.id)}
                className="group flex items-stretch rounded-2xl border border-[var(--color-beige)] bg-[var(--color-background)] overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
              >
                {/* Left colored strip */}
                <div className={cn("w-1.5 flex-shrink-0 rounded-full my-3 ml-3", sc.strip)} />

                {/* Content */}
                <div className="flex items-center gap-4 flex-1 px-4 py-3.5">
                  {/* Time */}
                  <div className="min-w-[56px] text-center">
                    <p className="text-2xl font-black tabular-nums leading-none text-[var(--color-foreground)]">
                      {session.time}
                    </p>
                  </div>

                  {/* Divider */}
                  <div className="w-px h-10 bg-[var(--color-beige)] flex-shrink-0" />

                  {/* Room + customer */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-black tracking-tight text-base text-[var(--color-foreground)] truncate">
                      {session.room_name}
                    </h3>
                    <p className="text-xs text-[var(--color-muted-foreground)] mt-0.5 flex items-center gap-1.5 flex-wrap">
                      <span>{session.customer_name}</span>
                      <span className="text-[var(--color-beige)]">·</span>
                      <span className="inline-flex items-center gap-1">
                        <Users size={11} />
                        {session.players}
                      </span>
                      {session.has_extras && (
                        <>
                          <span className="text-[var(--color-beige)]">·</span>
                          <span className="font-semibold" style={{ color: "var(--color-primary)" }}>
                            ✦ Extras
                          </span>
                        </>
                      )}
                    </p>
                  </div>

                  {/* Status + actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={cn("inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold", sc.color)}>
                      <Icon size={11} />
                      {sc.label}
                    </span>
                    {session.status === "confirmed" && (
                      <button
                        onClick={(e) => { e.stopPropagation(); handleCheckIn(session.id); }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-[var(--color-primary)] text-white hover:opacity-90 transition-opacity"
                      >
                        <Play size={11} />
                        Check-in
                      </button>
                    )}
                    <ChevronRight size={15} className="text-[var(--color-muted-foreground)] group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
