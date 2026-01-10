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
  MoreVertical,
  Eye,
  CheckCircle,
  XCircle,
  AlertCircle,
  Plus,
  LayoutGrid,
  List,
  Loader2,
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
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [allRooms, setAllRooms] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [roomFilter, setRoomFilter] = useState("all");
  const [dateFilterType, setDateFilterType] = useState("all"); // all, today, tomorrow, custom
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "table">("table");

  // Fetch bookings and rooms from API
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const [bookingsResponse, roomsData] = await Promise.all([
          bookingsApi.list(),
          roomsApi.list(),
        ]);
        
        const bookingsList = bookingsResponse?.bookings || bookingsResponse || [];
        const roomsList = roomsData?.rooms || roomsData || [];
        
        // Transform bookings data to match expected format
        // API returns: id, start_time, end_time, num_people, booking_status, payment_status, 
        //              total_price, remaining_balance, guest, room_name, assigned_users
        const transformedBookings = (bookingsList).map((b: any) => {
          const startTime = b.start_time ? new Date(b.start_time) : null;
          return {
            id: b.id,
            room_name: b.room_name || "Sin sala",
            group_name: b.guest?.full_name || "Sin grupo",
            date: startTime ? startTime.toISOString().split("T")[0] : "",
            time: startTime ? startTime.toTimeString().substring(0, 5) : "",
            players_count: b.num_people || 0,
            status: b.booking_status || "pending",
            total_price: Number(b.total_price) || 0,
            paid_amount: Number(b.total_price) - Number(b.remaining_balance) || 0,
            game_master: b.assigned_users?.[0]?.full_name || "Sin asignar",
          };
        });
        
        setBookings(transformedBookings);
        setAllRooms((roomsList).map((r: any) => r.name));
        setError(null);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Error al cargar las reservas");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setViewMode("table");
      } else {
        setViewMode("grid");
      }
    };

    // Set initial value
    handleResize();

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Extract unique rooms from API
  const uniqueRooms = allRooms.length > 0 ? allRooms : Array.from(
    new Set(bookings.map((b) => b.room_name))
  );

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
        return <span className="text-gray-500">{status}</span>;
    }
  };

  const filteredBookings = bookings.filter((booking) => {
    // Search Term
    const matchesSearch =
      booking.group_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.room_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.game_master.toLowerCase().includes(searchTerm.toLowerCase());

    // Status Filter
    const matchesStatus =
      statusFilter === "all" || booking.status === statusFilter;

    // Room Filter
    const matchesRoom =
      roomFilter === "all" || booking.room_name === roomFilter;

    // Date Filter
    let matchesDate = true;
    
    // Create Date objects but compare YYYY-MM-DD strings to avoid timezone issues with midnight
    const bookingDateObj = new Date(booking.date);
    const bookingDateStr = booking.date; // already YYYY-MM-DD from transform
    
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    if (dateFilterType === "today") {
      matchesDate = bookingDateStr === todayStr;
    } else if (dateFilterType === "tomorrow") {
      matchesDate = bookingDateStr === tomorrowStr;
    } else if (dateFilterType === "custom") {
      if (customStartDate && customEndDate) {
        const start = new Date(customStartDate);
        const end = new Date(customEndDate);
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
        matchesDate = bookingDateObj >= start && bookingDateObj <= end;
      } else if (customStartDate) {
        const start = new Date(customStartDate);
        start.setHours(0, 0, 0, 0);
        matchesDate = bookingDateObj >= start;
      }
    }

    return matchesSearch && matchesStatus && matchesRoom && matchesDate;
  });

  // Loading Skeleton Component
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



  // Error state
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
          <p className="text-dark opacity-75">
            Gestiona las sesiones y reservas
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="bg-white border border-beige rounded-lg p-1 flex items-center mr-2">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded-md transition-colors ${
                viewMode === "grid"
                  ? "bg-primary/10 text-primary"
                  : "text-gray-400 hover:text-gray-600"
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
                  : "text-gray-400 hover:text-gray-600"
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
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={18}
              />
              <input
                type="text"
                placeholder="Buscar por grupo, sala o GM..."
                className="w-full pl-10 pr-4 py-2 border border-beige rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Status Filter */}
            <select
              className="px-4 py-2 border border-beige rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 bg-white"
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
              className="px-4 py-2 border border-beige rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 bg-white"
              value={roomFilter}
              onChange={(e) => setRoomFilter(e.target.value)}
            >
              <option value="all">Todas las salas</option>
              {uniqueRooms.map((room) => (
                <option key={room} value={room}>
                  {room}
                </option>
              ))}
            </select>
          </div>

          {/* Bottom Row: Date Filters */}
          <div className="flex flex-col md:flex-row gap-4 items-center bg-gray-50 p-3 rounded-lg border border-gray-100">
            <div className="flex items-center gap-2">
              <Filter size={16} className="text-gray-500" />
              <span className="text-sm font-medium text-gray-700">
                Filtrar por fecha:
              </span>
            </div>

            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setDateFilterType("all")}
                className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                  dateFilterType === "all"
                    ? "bg-primary text-white"
                    : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
                }`}
              >
                Todas
              </button>
              <button
                onClick={() => setDateFilterType("today")}
                className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                  dateFilterType === "today"
                    ? "bg-primary text-white"
                    : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
                }`}
              >
                Hoy
              </button>
              <button
                onClick={() => setDateFilterType("tomorrow")}
                className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                  dateFilterType === "tomorrow"
                    ? "bg-primary text-white"
                    : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
                }`}
              >
                Mañana
              </button>
              <button
                onClick={() => setDateFilterType("custom")}
                className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                  dateFilterType === "custom"
                    ? "bg-primary text-white"
                    : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
                }`}
              >
                Rango Personalizado
              </button>
            </div>

            {dateFilterType === "custom" && (
              <div className="flex items-center gap-2 animate-in fade-in slide-in-from-left-4 duration-200">
                <input
                  type="date"
                  className="px-3 py-1.5 border border-gray-200 rounded-md text-sm"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                />
                <span className="text-gray-400">-</span>
                <input
                  type="date"
                  className="px-3 py-1.5 border border-gray-200 rounded-md text-sm"
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading ? (
            Array(6).fill(0).map((_, i) => <BookingSkeleton key={i} />)
          ) : filteredBookings.length > 0 ? (
            filteredBookings.map((booking) => (
              <Card key={booking.id} className="p-4 border-beige/50">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="flex items-center font-bold text-dark mb-1">
                      <Calendar size={14} className="mr-1 text-primary" />
                      {new Date(booking.date).toLocaleDateString()}
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <Clock size={14} className="mr-1" />
                      {booking.time}
                    </div>
                  </div>
                  {getStatusBadge(booking.status)}
                </div>

                <div className="mb-3">
                  <h3 className="font-bold text-lg text-dark">
                    {booking.room_name}
                  </h3>
                  <div className="text-sm text-gray-600 mt-1">
                    {booking.group_name}
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm text-gray-600 mb-3 bg-light/30 p-2 rounded">
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
                    <span className="text-gray-400">
                      {" "}
                      / {booking.total_price}€
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-beige">
                  <div className="text-xs text-gray-500">
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
            <div className="col-span-full text-center py-12 bg-white rounded-xl border border-beige">
              <p className="text-gray-500">
                No se encontraron reservas con los filtros seleccionados.
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-beige overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-light/50 border-b border-beige">
                <th className="px-6 py-4 font-bold text-dark">Fecha y Hora</th>
                <th className="px-6 py-4 font-bold text-dark">Sala</th>
                <th className="px-6 py-4 font-bold text-dark">Grupo</th>
                <th className="px-6 py-4 font-bold text-dark">Jugadores</th>
                <th className="px-6 py-4 font-bold text-dark">Estado</th>
                <th className="px-6 py-4 font-bold text-dark">Pago</th>
                <th className="px-6 py-4 font-bold text-dark text-right">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-beige">
              {loading ? (
                Array(5).fill(0).map((_, i) => <TableSkeleton key={i} />)
              ) : filteredBookings.length > 0 ? (
                filteredBookings.map((booking) => (
                  <tr
                    key={booking.id}
                    className="hover:bg-light/30 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <div className="flex items-center font-medium text-dark">
                          <Calendar size={14} className="mr-1 text-primary" />
                          {new Date(booking.date).toLocaleDateString()}
                        </div>
                        <div className="flex items-center text-sm text-gray-500 mt-1">
                          <Clock size={14} className="mr-1" />
                          {booking.time}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium text-dark">
                      {booking.room_name}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-dark">
                        {booking.group_name}
                      </div>
                      <div className="text-xs text-gray-500">
                        GM: {booking.game_master}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center text-gray-700">
                        <Users size={16} className="mr-2 text-gray-400" />
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
                        <span className="text-gray-400">
                          {" "}
                          / {booking.total_price}€
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link href={`/bookings/${booking.id}`}>
                        <button
                          className="p-2 text-gray-400 hover:text-primary transition-colors"
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
                    className="px-6 py-8 text-center text-gray-500"
                  >
                    No se encontraron reservas con los filtros seleccionados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
