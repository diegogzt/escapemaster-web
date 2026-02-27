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
      
      // If no date is selected, we could default to something or show all.
      // For now, let's use the filterDate.
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
    }, 300); // Debounce search
    return () => clearTimeout(timer);
  }, [filterRoom, filterStatus, filterSearch, filterDate]);

  const openDetail = async (bookingId: string) => {
    try {
      const data = await gamemaster.getBooking(bookingId);
      setSelectedBooking(data);
      // Load checklist
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

  const statusConfig: Record<string, { label: string; color: string; icon: React.ComponentType<any> }> = {
    confirmed: { label: "Confirmada", color: "bg-blue-100 text-blue-700", icon: Clock },
    checked_in: { label: "En juego", color: "bg-green-100 text-green-700", icon: Play },
    completed: { label: "Completada", color: "bg-gray-100 text-gray-600", icon: CheckCircle },
    pending: { label: "Pendiente", color: "bg-yellow-100 text-yellow-700", icon: AlertCircle },
  };

  // === DETAIL VIEW ===
  if (view === "detail" && selectedBooking) {
    const b = selectedBooking;
    return (
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        <button onClick={() => setView("schedule")} className="flex items-center gap-2 text-primary hover:underline mb-2">
          <ArrowLeft size={16} /> Volver al horario
        </button>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-primary">{b.room.name}</h1>
            <p className="text-[var(--color-muted-foreground)]">
              {new Date(b.scheduled_time).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })} — {b.room.duration_minutes} min
            </p>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusConfig[b.status]?.color || "bg-gray-100"}`}>
            {statusConfig[b.status]?.label || b.status}
          </span>
        </div>

        {/* Customer Info */}
        <Card className="hover:translate-y-0">
          <h3 className="font-bold text-lg mb-3 flex items-center gap-2"><Users size={18} /> Cliente</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div><span className="text-[var(--color-muted-foreground)]">Nombre</span><p className="font-medium">{b.customer.name || "N/A"}</p></div>
            <div><span className="text-[var(--color-muted-foreground)]">Jugadores</span><p className="font-medium">{b.players_count}</p></div>
            <div><span className="text-[var(--color-muted-foreground)]">Email</span><p className="font-medium">{b.customer.email || "—"}</p></div>
            <div><span className="text-[var(--color-muted-foreground)]">Teléfono</span><p className="font-medium">{b.customer.phone || "—"}</p></div>
          </div>
          {b.notes && (
            <div className="mt-3 p-3 bg-yellow-50 rounded-lg text-sm">
              <strong>Notas:</strong> {b.notes}
            </div>
          )}
          {(b.extras || []).length > 0 && (
            <div className="mt-3">
              <p className="text-sm font-semibold mb-1">Extras contratados:</p>
              {(b.extras || []).map((e, i) => (
                <span key={i} className="inline-block mr-2 mb-1 px-2 py-1 bg-primary/10 text-primary rounded text-xs font-medium">
                  {e.type} — {e.price}€
                </span>
              ))}
            </div>
          )}
        </Card>

        {/* Checklist */}
        {checklist.length > 0 && (
          <Card className="hover:translate-y-0">
            <h3 className="font-bold text-lg mb-3 flex items-center gap-2"><Clipboard size={18} /> Checklist pre-sesión</h3>
            <div className="space-y-2">
              {checklist.map(item => (
                <label key={item.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-[var(--color-light)]/50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={completedItems.has(item.id)}
                    onChange={() => handleCompleteItem(item.id)}
                    className="w-5 h-5 rounded border-2 border-primary accent-primary"
                  />
                  <span className={completedItems.has(item.id) ? "line-through text-[var(--color-muted-foreground)]" : ""}>
                    {item.title}
                  </span>
                  {item.is_required && <span className="text-red-500 text-xs">*</span>}
                </label>
              ))}
            </div>
          </Card>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          {b.status === "confirmed" && (
            <Button onClick={() => handleCheckIn(b.id)} loading={actionLoading} className="flex-1">
              <Play size={16} className="mr-2" /> Check-in jugadores
            </Button>
          )}
          {b.status === "checked_in" && (
            <Button onClick={() => { setResultForm({ escaped: true, escape_time_minutes: 0, escape_time_seconds: 0, hints_used: 0, notes: "" }); setShowResultModal(true); }} className="flex-1">
              <Trophy size={16} className="mr-2" /> Finalizar sesión
            </Button>
          )}
        </div>

        {/* Result Modal */}
        {showResultModal && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowResultModal(false)}>
            <Card className="w-full max-w-md hover:translate-y-0" onClick={(e: React.MouseEvent) => e.stopPropagation()}>
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><Trophy size={20} className="text-primary" /> Resultado de la sesión</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">¿Escaparon?</label>
                  <div className="flex gap-2">
                    <button onClick={() => setResultForm(f => ({ ...f, escaped: true }))} className={`flex-1 p-3 rounded-lg border-2 font-medium transition-all ${resultForm.escaped ? "border-green-500 bg-green-50 text-green-700" : "border-[var(--color-beige)]"}`}>
                      <CheckCircle size={20} className="mx-auto mb-1" /> ¡Escaparon!
                    </button>
                    <button onClick={() => setResultForm(f => ({ ...f, escaped: false }))} className={`flex-1 p-3 rounded-lg border-2 font-medium transition-all ${!resultForm.escaped ? "border-red-500 bg-red-50 text-red-700" : "border-[var(--color-beige)]"}`}>
                      <XCircle size={20} className="mx-auto mb-1" /> No escaparon
                    </button>
                  </div>
                </div>
                {resultForm.escaped && (
                  <div>
                    <label className="text-sm font-medium mb-1 block">Tiempo de escape</label>
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <input type="number" min={0} max={120} value={resultForm.escape_time_minutes} onChange={e => setResultForm(f => ({ ...f, escape_time_minutes: +e.target.value }))} className="w-full p-2 border border-[var(--color-beige)] rounded-lg" />
                        <span className="text-xs text-[var(--color-muted-foreground)]">Minutos</span>
                      </div>
                      <div className="flex-1">
                        <input type="number" min={0} max={59} value={resultForm.escape_time_seconds} onChange={e => setResultForm(f => ({ ...f, escape_time_seconds: +e.target.value }))} className="w-full p-2 border border-[var(--color-beige)] rounded-lg" />
                        <span className="text-xs text-[var(--color-muted-foreground)]">Segundos</span>
                      </div>
                    </div>
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium mb-1 block">Pistas utilizadas</label>
                  <div className="flex items-center gap-3">
                    <button onClick={() => setResultForm(f => ({ ...f, hints_used: Math.max(0, f.hints_used - 1) }))} className="w-10 h-10 rounded-full border-2 border-[var(--color-beige)] flex items-center justify-center text-lg font-bold hover:bg-[var(--color-light)]">−</button>
                    <span className="text-2xl font-bold w-12 text-center">{resultForm.hints_used}</span>
                    <button onClick={() => setResultForm(f => ({ ...f, hints_used: f.hints_used + 1 }))} className="w-10 h-10 rounded-full border-2 border-[var(--color-beige)] flex items-center justify-center text-lg font-bold hover:bg-[var(--color-light)]">+</button>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Notas (opcional)</label>
                  <textarea value={resultForm.notes} onChange={e => setResultForm(f => ({ ...f, notes: e.target.value }))} rows={2} className="w-full p-2 border border-[var(--color-beige)] rounded-lg resize-none" placeholder="Comentarios sobre la sesión..." />
                </div>
                <div className="flex gap-2 pt-2">
                  <Button variant="outline" onClick={() => setShowResultModal(false)} className="flex-1">Cancelar</Button>
                  <Button onClick={handleRecordResult} loading={actionLoading} className="flex-1">Guardar resultado</Button>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    );
  }

  // === SCHEDULE VIEW ===
  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary flex items-center gap-2">
            <Gamepad2 size={28} /> Game Master
          </h1>
          <p className="text-[var(--color-muted-foreground)] capitalize">{todayDate}</p>
        </div>
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:min-w-[200px]">
            <input
              type="text"
              placeholder="Buscar cliente..."
              value={filterSearch}
              onChange={(e) => setFilterSearch(e.target.value)}
              className="w-full p-2 pl-8 border border-[var(--color-beige)] rounded-lg bg-[var(--color-background)] text-sm"
            />
            <Users className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
          </div>
          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="p-2 border border-[var(--color-beige)] rounded-lg bg-[var(--color-background)] text-sm"
          />
          <select 
            value={filterRoom} 
            onChange={e => setFilterRoom(e.target.value)} 
            className="p-2 border border-[var(--color-beige)] rounded-lg bg-[var(--color-background)] text-sm"
          >
            <option value="">Todas las salas</option>
            {allRooms.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
          </select>
          <div className="flex gap-1 bg-muted p-1 rounded-lg">
             <button 
               onClick={() => setFilterStatus(prev => prev.includes("checked_in") ? [] : ["checked_in"])}
               className={cn(
                 "px-3 py-1 text-xs font-semibold rounded-md transition-all",
                 filterStatus.includes("checked_in") ? "bg-primary text-white" : "hover:bg-background"
               )}
             >
               Activos ahora
             </button>
          </div>
          <Button variant="outline" size="sm" onClick={fetchSchedule}>
            <Loader2 className={cn("mr-2 h-4 w-4", loading && "animate-spin")} size={14} />
            Actualizar
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="animate-spin text-primary" size={32} />
        </div>
      ) : sessions.length === 0 ? (
        <Card className="text-center py-12 hover:translate-y-0">
          <Gamepad2 size={48} className="mx-auto mb-4 text-[var(--color-muted-foreground)]" />
          <h3 className="text-lg font-bold mb-1">No hay sesiones hoy</h3>
          <p className="text-[var(--color-muted-foreground)]">¡Día libre! 🎉</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {sessions.map(session => {
            const sc = statusConfig[session.status] || statusConfig.pending;
            const Icon = sc.icon;
            return (
              <Card key={session.id} className="hover:translate-y-0 hover:shadow-md cursor-pointer" onClick={() => openDetail(session.id)}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="text-center min-w-[60px]">
                      <p className="text-2xl font-bold text-primary">{session.time}</p>
                    </div>
                    <div className="w-1 h-12 rounded-full bg-primary/20" />
                    <div>
                      <h3 className="font-bold text-lg">{session.room_name}</h3>
                      <p className="text-sm text-[var(--color-muted-foreground)]">
                        {session.customer_name} · <Users size={12} className="inline" /> {session.players}
                        {session.has_extras && <span className="ml-2 text-primary">✦ Extras</span>}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${sc.color}`}>
                      <Icon size={12} className="inline mr-1" />{sc.label}
                    </span>
                    {session.status === "confirmed" && (
                      <Button
                        size="sm"
                        onClick={(e) => { e.stopPropagation(); handleCheckIn(session.id); }}
                      >
                        Check-in
                      </Button>
                    )}
                    <ChevronRight size={16} className="text-[var(--color-muted-foreground)]" />
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Stats summary */}
      {sessions.length > 0 && (
        <div className="mt-6 grid grid-cols-3 gap-4">
          <Card className="text-center py-4 hover:translate-y-0">
            <p className="text-3xl font-bold text-primary">{sessions.length}</p>
            <p className="text-xs text-[var(--color-muted-foreground)]">Sesiones hoy</p>
          </Card>
          <Card className="text-center py-4 hover:translate-y-0">
            <p className="text-3xl font-bold text-green-600">{sessions.filter(s => s.status === "completed").length}</p>
            <p className="text-xs text-[var(--color-muted-foreground)]">Completadas</p>
          </Card>
          <Card className="text-center py-4 hover:translate-y-0">
            <p className="text-3xl font-bold text-blue-600">{sessions.reduce((acc, s) => acc + s.players, 0)}</p>
            <p className="text-xs text-[var(--color-muted-foreground)]">Jugadores total</p>
          </Card>
        </div>
      )}
    </div>
  );
}
