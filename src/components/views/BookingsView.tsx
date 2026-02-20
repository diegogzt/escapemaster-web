"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useDataStore } from "@/stores/data-store";
import { Card } from "@/components/Card";
import Button from "@/components/Button";
import { bookings as bookingsApi, rooms as roomsApi } from "@/services/api";
import {
  Calendar,
  Clock,
  Users,
  Search,
  Filter,
  Plus,
  LayoutGrid,
  List,
  ChevronLeft,
  ChevronRight,
  Eye,
  AlertCircle,
  CheckCircle,
  XCircle,
} from "lucide-react";

interface Booking {
  id: string;
  room_name: string;
  group_name: string;
  date: string;
  time: string;
  players_count: number;
  status: string;
  total_price: number;
  paid_amount: number;
  game_master: string;
  room_color: string;
}

export function BookingsView() {
  const { 
    bookingsState, 
    setBookingsState, 
    rooms: allRooms, 
    fetchRooms
  } = useDataStore();

  const [bookings, setBookings] = useState<Booking[]>(bookingsState.data);
  const [loading, setLoading] = useState(!bookingsState.lastFetched);
  const [error, setError] = useState<string | null>(null);
  
  const { searchTerm, statusFilter, roomFilter, dateFilterType, page, pageSize } = bookingsState.filters;

  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "table">("table");

  const updateFilter = (newFilters: any) => {
    setBookingsState({
      filters: { ...bookingsState.filters, ...newFilters }
    });
  };

  async function fetchData(currentPage: number) {
    const isFresh = bookingsState.lastFetched && (Date.now() - bookingsState.lastFetched < 60000);
    if (isFresh && bookings.length > 0 && currentPage === page) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const params: any = { page: currentPage, page_size: pageSize };
      if (searchTerm) params.search = searchTerm;
      if (statusFilter !== "all") params.status = statusFilter;
      if (roomFilter !== "all") params.room_id = roomFilter;

      if (dateFilterType === "today") {
        const today = new Date();
        params.date_from = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
        params.date_to = params.date_from;
      } else if (dateFilterType === "tomorrow") {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        params.date_from = `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, '0')}-${String(tomorrow.getDate()).padStart(2, '0')}`;
        params.date_to = params.date_from;
      } else if (dateFilterType === "custom" && customStartDate) {
        params.date_from = customStartDate;
        if (customEndDate) params.date_to = customEndDate;
      }

      const response = await bookingsApi.list(params);
      const bookingsList = Array.isArray(response?.bookings) ? response.bookings : (Array.isArray(response) ? response : []);
      
      const transformedBookings = bookingsList.map((b: any) => ({
        id: b.id,
        room_name: b.room_name || (b.room ? b.room.name : "Sin sala"),
        group_name: b.guest?.full_name || "Sin grupo",
        date: b.start_time ? new Date(b.start_time).toISOString().split("T")[0] : "",
        time: b.start_time ? new Date(b.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "",
        players_count: b.num_people || 0,
        status: b.booking_status || "pending",
        total_price: Number(b.total_price) || 0,
        paid_amount: Number(b.total_price) - Number(b.remaining_balance) || 0,
        game_master: b.assigned_users?.[0]?.full_name || "Sin asignar",
        room_color: b.room_color || "#3B82F6",
      }));
      
      setBookings(transformedBookings);
      setBookingsState({ 
        data: transformedBookings,
        lastFetched: Date.now()
      });
      setError(null);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Error al cargar las reservas");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => { fetchData(1); }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => { fetchData(1); }, [statusFilter, roomFilter, dateFilterType, customStartDate, customEndDate, pageSize]);
  useEffect(() => { fetchData(page); }, [page]);
  useEffect(() => { fetchRooms(); }, [fetchRooms]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed": return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500/10 text-green-400"><CheckCircle size={12} className="mr-1" /> Confirmada</span>;
      case "pending": return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800"><AlertCircle size={12} className="mr-1" /> Pendiente</span>;
      case "cancelled": return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800"><XCircle size={12} className="mr-1" /> Cancelada</span>;
      default: return <span className="text-[var(--color-muted-foreground)]">{status}</span>;
    }
  };

  const BookingSkeleton = () => <Card className="p-4 border-beige/50 animate-pulse"><div className="h-4 w-24 bg-[var(--color-background-soft)] rounded mb-2" /><div className="h-6 w-32 bg-[var(--color-background-soft)] rounded" /></Card>;

  if (error) return <div className="text-center p-12"><AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" /><p className="text-red-600">{error}</p><Button onClick={() => fetchData(1)}>Reintentar</Button></div>;

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary">Reservas</h1>
          <p className="text-[var(--color-foreground)] opacity-75">Gestiona las sesiones y reservas</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="bg-[var(--color-background)] border border-beige rounded-lg p-1 flex mr-2">
            <button onClick={() => setViewMode("grid")} className={`p-2 rounded-md ${viewMode === "grid" ? "bg-primary/10 text-primary" : "text-muted-foreground"}`}><LayoutGrid size={20} /></button>
            <button onClick={() => setViewMode("table")} className={`p-2 rounded-md ${viewMode === "table" ? "bg-primary/10 text-primary" : "text-muted-foreground"}`}><List size={20} /></button>
          </div>
          <Link href="/bookings/create"><Button><Plus size={20} className="mr-2" />Nueva Reserva</Button></Link>
        </div>
      </div>

      <Card className="mb-6 p-4">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
              <input type="text" placeholder="Buscar..." className="w-full pl-10 pr-4 py-2 border border-beige rounded-lg focus:ring-2 focus:ring-primary/20" value={searchTerm} onChange={(e) => updateFilter({ searchTerm: e.target.value })} />
            </div>
            <select className="px-4 py-2 border border-beige rounded-lg bg-[var(--color-background)]" value={statusFilter} onChange={(e) => updateFilter({ statusFilter: e.target.value })}>
              <option value="all">Todos los estados</option>
              <option value="confirmed">Confirmadas</option>
              <option value="pending">Pendientes</option>
              <option value="cancelled">Canceladas</option>
            </select>
            <select className="px-4 py-2 border border-beige rounded-lg bg-[var(--color-background)]" value={roomFilter} onChange={(e) => updateFilter({ roomFilter: e.target.value })}>
              <option value="all">Todas las salas</option>
              {allRooms.map((room) => <option key={room.id} value={room.id}>{room.name}</option>)}
            </select>
          </div>
          <div className="flex flex-wrap gap-2 items-center bg-[var(--color-light)] p-3 rounded-lg border border-beige">
             <Filter size={16} />
             {["all", "today", "tomorrow", "custom"].map(t => (
               <button key={t} onClick={() => updateFilter({ dateFilterType: t })} className={`px-3 py-1.5 text-sm rounded-md ${dateFilterType === t ? "bg-primary text-white" : "bg-[var(--color-background)]"}`}>
                 {t === "all" ? "Todas" : t === "today" ? "Hoy" : t === "tomorrow" ? "Mañana" : "Rango"}
               </button>
             ))}
          </div>
        </div>
      </Card>

      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {loading ? Array(6).fill(0).map((_, i) => <BookingSkeleton key={i} />) : (bookings || []).map(b => (
            <Card key={b.id} className="p-4" style={{ borderLeft: `4px solid ${b.room_color}` }}>
              <div className="flex justify-between mb-2"><strong>{b.date} {b.time}</strong> {getStatusBadge(b.status)}</div>
              <h3 className="font-bold">{b.room_name}</h3>
              <p className="text-sm opacity-70">{b.group_name}</p>
              <div className="flex justify-between mt-4 border-t pt-2 items-center">
                <span className="text-xs">GM: {b.game_master}</span>
                <Link href={`/bookings/${b.id}`}><Button variant="outline" size="sm">Ver</Button></Link>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="bg-[var(--color-background)] rounded-xl border border-beige overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-[var(--color-light)]">
              <tr>
                <th className="p-4">Fecha/Hora</th><th className="p-4">Sala</th><th className="p-4">Grupo</th><th className="p-4">Estado</th><th className="p-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {(bookings || []).map(b => (
                <tr key={b.id} className="border-t border-beige">
                  <td className="p-4">{b.date} {b.time}</td>
                  <td className="p-4">{b.room_name}</td>
                  <td className="p-4">{b.group_name}</td>
                  <td className="p-4">{getStatusBadge(b.status)}</td>
                  <td className="p-4 text-right"><Link href={`/bookings/${b.id}`}><Eye size={18} /></Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
