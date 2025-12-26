"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Card } from "@/components/Card";
import Button from "@/components/Button";
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
} from "lucide-react";

// Mock Data
const MOCK_BOOKINGS = [
  {
    id: "1",
    room_name: "La Prisión de Alcatraz",
    group_name: "Los Escapistas",
    date: "2023-12-25",
    time: "18:00",
    players_count: 4,
    status: "confirmed",
    total_price: 120,
    paid_amount: 120,
    game_master: "Carlos GM",
  },
  {
    id: "2",
    room_name: "El Misterio del Faraón",
    group_name: "Familia Pérez",
    date: "2023-12-26",
    time: "16:30",
    players_count: 6,
    status: "pending",
    total_price: 150,
    paid_amount: 50,
    game_master: "Ana GM",
  },
  {
    id: "3",
    room_name: "Laboratorio Zombie",
    group_name: "Cumpleaños Javi",
    date: "2023-12-26",
    time: "20:00",
    players_count: 5,
    status: "cancelled",
    total_price: 125,
    paid_amount: 0,
    game_master: "Unassigned",
  },
];

export default function BookingsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [roomFilter, setRoomFilter] = useState("all");
  const [dateFilterType, setDateFilterType] = useState("all"); // all, today, tomorrow, custom
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "table">("table");

  React.useEffect(() => {
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

  // Extract unique rooms
  const uniqueRooms = Array.from(
    new Set(MOCK_BOOKINGS.map((b) => b.room_name))
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

  const filteredBookings = MOCK_BOOKINGS.filter((booking) => {
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
    const bookingDate = new Date(booking.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (dateFilterType === "today") {
      matchesDate = bookingDate.getTime() === today.getTime();
    } else if (dateFilterType === "tomorrow") {
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      matchesDate = bookingDate.getTime() === tomorrow.getTime();
    } else if (dateFilterType === "custom") {
      if (customStartDate && customEndDate) {
        const start = new Date(customStartDate);
        const end = new Date(customEndDate);
        // Reset hours for comparison
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
        matchesDate = bookingDate >= start && bookingDate <= end;
      } else if (customStartDate) {
        const start = new Date(customStartDate);
        start.setHours(0, 0, 0, 0);
        matchesDate = bookingDate >= start;
      }
    }

    return matchesSearch && matchesStatus && matchesRoom && matchesDate;
  });

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
          {filteredBookings.length > 0 ? (
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
              {filteredBookings.length > 0 ? (
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
