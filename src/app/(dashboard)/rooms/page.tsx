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
} from "lucide-react";

export default function RoomsPage() {
  const [roomsList, setRoomsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    rooms
      .list()
      .then((data) => setRoomsList(data.rooms || data))
      .catch((err) => {
        console.error("Failed to load rooms:", err);
        setRoomsList([]);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-primary">Salas</h1>
          <p className="text-dark opacity-75">
            {roomsList.length} {roomsList.length === 1 ? "sala" : "salas"}
          </p>
        </div>
        <Link href="/rooms/create">
          <Button>
            <Layers size={20} className="mr-2" />
            Nueva Sala
          </Button>
        </Link>
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-gray-500">Cargando salas...</p>
        </div>
      ) : roomsList.length === 0 ? (
        <Card className="text-center py-12">
          <Layers className="mx-auto text-gray-400 mb-4" size={48} />
          <h3 className="text-xl font-bold text-dark mb-2">
            No hay salas todavía
          </h3>
          <p className="text-gray-600 mb-6">
            Crea tu primera sala para empezar a recibir reservas
          </p>
          <Link href="/rooms/create">
            <Button>Crear Sala</Button>
          </Link>
        </Card>
      ) : (
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
                  <span className="bg-white/20 px-2 py-1 rounded text-xs">
                    {room.pending_bookings_count || 0} pendientes
                  </span>
                </div>

                <div className="flex-1 space-y-3 overflow-y-auto">
                  {room.next_bookings && room.next_bookings.length > 0 ? (
                    room.next_bookings.map((booking: any) => (
                      <div
                        key={booking.id}
                        className="bg-white/10 p-2 rounded text-sm"
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
                      className="bg-white text-primary hover:bg-white/90"
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
                  <h3 className="font-bold text-lg text-dark">{room.name}</h3>
                  <span
                    className={`px-2 py-1 text-xs rounded ${
                      room.is_active
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {room.is_active ? "Activa" : "Inactiva"}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                  {room.description}
                </p>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center text-gray-600">
                  <Users size={16} className="mr-2" />
                  {room.capacity_min}-{room.capacity_max} jugadores
                </div>
                <div className="flex items-center text-gray-600">
                  <Clock size={16} className="mr-2" />
                  {room.duration_minutes} minutos
                </div>
                <div className="flex items-center text-gray-600">
                  <DollarSign size={16} className="mr-2" />
                  {room.price_per_person}€ por persona
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-beige">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Dificultad</span>
                  <div className="flex space-x-1">
                    {[1, 2, 3, 4, 5].map((level) => (
                      <div
                        key={level}
                        className={`w-2 h-2 rounded-full ${
                          level <= room.difficulty_level
                            ? "bg-primary"
                            : "bg-gray-200"
                        }`}
                      />
                    ))}
                  </div>
                </div>
                {room.theme && (
                  <span className="inline-block mt-2 px-2 py-1 text-xs bg-light rounded">
                    {room.theme}
                  </span>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
