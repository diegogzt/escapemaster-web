"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/Card";
import Button from "@/components/Button";
import { rooms } from "@/services/api";
import { Layers, Users, Clock, DollarSign } from "lucide-react";

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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-gray-500">Cargando salas...</p>
      </div>
    );
  }

  if (roomsList.length === 0) {
    return (
      <div>
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-primary">Salas</h1>
            <p className="text-dark opacity-75">Gestiona tus escape rooms</p>
          </div>
        </div>

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
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-primary">Salas</h1>
          <p className="text-dark opacity-75">
            {roomsList.length} {roomsList.length === 1 ? "sala" : "salas"}
          </p>
        </div>
        <Link href="/dashboard/rooms/create">
          <Button>
            <Layers size={20} className="mr-2" />
            Nueva Sala
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {roomsList.map((room) => (
          <Card key={room.id} className="hover:shadow-lg transition-shadow">
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
    </div>
  );
}
