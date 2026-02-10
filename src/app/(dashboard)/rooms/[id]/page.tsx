"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, CardHeader, CardTitle, CardFooter } from "@/components/Card";
import Input from "@/components/Input";
import Button from "@/components/Button";
import { rooms, dashboard, roomExtras } from "@/services/api";
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
  Calendar,
  CalendarDays,
  Search,
  Ban,
  Tag,
  Package,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

const DAYS = [
  { key: "monday", label: "Lunes" },
  { key: "tuesday", label: "Martes" },
  { key: "wednesday", label: "Miércoles" },
  { key: "thursday", label: "Jueves" },
  { key: "friday", label: "Viernes" },
  { key: "saturday", label: "Sábado" },
  { key: "sunday", label: "Domingo" },
];

type TabKey = "general" | "horarios" | "disponibilidad" | "precios" | "extras" | "cancelacion";

export default function RoomConfigPage() {
  const router = useRouter();
  const params = useParams();
  const roomId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [roomData, setRoomData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<TabKey>("general");

  // Custom Fields State
  const [customFields, setCustomFields] = useState<
    { id: string; label: string; type: string }[]
  >([]);
  const [newFieldLabel, setNewFieldLabel] = useState("");

  // Schedule State
  const [schedule, setSchedule] = useState<Record<string, { is_open: boolean; open_time: string; close_time: string }>>(
    Object.fromEntries(DAYS.map(d => [d.key, { is_open: true, open_time: "10:00", close_time: "22:00" }]))
  );
  const [savingSchedule, setSavingSchedule] = useState(false);

  // Availability State
  const [checkDate, setCheckDate] = useState(() => {
    const d = new Date();
    return d.toISOString().split("T")[0];
  });
  const [numPeople, setNumPeople] = useState(2);
  const [availableSlots, setAvailableSlots] = useState<any[]>([]);
  const [checkingAvailability, setCheckingAvailability] = useState(false);

  // Block Hours State
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [blockData, setBlockData] = useState({ date: "", start_time: "10:00", end_time: "12:00", reason: "" });

  // Dynamic Pricing State
  const [pricingRules, setPricingRules] = useState<any[]>([]);
  const [newPricing, setNewPricing] = useState({ name: "", day_of_week: "", price_modifier: 1.0, start_date: "", end_date: "" });
  const [loadingPricing, setLoadingPricing] = useState(false);

  // Extras State
  const [extras, setExtras] = useState<any[]>([]);
  const [newExtra, setNewExtra] = useState({ name: "", description: "", price: 0, is_per_person: false });
  const [loadingExtras, setLoadingExtras] = useState(false);

  // Cancellation Policy State
  const [cancellationPolicy, setCancellationPolicy] = useState({ hours_before: 24, refund_percentage: 100, no_show_fee: 0 });
  const [savingPolicy, setSavingPolicy] = useState(false);

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

  // Load pricing, extras, cancellation for the room
  useEffect(() => {
    if (!roomId) return;
    // Pricing
    roomExtras.getPricing(roomId).then(data => {
      setPricingRules(Array.isArray(data) ? data : data.pricing || []);
    }).catch(() => {});
    // Extras
    roomExtras.list(roomId).then(data => {
      setExtras(Array.isArray(data) ? data : data.extras || []);
    }).catch(() => {});
    // Cancellation
    roomExtras.getCancellationPolicy(roomId).then(data => {
      if (data) setCancellationPolicy(data);
    }).catch(() => {});
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

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-beige overflow-x-auto">
        {([
          { key: "general" as TabKey, label: "General", icon: <Settings size={16} /> },
          { key: "horarios" as TabKey, label: "Horarios", icon: <Calendar size={16} /> },
          { key: "disponibilidad" as TabKey, label: "Disponibilidad", icon: <CalendarDays size={16} /> },
          { key: "precios" as TabKey, label: "Precios", icon: <Tag size={16} /> },
          { key: "extras" as TabKey, label: "Extras", icon: <Package size={16} /> },
          { key: "cancelacion" as TabKey, label: "Cancelación", icon: <ShieldCheck size={16} /> },
        ]).map(tab => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.key
                ? "border-primary text-primary"
                : "border-transparent text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]"
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Tab: General */}
      {activeTab === "general" && (
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
                <div className="space-y-2 pt-2">
                  <label className="block text-sm font-medium text-[var(--color-foreground)]">
                    Estado
                  </label>
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
                      helpText="Este ID es configurado por el administrador maestro y se utiliza para sincronizar la disponibilidad con ER Director."
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
      )}

      {/* Tab: Horarios */}
      {activeTab === "horarios" && (
        <div className="space-y-6">
          <Card className="border-beige">
            <CardHeader>
              <CardTitle>Horario Semanal</CardTitle>
            </CardHeader>
            <div className="p-6">
              <p className="text-sm text-[var(--color-muted-foreground)] mb-6">
                Configura los horarios de apertura y cierre para cada día de la semana.
              </p>
              <div className="space-y-3">
                {DAYS.map(day => (
                  <div key={day.key} className="flex items-center gap-4 p-3 rounded-lg border border-beige bg-[var(--color-light)]/20">
                    <label className="flex items-center gap-2 w-32 shrink-0">
                      <input
                        type="checkbox"
                        checked={schedule[day.key].is_open}
                        onChange={e => setSchedule(prev => ({
                          ...prev,
                          [day.key]: { ...prev[day.key], is_open: e.target.checked }
                        }))}
                        className="rounded border-beige"
                      />
                      <span className="text-sm font-medium">{day.label}</span>
                    </label>
                    {schedule[day.key].is_open ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="time"
                          value={schedule[day.key].open_time}
                          onChange={e => setSchedule(prev => ({
                            ...prev,
                            [day.key]: { ...prev[day.key], open_time: e.target.value }
                          }))}
                          className="px-3 py-1.5 border border-beige rounded-lg text-sm"
                        />
                        <span className="text-[var(--color-muted-foreground)]">a</span>
                        <input
                          type="time"
                          value={schedule[day.key].close_time}
                          onChange={e => setSchedule(prev => ({
                            ...prev,
                            [day.key]: { ...prev[day.key], close_time: e.target.value }
                          }))}
                          className="px-3 py-1.5 border border-beige rounded-lg text-sm"
                        />
                      </div>
                    ) : (
                      <span className="text-sm text-[var(--color-muted-foreground)] italic">Cerrado</span>
                    )}
                  </div>
                ))}
              </div>
              <div className="mt-6 flex justify-end">
                <Button
                  type="button"
                  loading={savingSchedule}
                  onClick={async () => {
                    setSavingSchedule(true);
                    try {
                      await rooms.createSchedule(roomId, { schedule });
                      toast.success("Horario guardado correctamente");
                    } catch {
                      toast.error("Error al guardar el horario");
                    } finally {
                      setSavingSchedule(false);
                    }
                  }}
                >
                  <Save size={18} className="mr-2" />
                  Guardar Horario
                </Button>
              </div>
            </div>
          </Card>

          {/* Block Hours */}
          <Card className="border-beige">
            <CardHeader>
              <CardTitle>Bloquear Horarios</CardTitle>
            </CardHeader>
            <div className="p-6">
              <p className="text-sm text-[var(--color-muted-foreground)] mb-4">
                Bloquea franjas horarias para mantenimiento, eventos privados o cualquier otra razón.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-[var(--color-muted-foreground)]">Fecha</label>
                  <input
                    type="date"
                    value={blockData.date}
                    onChange={e => setBlockData(prev => ({ ...prev, date: e.target.value }))}
                    className="w-full px-3 py-2 border border-beige rounded-lg text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-[var(--color-muted-foreground)]">Desde</label>
                  <input
                    type="time"
                    value={blockData.start_time}
                    onChange={e => setBlockData(prev => ({ ...prev, start_time: e.target.value }))}
                    className="w-full px-3 py-2 border border-beige rounded-lg text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-[var(--color-muted-foreground)]">Hasta</label>
                  <input
                    type="time"
                    value={blockData.end_time}
                    onChange={e => setBlockData(prev => ({ ...prev, end_time: e.target.value }))}
                    className="w-full px-3 py-2 border border-beige rounded-lg text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-[var(--color-muted-foreground)]">Motivo</label>
                  <input
                    type="text"
                    value={blockData.reason}
                    onChange={e => setBlockData(prev => ({ ...prev, reason: e.target.value }))}
                    placeholder="Ej: Mantenimiento"
                    className="w-full px-3 py-2 border border-beige rounded-lg text-sm"
                  />
                </div>
              </div>
              <Button
                type="button"
                variant="secondary"
                onClick={async () => {
                  if (!blockData.date) { toast.error("Selecciona una fecha"); return; }
                  try {
                    await dashboard.blockHours({ ...blockData, room_id: roomId });
                    toast.success("Horario bloqueado correctamente");
                    setBlockData({ date: "", start_time: "10:00", end_time: "12:00", reason: "" });
                  } catch {
                    toast.error("Error al bloquear horario");
                  }
                }}
              >
                <Ban size={16} className="mr-2" />
                Bloquear Franja
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Tab: Disponibilidad */}
      {activeTab === "disponibilidad" && (
        <div className="space-y-6">
          <Card className="border-beige">
            <CardHeader>
              <CardTitle>Consultar Disponibilidad</CardTitle>
            </CardHeader>
            <div className="p-6">
              <p className="text-sm text-[var(--color-muted-foreground)] mb-4">
                Consulta las franjas horarias disponibles para una fecha y número de jugadores.
              </p>
              <div className="flex flex-wrap gap-4 mb-6">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-[var(--color-muted-foreground)]">Fecha</label>
                  <input
                    type="date"
                    value={checkDate}
                    onChange={e => setCheckDate(e.target.value)}
                    className="px-3 py-2 border border-beige rounded-lg text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-[var(--color-muted-foreground)]">Jugadores</label>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    value={numPeople}
                    onChange={e => setNumPeople(parseInt(e.target.value) || 1)}
                    className="w-24 px-3 py-2 border border-beige rounded-lg text-sm"
                  />
                </div>
                <div className="flex items-end">
                  <Button
                    type="button"
                    loading={checkingAvailability}
                    onClick={async () => {
                      setCheckingAvailability(true);
                      try {
                        const res = await rooms.getAvailability(roomId, checkDate, numPeople);
                        const slots = Array.isArray(res) ? res : res.slots || res.available_slots || [];
                        setAvailableSlots(slots);
                        if (slots.length === 0) toast.info("No hay franjas disponibles para esa fecha");
                      } catch {
                        toast.error("Error al consultar disponibilidad");
                      } finally {
                        setCheckingAvailability(false);
                      }
                    }}
                  >
                    <Search size={16} className="mr-2" />
                    Consultar
                  </Button>
                </div>
              </div>

              {availableSlots.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold mb-3">Franjas Disponibles</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                    {availableSlots.map((slot: any, idx: number) => (
                      <div
                        key={idx}
                        className={`text-center px-3 py-2 rounded-lg border text-sm ${
                          slot.available !== false
                            ? "border-green-200 bg-green-50 text-green-700"
                            : "border-red-200 bg-red-50 text-red-500 line-through"
                        }`}
                      >
                        {slot.time || slot.start_time || slot}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>
      )}

      {/* Tab: Precios Dinámicos */}
      {activeTab === "precios" && (
        <div className="space-y-6">
          <Card className="border-beige">
            <CardHeader>
              <CardTitle>Reglas de Precio</CardTitle>
            </CardHeader>
            <div className="p-6">
              <p className="text-sm text-[var(--color-muted-foreground)] mb-4">
                Configura modificadores de precio para días específicos, temporadas o eventos.
              </p>

              {/* Existing rules */}
              {pricingRules.length > 0 && (
                <div className="space-y-2 mb-6">
                  {pricingRules.map((rule: any, idx: number) => (
                    <div key={rule.id || idx} className="flex items-center justify-between p-3 border border-beige rounded-lg bg-[var(--color-light)]/20">
                      <div>
                        <span className="font-medium text-[var(--color-foreground)]">{rule.name}</span>
                        {rule.day_of_week && <span className="text-sm text-[var(--color-muted-foreground)] ml-2">({rule.day_of_week})</span>}
                        {rule.start_date && <span className="text-xs text-[var(--color-muted-foreground)] ml-2">{rule.start_date} - {rule.end_date}</span>}
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`font-bold ${rule.price_modifier > 1 ? "text-red-500" : rule.price_modifier < 1 ? "text-green-600" : "text-[var(--color-foreground)]"}`}>
                          {rule.price_modifier > 1 ? "+" : ""}{((rule.price_modifier - 1) * 100).toFixed(0)}%
                        </span>
                        <button
                          onClick={async () => {
                            try {
                              await roomExtras.deletePricing(rule.id);
                              setPricingRules(prev => prev.filter(r => r.id !== rule.id));
                              toast.success("Regla eliminada");
                            } catch { toast.error("Error al eliminar"); }
                          }}
                          className="text-red-400 hover:text-red-600"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Add new rule */}
              <div className="border border-dashed border-beige rounded-lg p-4">
                <h4 className="text-sm font-semibold mb-3">Nueva Regla</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-3">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-[var(--color-muted-foreground)]">Nombre</label>
                    <input
                      type="text"
                      value={newPricing.name}
                      onChange={e => setNewPricing(p => ({ ...p, name: e.target.value }))}
                      placeholder="Ej: Fin de semana"
                      className="w-full px-3 py-2 border border-beige rounded-lg text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-[var(--color-muted-foreground)]">Día de la semana (opcional)</label>
                    <select
                      value={newPricing.day_of_week}
                      onChange={e => setNewPricing(p => ({ ...p, day_of_week: e.target.value }))}
                      className="w-full px-3 py-2 border border-beige rounded-lg text-sm bg-[var(--color-background)]"
                    >
                      <option value="">Todos</option>
                      {DAYS.map(d => <option key={d.key} value={d.key}>{d.label}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-[var(--color-muted-foreground)]">Modificador de precio</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="range"
                        min={0.5}
                        max={2.0}
                        step={0.05}
                        value={newPricing.price_modifier}
                        onChange={e => setNewPricing(p => ({ ...p, price_modifier: parseFloat(e.target.value) }))}
                        className="flex-1"
                      />
                      <span className="text-sm font-bold w-14 text-right">
                        {newPricing.price_modifier > 1 ? "+" : ""}{((newPricing.price_modifier - 1) * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-[var(--color-muted-foreground)]">Fecha inicio (opcional)</label>
                    <input type="date" value={newPricing.start_date} onChange={e => setNewPricing(p => ({ ...p, start_date: e.target.value }))} className="w-full px-3 py-2 border border-beige rounded-lg text-sm" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-[var(--color-muted-foreground)]">Fecha fin (opcional)</label>
                    <input type="date" value={newPricing.end_date} onChange={e => setNewPricing(p => ({ ...p, end_date: e.target.value }))} className="w-full px-3 py-2 border border-beige rounded-lg text-sm" />
                  </div>
                </div>
                <Button
                  type="button"
                  loading={loadingPricing}
                  onClick={async () => {
                    if (!newPricing.name) { toast.error("Indica un nombre para la regla"); return; }
                    setLoadingPricing(true);
                    try {
                      const created = await roomExtras.createPricing(roomId, newPricing);
                      setPricingRules(prev => [...prev, created]);
                      setNewPricing({ name: "", day_of_week: "", price_modifier: 1.0, start_date: "", end_date: "" });
                      toast.success("Regla de precio creada");
                    } catch { toast.error("Error al crear la regla"); }
                    finally { setLoadingPricing(false); }
                  }}
                >
                  <Plus size={16} className="mr-2" />
                  Añadir Regla
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Tab: Extras */}
      {activeTab === "extras" && (
        <div className="space-y-6">
          <Card className="border-beige">
            <CardHeader>
              <CardTitle>Extras de Sala</CardTitle>
            </CardHeader>
            <div className="p-6">
              <p className="text-sm text-[var(--color-muted-foreground)] mb-4">
                Ofrece complementos opcionales que los clientes pueden añadir a su reserva.
              </p>

              {/* Existing extras */}
              {extras.length > 0 && (
                <div className="space-y-2 mb-6">
                  {extras.map((extra: any, idx: number) => (
                    <div key={extra.id || idx} className="flex items-center justify-between p-3 border border-beige rounded-lg bg-[var(--color-light)]/20">
                      <div>
                        <span className="font-medium text-[var(--color-foreground)]">{extra.name}</span>
                        <span className="text-sm text-[var(--color-muted-foreground)] ml-2">{extra.description}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-primary">{extra.price}€{extra.is_per_person ? "/pers." : ""}</span>
                        <button
                          onClick={async () => {
                            try {
                              await roomExtras.delete(extra.id);
                              setExtras(prev => prev.filter(e => e.id !== extra.id));
                              toast.success("Extra eliminado");
                            } catch { toast.error("Error al eliminar"); }
                          }}
                          className="text-red-400 hover:text-red-600"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {extras.length === 0 && (
                <p className="text-sm text-[var(--color-muted-foreground)] italic text-center py-4 mb-4">No hay extras configurados</p>
              )}

              {/* Add new extra */}
              <div className="border border-dashed border-beige rounded-lg p-4">
                <h4 className="text-sm font-semibold mb-3">Nuevo Extra</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-[var(--color-muted-foreground)]">Nombre</label>
                    <input type="text" value={newExtra.name} onChange={e => setNewExtra(p => ({ ...p, name: e.target.value }))} placeholder="Ej: Fotos del grupo" className="w-full px-3 py-2 border border-beige rounded-lg text-sm" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-[var(--color-muted-foreground)]">Descripción</label>
                    <input type="text" value={newExtra.description} onChange={e => setNewExtra(p => ({ ...p, description: e.target.value }))} placeholder="Breve descripción" className="w-full px-3 py-2 border border-beige rounded-lg text-sm" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-[var(--color-muted-foreground)]">Precio (€)</label>
                    <input type="number" min={0} step={0.5} value={newExtra.price} onChange={e => setNewExtra(p => ({ ...p, price: parseFloat(e.target.value) || 0 }))} className="w-full px-3 py-2 border border-beige rounded-lg text-sm" />
                  </div>
                  <div className="flex items-end gap-2">
                    <label className="flex items-center gap-2 text-sm">
                      <input type="checkbox" checked={newExtra.is_per_person} onChange={e => setNewExtra(p => ({ ...p, is_per_person: e.target.checked }))} />
                      Por persona
                    </label>
                  </div>
                </div>
                <Button
                  type="button"
                  loading={loadingExtras}
                  onClick={async () => {
                    if (!newExtra.name) { toast.error("Indica un nombre"); return; }
                    setLoadingExtras(true);
                    try {
                      const created = await roomExtras.create(roomId, newExtra);
                      setExtras(prev => [...prev, created]);
                      setNewExtra({ name: "", description: "", price: 0, is_per_person: false });
                      toast.success("Extra creado");
                    } catch { toast.error("Error al crear el extra"); }
                    finally { setLoadingExtras(false); }
                  }}
                >
                  <Plus size={16} className="mr-2" />
                  Añadir Extra
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Tab: Política de Cancelación */}
      {activeTab === "cancelacion" && (
        <div className="space-y-6">
          <Card className="border-beige">
            <CardHeader>
              <CardTitle>Política de Cancelación</CardTitle>
            </CardHeader>
            <div className="p-6">
              <p className="text-sm text-[var(--color-muted-foreground)] mb-6">
                Define las condiciones de cancelación y reembolso para esta sala.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[var(--color-foreground)]">Horas de antelación mínima</label>
                  <input
                    type="number"
                    min={0}
                    value={cancellationPolicy.hours_before}
                    onChange={e => setCancellationPolicy(p => ({ ...p, hours_before: parseInt(e.target.value) || 0 }))}
                    className="w-full px-4 py-2 border border-beige rounded-lg"
                  />
                  <p className="text-xs text-[var(--color-muted-foreground)]">Cancelaciones con menos de estas horas no obtendrán reembolso</p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[var(--color-foreground)]">Porcentaje de reembolso (%)</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={cancellationPolicy.refund_percentage}
                    onChange={e => setCancellationPolicy(p => ({ ...p, refund_percentage: parseInt(e.target.value) || 0 }))}
                    className="w-full px-4 py-2 border border-beige rounded-lg"
                  />
                  <p className="text-xs text-[var(--color-muted-foreground)]">Porcentaje devuelto si se cancela a tiempo</p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[var(--color-foreground)]">Cargo por no-show (€)</label>
                  <input
                    type="number"
                    min={0}
                    step={0.5}
                    value={cancellationPolicy.no_show_fee}
                    onChange={e => setCancellationPolicy(p => ({ ...p, no_show_fee: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-4 py-2 border border-beige rounded-lg"
                  />
                  <p className="text-xs text-[var(--color-muted-foreground)]">Cargo adicional cuando el cliente no se presenta</p>
                </div>
              </div>

              {/* Preview */}
              <div className="bg-[var(--color-light)]/30 border border-beige rounded-lg p-4 mb-6">
                <h4 className="text-sm font-semibold mb-2">Vista previa de la política</h4>
                <p className="text-sm text-[var(--color-foreground)]">
                  Cancelaciones realizadas con al menos <strong>{cancellationPolicy.hours_before} horas</strong> de antelación recibirán un reembolso del <strong>{cancellationPolicy.refund_percentage}%</strong>.
                  {cancellationPolicy.no_show_fee > 0 && (
                    <> En caso de no-show, se aplicará un cargo de <strong>{cancellationPolicy.no_show_fee}€</strong>.</>
                  )}
                </p>
              </div>

              <div className="flex justify-end">
                <Button
                  type="button"
                  loading={savingPolicy}
                  onClick={async () => {
                    setSavingPolicy(true);
                    try {
                      await roomExtras.updateCancellationPolicy(roomId, cancellationPolicy);
                      toast.success("Política de cancelación guardada");
                    } catch { toast.error("Error al guardar la política"); }
                    finally { setSavingPolicy(false); }
                  }}
                >
                  <Save size={18} className="mr-2" />
                  Guardar Política
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
