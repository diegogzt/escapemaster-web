"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Card } from "@/components/Card";
import Button from "@/components/Button";
import { bookings as bookingsApi, rooms as roomsApi } from "@/services/api";
import {
  Calendar,
  Clock,
  Users,
  Search,
  Filter,
  Eye,
  CheckCircle,
  XCircle,
  AlertCircle,
  Plus,
  LayoutGrid,
  List,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

// Types for API response
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

interface Room {
  id: string;
  name: string;
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [allRooms, setAllRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Pagination State
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Filters State
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [roomFilter, setRoomFilter] = useState("all");
  const [dateFilterType, setDateFilterType] = useState("all"); // all, today, tomorrow, custom
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "table">("table");

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1); // Reset to page 1 on search change
      fetchData(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
    fetchData(1);
  }, [statusFilter, roomFilter, dateFilterType, customStartDate, customEndDate, pageSize]);

  // Fetch only when page changes (and not triggered by filters above)
  useEffect(() => {
    fetchData(page);
  }, [page]);

  // Initial Rooms Fetch
  useEffect(() => {
    async function fetchRooms() {
      try {
        const roomsData = await roomsApi.list();
        const roomsList = roomsData?.rooms || roomsData || [];
        setAllRooms(roomsList.map((r: any) => ({ id: r.id, name: r.name })));
      } catch (err) {
        console.error("Error fetching rooms:", err);
      }
    }
    fetchRooms();
  }, []);

  async function fetchData(currentPage: number) {
    try {
      setLoading(true);
      
      const params: any = {
        page: currentPage,
        page_size: pageSize,
      };

      if (searchTerm) params.search = searchTerm;
      if (statusFilter !== "all") params.status = statusFilter;
      if (roomFilter !== "all") params.room_id = roomFilter;

      // Date Filters
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
      
      const bookingsList = response?.bookings || response || [];
      const totalCount = response?.total || bookingsList.length;
      const pages = response?.total_pages || Math.ceil(totalCount / pageSize);

      setTotal(totalCount);
      setTotalPages(pages);

      // Transform bookings data
      const transformedBookings = bookingsList.map((b: any) => {
        const startTime = b.start_time ? new Date(b.start_time) : null;
        return {
          id: b.id,
          room_name: b.room_name || (b.room ? b.room.name : "Sin sala"),
          group_name: b.guest?.full_name || "Sin grupo",
          date: startTime ? startTime.toISOString().split("T")[0] : "",
          time: startTime ? startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "",
          players_count: b.num_people || 0,
          status: b.booking_status || "pending",
          total_price: Number(b.total_price) || 0,
          paid_amount: Number(b.total_price) - Number(b.remaining_balance) || 0,
          game_master: b.assigned_users?.[0]?.full_name || "Sin asignar",
          room_color: b.room_color || "#3B82F6",
        };
      });
      
      setBookings(transformedBookings);
      setError(null);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Error al cargar las reservas");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setViewMode("table");
      } else {
        setViewMode("grid");
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle size={12} className="mr-1" /> Confirmada
          </span>
        );
      case "pending":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <AlertCircle size={12} className="mr-1" /> Pendiente
          </span>
        );
      case "cancelled":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <XCircle size={12} className="mr-1" /> Cancelada
          </span>
        );
      default:
        return <span className="text-[var(--color-muted-foreground)]">{status}</span>;
    }
  };

  const BookingSkeleton = () => (
    <Card className="p-4 border-beige/50 animate-pulse">
      <div className="flex justify-between items-start mb-3">
        <div className="space-y-2">
          <div className="h-4 w-24 bg-gray-200 rounded"></div>
          <div className="h-3 w-16 bg-gray-200 rounded"></div>
        </div>
        <div className="h-5 w-20 bg-gray-200 rounded-full"></div>
      </div>
      <div className="mb-3 space-y-2">
        <div className="h-6 w-32 bg-gray-200 rounded"></div>
        <div className="h-4 w-24 bg-gray-200 rounded"></div>
      </div>
      <div className="flex justify-between pt-3 border-t border-beige">
        <div className="h-3 w-20 bg-gray-200 rounded"></div>
        <div className="h-8 w-24 bg-gray-200 rounded"></div>
      </div>
    </Card>
  );

  const TableSkeleton = () => (
    <tr className="animate-pulse border-b border-beige">
      <td className="px-6 py-4"><div className="h-4 w-32 bg-gray-200 rounded"></div></td>
      <td className="px-6 py-4"><div className="h-4 w-24 bg-gray-200 rounded"></div></td>
      <td className="px-6 py-4"><div className="h-4 w-32 bg-gray-200 rounded"></div></td>
      <td className="px-6 py-4"><div className="h-4 w-16 bg-gray-200 rounded"></div></td>
      <td className="px-6 py-4"><div className="h-5 w-20 bg-gray-200 rounded-full"></div></td>
      <td className="px-6 py-4"><div className="h-4 w-20 bg-gray-200 rounded"></div></td>
      <td className="px-6 py-4 text-right"><div className="h-8 w-8 bg-gray-200 rounded ml-auto"></div></td>
    </tr>
  );

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
          <p className="text-red-600">{error}</p>
          <Button onClick={() => window.location.reload()} className="mt-4">
            Reintentar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary">Reservas</h1>
          <p className="text-[var(--color-foreground)] opacity-75">
            Gestiona las sesiones y reservas
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="bg-[var(--color-background)] border border-beige rounded-lg p-1 flex items-center mr-2">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded-md transition-colors ${
                viewMode === "grid"
                  ? "bg-primary/10 text-primary"
                  : "text-[var(--color-muted-foreground)] hover:text-[var(--color-muted-foreground)]"
              }`}
              title="Vista de cuadrícula"
            >
              <LayoutGrid size={20} />
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`p-2 rounded-md transition-colors ${
                viewMode === "table"
                  ? "bg-primary/10 text-primary"
                  : "text-[var(--color-muted-foreground)] hover:text-[var(--color-muted-foreground)]"
              }`}
              title="Vista de lista"
            >
              <List size={20} />
            </button>
          </div>
          <Link href="/bookings/create">
            <Button>
              <Plus size={20} className="mr-2" />
              Nueva Reserva
            </Button>
          </Link>
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-6 p-4">
        <div className="flex flex-col gap-4">
          {/* Top Row: Search and Primary Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-muted-foreground)]"
                size={18}
              />
              <input
                type="text"
                placeholder="Buscar por grupo o email..."
                className="w-full pl-10 pr-4 py-2 border border-beige rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Status Filter */}
            <select
              className="px-4 py-2 border border-beige rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 bg-[var(--color-background)]"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">Todos los estados</option>
              <option value="confirmed">Confirmadas</option>
              <option value="pending">Pendientes</option>
              <option value="cancelled">Canceladas</option>
            </select>

            {/* Room Filter */}
            <select
              className="px-4 py-2 border border-beige rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 bg-[var(--color-background)]"
              value={roomFilter}
              onChange={(e) => setRoomFilter(e.target.value)}
            >
              <option value="all">Todas las salas</option>
              {allRooms.map((room) => (
                <option key={room.id} value={room.id}>
                  {room.name}
                </option>
              ))}
            </select>
          </div>

          {/* Bottom Row: Date Filters */}
          <div className="flex flex-col md:flex-row gap-4 items-center bg-[var(--color-light)] p-3 rounded-lg border border-[var(--color-beige)]">
            <div className="flex items-center gap-2">
              <Filter size={16} className="text-[var(--color-muted-foreground)]" />
              <span className="text-sm font-medium text-[var(--color-foreground)]">
                Filtrar por fecha:
              </span>
            </div>

            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setDateFilterType("all")}
                className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                  dateFilterType === "all"
                    ? "bg-primary text-white"
                    : "bg-[var(--color-background)] border border-[var(--color-beige)] text-[var(--color-foreground)] hover:bg-[var(--color-light)]"
                }`}
              >
                Todas
              </button>
              <button
                onClick={() => setDateFilterType("today")}
                className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                  dateFilterType === "today"
                    ? "bg-primary text-white"
                    : "bg-[var(--color-background)] border border-[var(--color-beige)] text-[var(--color-foreground)] hover:bg-[var(--color-light)]"
                }`}
              >
                Hoy
              </button>
              <button
                onClick={() => setDateFilterType("tomorrow")}
                className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                  dateFilterType === "tomorrow"
                    ? "bg-primary text-white"
                    : "bg-[var(--color-background)] border border-[var(--color-beige)] text-[var(--color-foreground)] hover:bg-[var(--color-light)]"
                }`}
              >
                Mañana
              </button>
              <button
                onClick={() => setDateFilterType("custom")}
                className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                  dateFilterType === "custom"
                    ? "bg-primary text-white"
                    : "bg-[var(--color-background)] border border-[var(--color-beige)] text-[var(--color-foreground)] hover:bg-[var(--color-light)]"
                }`}
              >
                Rango Personalizado
              </button>
            </div>

            {dateFilterType === "custom" && (
              <div className="flex items-center gap-2 animate-in fade-in slide-in-from-left-4 duration-200">
                <input
                  type="date"
                  className="px-3 py-1.5 border border-[var(--color-beige)] rounded-md text-sm"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                />
                <span className="text-[var(--color-muted-foreground)]">-</span>
                <input
                  type="date"
                  className="px-3 py-1.5 border border-[var(--color-beige)] rounded-md text-sm"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                />
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Content */}
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {loading ? (
            Array(6).fill(0).map((_, i) => <BookingSkeleton key={i} />)
          ) : bookings.length > 0 ? (
            bookings.map((booking) => (
              <Card 
                key={booking.id} 
                className="p-4 border-beige/50 hover:shadow-md transition-shadow"
                style={{ borderLeft: `4px solid ${booking.room_color}` }}
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="flex items-center font-bold text-[var(--color-foreground)] mb-1">
                      <Calendar size={14} className="mr-1 text-primary" />
                      {new Date(booking.date).toLocaleDateString()}
                    </div>
                    <div className="flex items-center text-sm text-[var(--color-muted-foreground)]">
                      <Clock size={14} className="mr-1" />
                      {booking.time}
                    </div>
                  </div>
                  {getStatusBadge(booking.status)}
                </div>

                <div className="mb-3">
                  <h3 className="font-bold text-lg text-[var(--color-foreground)] truncate" title={booking.room_name}>
                    {booking.room_name}
                  </h3>
                  <div className="text-sm text-[var(--color-muted-foreground)] mt-1 truncate">
                    {booking.group_name}
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm text-[var(--color-muted-foreground)] mb-3 bg-[var(--color-light)]/30 p-2 rounded">
                  <div className="flex items-center">
                    <Users size={14} className="mr-1" />
                    {booking.players_count} pax
                  </div>
                  <div className="flex items-center">
                    <span
                      className={
                        booking.paid_amount >= booking.total_price
                          ? "text-green-600 font-medium"
                          : "text-yellow-600 font-medium"
                      }
                    >
                      {booking.paid_amount}€
                    </span>
                    <span className="text-[var(--color-muted-foreground)]">
                      {" "}
                      / {booking.total_price}€
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-beige">
                  <div className="text-xs text-[var(--color-muted-foreground)] truncate max-w-[50%]">
                    GM: {booking.game_master}
                  </div>
                  <Link href={`/bookings/${booking.id}`}>
                    <Button variant="outline" size="sm" className="text-xs h-8">
                      Ver Detalles
                    </Button>
                  </Link>
                </div>
              </Card>
            ))
          ) : (
            <div className="col-span-full text-center py-12 bg-[var(--color-background)] rounded-xl border border-beige">
              <p className="text-[var(--color-muted-foreground)]">
                No se encontraron reservas con los filtros seleccionados.
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-[var(--color-background)] rounded-xl shadow-sm border border-beige overflow-hidden mb-8">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[var(--color-light)]/50 border-b border-beige">
                <th className="px-6 py-4 font-bold text-[var(--color-foreground)]">Fecha y Hora</th>
                <th className="px-6 py-4 font-bold text-[var(--color-foreground)]">Sala</th>
                <th className="px-6 py-4 font-bold text-[var(--color-foreground)]">Grupo</th>
                <th className="px-6 py-4 font-bold text-[var(--color-foreground)]">Jugadores</th>
                <th className="px-6 py-4 font-bold text-[var(--color-foreground)]">Estado</th>
                <th className="px-6 py-4 font-bold text-[var(--color-foreground)]">Pago</th>
                <th className="px-6 py-4 font-bold text-[var(--color-foreground)] text-right">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-beige">
              {loading ? (
                Array(5).fill(0).map((_, i) => <TableSkeleton key={i} />)
              ) : bookings.length > 0 ? (
                bookings.map((booking) => (
                  <tr
                    key={booking.id}
                    className="hover:bg-[var(--color-light)]/30 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <div className="flex items-center font-medium text-[var(--color-foreground)]">
                          <Calendar size={14} className="mr-1 text-primary" />
                          {new Date(booking.date).toLocaleDateString()}
                        </div>
                        <div className="flex items-center text-sm text-[var(--color-muted-foreground)] mt-1">
                          <Clock size={14} className="mr-1" />
                          {booking.time}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium text-[var(--color-foreground)]">
                      <div className="flex items-center">
                        <span 
                          className="w-3 h-3 rounded-full mr-2" 
                          style={{ backgroundColor: booking.room_color }}
                        />
                        {booking.room_name}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-[var(--color-foreground)]">
                        {booking.group_name}
                      </div>
                      <div className="text-xs text-[var(--color-muted-foreground)]">
                        GM: {booking.game_master}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center text-[var(--color-foreground)]">
                        <Users size={16} className="mr-2 text-[var(--color-muted-foreground)]" />
                        {booking.players_count}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(booking.status)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <span
                          className={
                            booking.paid_amount >= booking.total_price
                              ? "text-green-600 font-medium"
                              : "text-yellow-600 font-medium"
                          }
                        >
                          {booking.paid_amount}€
                        </span>
                        <span className="text-[var(--color-muted-foreground)]">
                          {" "}
                          / {booking.total_price}€
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link href={`/bookings/${booking.id}`}>
                        <button
                          className="p-2 text-[var(--color-muted-foreground)] hover:text-primary transition-colors"
                          title="Ver detalles"
                        >
                          <Eye size={18} />
                        </button>
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-8 text-center text-[var(--color-muted-foreground)]"
                  >
                    No se encontraron reservas con los filtros seleccionados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination Controls */}
      {!loading && bookings.length > 0 && (
        <div className="flex items-center justify-between border-t border-[var(--color-beige)] bg-[var(--color-background)] px-4 py-3 sm:px-6 rounded-lg shadow-sm">
          <div className="flex flex-1 justify-between sm:hidden">
            <Button
              variant="outline"
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Anterior
            </Button>
            <Button
              variant="outline"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              Siguiente
            </Button>
          </div>
          <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-[var(--color-foreground)]">
                Mostrando <span className="font-medium">{(page - 1) * pageSize + 1}</span> a{" "}
                <span className="font-medium">{Math.min(page * pageSize, total)}</span> de{" "}
                <span className="font-medium">{total}</span> resultados
              </p>
            </div>
            <div>
              <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="relative inline-flex items-center rounded-l-md px-2 py-2 text-[var(--color-muted-foreground)] ring-1 ring-inset ring-gray-300 hover:bg-[var(--color-light)] focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="sr-only">Anterior</span>
                  <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                </button>
                {/* Page Indicator */}
                <span className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-[var(--color-foreground)] ring-1 ring-inset ring-gray-300 hover:bg-[var(--color-light)] focus:z-20 focus:outline-offset-0">
                  Página {page} de {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="relative inline-flex items-center rounded-r-md px-2 py-2 text-[var(--color-muted-foreground)] ring-1 ring-inset ring-gray-300 hover:bg-[var(--color-light)] focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="sr-only">Siguiente</span>
                  <ChevronRight className="h-5 w-5" aria-hidden="true" />
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
