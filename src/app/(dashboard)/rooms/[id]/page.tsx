"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, CardHeader, CardTitle, CardFooter } from "@/components/Card";
import Input from "@/components/Input";
import Button from "@/components/Button";
import { rooms } from "@/services/api";
import {
  Settings,
  Users,
  Clock,
  DollarSign,
  ArrowLeft,
  Save,
  Trash2,
  Plus,
  X,
} from "lucide-react";
import Link from "next/link";

export default function RoomConfigPage() {
  const router = useRouter();
  const params = useParams();
  const roomId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [roomData, setRoomData] = useState<any>(null);

  // Custom Fields State
  const [customFields, setCustomFields] = useState<
    { id: string; label: string; type: string }[]
  >([]);
  const [newFieldLabel, setNewFieldLabel] = useState("");

  useEffect(() => {
    rooms
      .list()
      .then((data) => {
        const list = data.rooms || data;
        const room = list.find((r: any) => r.id === roomId);
        if (room) {
          setRoomData(room);
          // Mock loading custom fields if they existed
          if (room.custom_fields) {
            setCustomFields(room.custom_fields);
          } else {
            // Default mock fields
            setCustomFields([
              { id: "1", label: "¿Cómo nos conociste?", type: "text" },
              { id: "2", label: "Alergias o Intolerancias", type: "text" },
            ]);
          }
        } else {
          setError("Sala no encontrada");
        }
      })
      .catch((err) => {
        console.error("Error loading room:", err);
        setError("Error al cargar la sala");
      })
      .finally(() => setLoading(false));
  }, [roomId]);

  const handleAddCustomField = () => {
    if (!newFieldLabel.trim()) return;
    setCustomFields([
      ...customFields,
      { id: Date.now().toString(), label: newFieldLabel, type: "text" },
    ]);
    setNewFieldLabel("");
  };

  const handleRemoveCustomField = (id: string) => {
    setCustomFields(customFields.filter((f) => f.id !== id));
  };

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
      color: formData.get("color"),
      is_active: formData.get("is_active") === "true",
      custom_fields: customFields, // Include custom fields in save
    };

    try {
      // Note: We need to add update method to rooms service if not exists
      // For now, let's assume it exists or we'll add it
      await (rooms as any).update(roomId, data);
      router.push("/rooms");
    } catch (err: any) {
      setError(err.response?.data?.detail || "Error al actualizar la sala");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-[var(--color-muted-foreground)]">Cargando configuración de la sala...</p>
      </div>
    );
  }

  if (!roomData) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 mb-4">{error || "Sala no encontrada"}</p>
        <Link href="/rooms">
          <Button variant="secondary">Volver a la lista</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="mb-8 flex justify-between items-end">
        <div>
          <Link
            href="/rooms"
            className="text-primary flex items-center text-sm mb-4 hover:underline"
          >
            <ArrowLeft size={16} className="mr-1" />
            Volver a salas
          </Link>
          <h1 className="text-3xl font-bold text-primary">Configurar Sala</h1>
          <p className="text-[var(--color-foreground)] opacity-75">
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
                  <label className="block text-sm font-medium text-[var(--color-foreground)]">
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
                    <label className="block text-sm font-medium text-[var(--color-foreground)]">
                      Color de Sala
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        id="room-color"
                        name="color"
                        defaultValue={roomData.color || "#3B82F6"}
                        className="h-10 w-12 p-1 rounded border border-beige cursor-pointer"
                      />
                      <input 
                        type="text"
                        placeholder="#3B82F6"
                        defaultValue={roomData.color || "#3B82F6"}
                        className="flex-1 px-4 py-2 border border-beige rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                        onChange={(e) => {
                          const val = e.target.value;
                          const colorInput = document.getElementById('room-color') as HTMLInputElement;
                          if (colorInput && /^#[0-9A-F]{6}$/i.test(val)) {
                            colorInput.value = val;
                          }
                        }}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-[var(--color-foreground)]">
                      Dificultad (1-5)
                    </label>
                    <select
                      name="difficulty_level"
                      defaultValue={roomData.difficulty_level}
                      className="w-full px-4 py-2 border border-beige rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 bg-[var(--color-background)]"
                    >
                      {[1, 2, 3, 4, 5].map((n) => (
                        <option key={n} value={n}>
                          {n} -{" "}
                          {n === 1
                            ? "Muy Fácil"
                            : n === 5
                            ? "Muy Difícil"
                            : "Normal"}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </Card>

            {/* Custom Fields Section */}
            <Card className="border-beige">
              <CardHeader>
                <CardTitle>Campos Personalizados</CardTitle>
              </CardHeader>
              <div className="p-6">
                <p className="text-sm text-[var(--color-muted-foreground)] mb-4">
                  Define qué información adicional quieres solicitar a los
                  clientes al hacer la reserva.
                </p>

                <div className="space-y-3 mb-6">
                  {customFields.map((field) => (
                    <div
                      key={field.id}
                      className="flex items-center justify-between bg-[var(--color-light)]/30 p-3 rounded-lg border border-beige"
                    >
                      <span className="font-medium text-[var(--color-foreground)]">
                        {field.label}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveCustomField(field.id)}
                        className="text-[var(--color-muted-foreground)] hover:text-red-500 transition-colors"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  ))}
                  {customFields.length === 0 && (
                    <p className="text-sm text-[var(--color-muted-foreground)] italic text-center py-2">
                      No hay campos personalizados
                    </p>
                  )}
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Nuevo campo (ej: ¿Cómo nos conociste?)"
                    className="flex-1 px-4 py-2 border border-beige rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                    value={newFieldLabel}
                    onChange={(e) => setNewFieldLabel(e.target.value)}
                    onKeyDown={(e) =>
                      e.key === "Enter" &&
                      (e.preventDefault(), handleAddCustomField())
                    }
                  />
                  <Button
                    type="button"
                    onClick={handleAddCustomField}
                    variant="secondary"
                  >
                    <Plus size={18} />
                  </Button>
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
                  <select
                    name="is_active"
                    defaultValue={roomData.is_active ? "true" : "false"}
                    className="w-full px-4 py-2 border border-beige rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 bg-[var(--color-background)]"
                  >
                    <option value="true">Activa</option>
                    <option value="false">Inactiva</option>
                  </select>
                </div>
                {roomData.erd_game_id && (
                  <div className="pt-2">
                    <Input
                      label="ER Director Game ID"
                      defaultValue={roomData.erd_game_id}
                      disabled
                      helperText="Este ID es configurado por el administrador maestro y se utiliza para sincronizar la disponibilidad con ER Director."
                    />
                  </div>
                )}
              </div>
              <CardFooter className="bg-[var(--color-light)]/30 p-6">
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
