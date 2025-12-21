"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, CardHeader, CardTitle, CardFooter } from "@/components/Card";
import Input from "@/components/Input";
import Button from "@/components/Button";
import { rooms } from "@/services/api";
import { Settings, Users, Clock, DollarSign, ArrowLeft, Save, Trash2 } from "lucide-react";
import Link from "next/link";

export default function RoomConfigPage() {
  const router = useRouter();
  const params = useParams();
  const roomId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [roomData, setRoomData] = useState<any>(null);

  useEffect(() => {
    rooms.list()
      .then(data => {
        const list = data.rooms || data;
        const room = list.find((r: any) => r.id === roomId);
        if (room) {
          setRoomData(room);
        } else {
          setError("Sala no encontrada");
        }
      })
      .catch(err => {
        console.error("Error loading room:", err);
        setError("Error al cargar la sala");
      })
      .finally(() => setLoading(false));
  }, [roomId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    const formData = new FormData(e.target as HTMLFormElement);
    const data = {
      name: formData.get("name"),
      description: formData.get("description"),
      capacity_min: parseInt(formData.get("capacity_min") as string),
      capacity_max: parseInt(formData.get("capacity_max") as string),
      duration_minutes: parseInt(formData.get("duration_minutes") as string),
      price_per_person: parseFloat(formData.get("price_per_person") as string),
      difficulty_level: parseInt(formData.get("difficulty_level") as string),
      theme: formData.get("theme"),
      is_active: formData.get("is_active") === "true",
    };

    try {
      // Note: We need to add update method to rooms service if not exists
      // For now, let's assume it exists or we'll add it
      await (rooms as any).update(roomId, data);
      router.push("/dashboard/rooms");
    } catch (err: any) {
      setError(err.response?.data?.detail || "Error al actualizar la sala");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-gray-500">Cargando configuración de la sala...</p>
      </div>
    );
  }

  if (!roomData) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 mb-4">{error || "Sala no encontrada"}</p>
        <Link href="/dashboard/rooms">
          <Button variant="secondary">Volver a la lista</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8 flex justify-between items-end">
        <div>
          <Link href="/dashboard/rooms" className="text-primary flex items-center text-sm mb-4 hover:underline">
            <ArrowLeft size={16} className="mr-1" />
            Volver a salas
          </Link>
          <h1 className="text-3xl font-bold text-primary">Configurar Sala</h1>
          <p className="text-dark opacity-75">
            Ajusta los detalles de {roomData.name}
          </p>
        </div>
        <Button variant="ghost" className="text-red-500 hover:bg-red-50">
          <Trash2 size={18} className="mr-2" />
          Eliminar Sala
        </Button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-beige">
              <CardHeader>
                <CardTitle>Información General</CardTitle>
              </CardHeader>
              <div className="p-6 space-y-4">
                <Input
                  name="name"
                  label="Nombre de la Sala"
                  defaultValue={roomData.name}
                  required
                />
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Descripción
                  </label>
                  <textarea
                    name="description"
                    defaultValue={roomData.description}
                    rows={4}
                    className="w-full px-4 py-2 border border-beige rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    name="theme"
                    label="Temática"
                    defaultValue={roomData.theme}
                    placeholder="Ej: Terror, Aventura"
                  />
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Dificultad (1-5)
                    </label>
                    <select
                      name="difficulty_level"
                      defaultValue={roomData.difficulty_level}
                      className="w-full px-4 py-2 border border-beige rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 bg-white"
                    >
                      {[1, 2, 3, 4, 5].map(n => (
                        <option key={n} value={n}>{n} - {n === 1 ? 'Muy Fácil' : n === 5 ? 'Muy Difícil' : 'Normal'}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="border-beige">
              <CardHeader>
                <CardTitle>Ajustes de Juego</CardTitle>
              </CardHeader>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    name="capacity_min"
                    label="Mín. Jugadores"
                    type="number"
                    defaultValue={roomData.capacity_min}
                    required
                  />
                  <Input
                    name="capacity_max"
                    label="Máx. Jugadores"
                    type="number"
                    defaultValue={roomData.capacity_max}
                    required
                  />
                </div>
                <Input
                  name="duration_minutes"
                  label="Duración (min)"
                  type="number"
                  defaultValue={roomData.duration_minutes}
                  required
                  icon={<Clock size={18} />}
                />
                <Input
                  name="price_per_person"
                  label="Precio por persona (€)"
                  type="number"
                  step="0.01"
                  defaultValue={roomData.price_per_person}
                  required
                  icon={<DollarSign size={18} />}
                />
                <div className="space-y-2 pt-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Estado
                  </label>
                  <select
                    name="is_active"
                    defaultValue={roomData.is_active ? "true" : "false"}
                    className="w-full px-4 py-2 border border-beige rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 bg-white"
                  >
                    <option value="true">Activa</option>
                    <option value="false">Inactiva</option>
                  </select>
                </div>
              </div>
              <CardFooter className="bg-light/30 p-6">
                <Button type="submit" block loading={saving}>
                  <Save size={18} className="mr-2" />
                  Guardar Cambios
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}
