import React, { useState } from "react";
import Button from "@/components/Button";
import Input from "@/components/Input";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { X } from "lucide-react";

interface Room {
  id: string;
  name: string;
}

interface BlockHoursModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: Date | null;
  rooms: Room[];
  onSave: (data: any) => Promise<void>;
}

export default function BlockHoursModal({
  isOpen,
  onClose,
  selectedDate,
  rooms,
  onSave,
}: BlockHoursModalProps) {
  const [loading, setLoading] = useState(false);
  const [roomId, setRoomId] = useState<string>("all");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("22:00");
  const [reason, setReason] = useState("Mantenimiento");
  const [recurrence, setRecurrence] = useState<"none" | "daily" | "weekly">("none");
  const [endRecurrence, setEndRecurrence] = useState("");

  if (!isOpen || !selectedDate) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave({
        date: format(selectedDate, "yyyy-MM-dd"),
        start_time: startTime,
        end_time: endTime,
        room_id: roomId === "all" ? null : roomId,
        reason,
        recurrence: recurrence === "none" ? null : recurrence,
        end_recurrence: endRecurrence || null,
      });
      onClose();
    } catch (error) {
      console.error("Error blocking hours", error);
      alert("Error al bloquear horas");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-[var(--color-background)] rounded-xl shadow-2xl w-full max-w-md border border-[var(--color-beige)] animate-in fade-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center p-4 border-b border-[var(--color-beige)]">
          <h3 className="text-lg font-bold text-[var(--color-foreground)]">
            Bloquear Horas - {format(selectedDate, "d MMMM yyyy", { locale: es })}
          </h3>
          <button onClick={onClose} className="text-gray-500 hover:text-red-500 transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Room Selection */}
          <div>
            <label className="block text-sm font-semibold mb-1 text-[var(--color-foreground)]">Sala afectada</label>
            <select
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              className="w-full px-3 py-2 border-2 border-[var(--color-beige)] rounded-lg bg-[var(--color-background)]"
            >
              <option value="all">Todas las salas</option>
              {rooms.map((room) => (
                <option key={room.id} value={room.id}>
                  {room.name}
                </option>
              ))}
            </select>
          </div>

          {/* Time Range */}
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Hora Inicio"
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              required
            />
            <Input
              label="Hora Fin"
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              required
            />
          </div>

          {/* Reason */}
          <Input
            label="Motivo"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Ej: Mantenimiento, Festivo..."
            required
          />

          {/* Recurrence */}
          <div className="border-t border-[var(--color-beige)] pt-4 mt-2">
            <label className="flex items-center gap-2 text-sm font-semibold mb-2">
              <input
                type="checkbox"
                checked={recurrence !== ("none" as string)}
                onChange={(e) => setRecurrence(e.target.checked ? "weekly" : "none")}
                className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary"
              />
              Repetir bloqueo
            </label>

            {recurrence !== "none" && (
              <div className="pl-6 space-y-3 animate-in slide-in-from-top-2">
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="radio"
                      name="recurrence"
                      value="daily"
                      checked={recurrence === "daily"}
                      onChange={() => setRecurrence("daily")}
                    />
                    Diariamente
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="radio"
                      name="recurrence"
                      value="weekly"
                      checked={recurrence === "weekly"}
                      onChange={() => setRecurrence("weekly")}
                    />
                    Semanalmente
                  </label>
                </div>
                
                <Input
                  label="Hasta fecha"
                  type="date"
                  value={endRecurrence}
                  onChange={(e) => setEndRecurrence(e.target.value)}
                  required
                />
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-4 justify-end">
            <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" loading={loading} variant="danger">
              Confirmar Bloqueo
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
