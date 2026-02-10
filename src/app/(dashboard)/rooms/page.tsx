"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/Card";
import Button from "@/components/Button";
import { rooms } from "@/services/api";
import {
  Layers,
  Users,
  Clock,
  DollarSign,
  Settings,
  Calendar,
  Info,
  LayoutGrid,
  List,
  Edit,
  Trash2,
} from "lucide-react";

export default function RoomsPage() {
  const [roomsList, setRoomsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  useEffect(() => {
    rooms
      .list()
      .then((data) => setRoomsList(Array.isArray(data?.rooms) ? data.rooms : Array.isArray(data) ? data : []))
      .catch((err) => {
        console.error("Failed to load rooms:", err);
        setRoomsList([]);
      })
      .finally(() => setLoading(false));

    // Set default view based on screen width
    if (typeof window !== "undefined" && window.innerWidth >= 768) {
      setViewMode("table");
    }
  }, []);

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary">Salas</h1>
          <p className="text-[var(--color-foreground)] opacity-75">
            {roomsList.length} {roomsList.length === 1 ? "sala" : "salas"}
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
          <Link href="/rooms/create">
            <Button>
              <Layers size={20} className="mr-2" />
              Nueva Sala
            </Button>
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-[var(--color-muted-foreground)]">Cargando salas...</p>
        </div>
      ) : roomsList.length === 0 ? (
        <Card className="text-center py-12">
          <Layers className="mx-auto text-[var(--color-muted-foreground)] mb-4" size={48} />
          <h3 className="text-xl font-bold text-[var(--color-foreground)] mb-2">
            No hay salas todavía
          </h3>
          <p className="text-[var(--color-muted-foreground)] mb-6">
            Crea tu primera sala para empezar a recibir reservas
          </p>
          <Link href="/rooms/create">
            <Button>Crear Sala</Button>
          </Link>
        </Card>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {roomsList.map((room) => (
            <Card
              key={room.id}
              className="group relative overflow-hidden hover:shadow-xl transition-all duration-300 border-beige/50"
            >
              {/* Hover Overlay for Stats */}
              <div className="absolute inset-0 bg-primary/95 text-white p-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-bold text-lg">Próximas Sesiones</h4>
                  <span className="bg-[var(--color-background)]/20 px-2 py-1 rounded text-xs">
                    {room.pending_bookings_count || 0} pendientes
                  </span>
                </div>

                <div className="flex-1 space-y-3 overflow-y-auto">
                  {room.next_bookings && room.next_bookings.length > 0 ? (
                    room.next_bookings.map((booking: any) => (
                      <div
                        key={booking.id}
                        className="bg-[var(--color-background)]/10 p-2 rounded text-sm"
                      >
                        <div className="flex justify-between font-medium">
                          <span>
                            {new Date(booking.start_time).toLocaleDateString()}
                          </span>
                          <span>
                            {new Date(booking.start_time).toLocaleTimeString(
                              [],
                              { hour: "2-digit", minute: "2-digit" }
                            )}
                          </span>
                        </div>
                        <div className="text-xs text-white/70 mt-1 flex justify-between">
                          <span>{booking.num_people} personas</span>
                          <span>
                            {booking.assigned_users?.join(", ") ||
                              "Sin asignar"}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-white/60 text-center">
                      <Calendar size={32} className="mb-2 opacity-20" />
                      <p>No hay sesiones próximas</p>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t border-white/10 flex gap-2">
                  <Link href={`/rooms/${room.id}`} className="flex-1">
                    <Button
                      variant="secondary"
                      block
                      className="bg-[var(--color-background)] text-primary hover:bg-[var(--color-background)]/90"
                    >
                      <Settings size={16} className="mr-2" />
                      Configurar
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Main Content */}
              <div className="mb-4">
                <div className="flex items-start justify-between">
                  <h3 className="font-bold text-lg text-[var(--color-foreground)]">{room.name}</h3>
                  <span
                    className={`px-2 py-1 text-xs rounded ${
                      room.is_active
                        ? "bg-green-500/10 text-green-500"
                        : "bg-[var(--color-light)] text-[var(--color-foreground)]"
                    }`}
                  >
                    {room.is_active ? "Activa" : "Inactiva"}
                  </span>
                </div>
                <p className="text-sm text-[var(--color-muted-foreground)] mt-2 line-clamp-2">
                  {room.description}
                </p>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center text-[var(--color-muted-foreground)]">
                  <Users size={16} className="mr-2" />
                  {room.capacity_min}-{room.capacity_max} jugadores
                </div>
                <div className="flex items-center text-[var(--color-muted-foreground)]">
                  <Clock size={16} className="mr-2" />
                  {room.duration_minutes} minutos
                </div>
                <div className="flex items-center text-[var(--color-muted-foreground)]">
                  <DollarSign size={16} className="mr-2" />
                  {room.price_per_person}€ por persona
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-beige">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[var(--color-muted-foreground)]">Dificultad</span>
                  <div className="flex space-x-1">
                    {[1, 2, 3, 4, 5].map((level) => (
                      <div
                        key={level}
                        className={`w-2 h-2 rounded-full ${
                          level <= room.difficulty_level
                            ? "bg-primary"
                            : "bg-[var(--color-background-soft)]"
                        }`}
                      />
                    ))}
                  </div>
                </div>
                {room.theme && (
                  <span className="inline-block mt-2 px-2 py-1 text-xs bg-[var(--color-light)] rounded">
                    {room.theme}
                  </span>
                )}
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="bg-[var(--color-background)] rounded-xl shadow-sm border border-beige overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[var(--color-light)]/50 border-b border-beige">
                <th className="px-6 py-4 font-bold text-[var(--color-foreground)]">Nombre</th>
                <th className="px-6 py-4 font-bold text-[var(--color-foreground)]">Jugadores</th>
                <th className="px-6 py-4 font-bold text-[var(--color-foreground)]">Duración</th>
                <th className="px-6 py-4 font-bold text-[var(--color-foreground)]">Precio</th>
                <th className="px-6 py-4 font-bold text-[var(--color-foreground)]">Estado</th>
                <th className="px-6 py-4 font-bold text-[var(--color-foreground)] text-right">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-beige">
              {roomsList.map((room) => (
                <tr
                  key={room.id}
                  className="hover:bg-[var(--color-light)]/30 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-lg bg-[var(--color-background-soft)] mr-3 overflow-hidden flex-shrink-0">
                        {room.image_url ? (
                          <img
                            src={room.image_url}
                            alt={room.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[var(--color-muted-foreground)]">
                            <Layers size={20} />
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="font-medium text-[var(--color-foreground)]">{room.name}</div>
                        <div className="text-xs text-[var(--color-muted-foreground)]">
                          {room.theme}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-[var(--color-muted-foreground)]">
                    {room.capacity_min}-{room.capacity_max}
                  </td>
                  <td className="px-6 py-4 text-[var(--color-muted-foreground)]">
                    {room.duration_minutes} min
                  </td>
                  <td className="px-6 py-4 text-[var(--color-muted-foreground)]">
                    {room.price_per_person}€ / pers
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 text-xs rounded ${
                        room.is_active
                          ? "bg-green-500/10 text-green-500"
                          : "bg-[var(--color-light)] text-[var(--color-foreground)]"
                      }`}
                    >
                      {room.is_active ? "Activa" : "Inactiva"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link href={`/rooms/${room.id}`}>
                        <button
                          className="p-2 text-[var(--color-muted-foreground)] hover:text-primary transition-colors"
                          title="Editar"
                        >
                          <Edit size={18} />
                        </button>
                      </Link>
                      <button
                        className="p-2 text-[var(--color-muted-foreground)] hover:text-red-500 transition-colors"
                        title="Eliminar"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
