"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Input from "@/components/Input";
import Select from "@/components/Select";
import Button from "@/components/Button";
import { rooms } from "@/services/api";
import { ArrowLeft, Save } from "lucide-react";

export default function CreateRoomPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.target as HTMLFormElement);
    const data = {
      name: formData.get("name"),
      description: formData.get("description"),
      capacity_min: Number(formData.get("capacity_min")),
      capacity_max: Number(formData.get("capacity_max")),
      duration_minutes: Number(formData.get("duration_minutes")),
      price_per_person: Number(formData.get("price_per_person")),
      difficulty_level: Number(formData.get("difficulty_level")),
      theme: formData.get("theme"),
      color: formData.get("color"),
      is_active: true,
    };

    try {
      await rooms.create(data);
      router.push("/dashboard");
    } catch (err: any) {
      console.error("Error creating room:", err);
      const errorMessage = err.response?.data?.detail
        ? typeof err.response.data.detail === "string"
          ? err.response.data.detail
          : JSON.stringify(err.response.data.detail)
        : "Error al crear la sala";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="w-full p-6">
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Nueva Sala</h1>
          <p className="text-gray-600 mt-2">
            Configura los detalles de la nueva sala de escape.
          </p>
        </div>
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="flex items-center gap-2"
        >
          <ArrowLeft size={20} />
          Volver
        </Button>
      </header>

      <form
        onSubmit={handleSubmit}
        className="space-y-8 bg-[var(--color-background)] p-8 rounded-xl shadow-sm border border-gray-200"
      >
        {/* Información General */}
        <fieldset className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <legend className="text-xl font-semibold text-gray-800 mb-4 col-span-full border-b pb-2 w-full">
            Información General
          </legend>

          <div className="col-span-full md:col-span-1">
            <Input
              name="name"
              label="Nombre de la Sala"
              placeholder="Ej: La Cripta del Faraón"
              required
              className="w-full"
            />
          </div>

          <div className="col-span-full md:col-span-1 grid grid-cols-2 gap-4">
            <Input
              name="theme"
              label="Temática"
              placeholder="Ej: Terror"
              required
              className="w-full"
            />
            <div className="space-y-1">
              <label htmlFor="color" className="block text-sm font-medium text-gray-700">
                Color de Sala
              </label>
              <div className="flex gap-2">
                <input
                  type="color"
                  id="color"
                  name="color"
                  defaultValue="#3B82F6"
                  className="h-10 w-12 p-1 rounded border border-gray-300 cursor-pointer"
                />
                <input 
                  type="text"
                  name="color_text" 
                  placeholder="#3B82F6"
                  defaultValue="#3B82F6"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary sm:text-sm"
                  onChange={(e) => {
                    const val = e.target.value;
                    const colorInput = document.getElementById('color') as HTMLInputElement;
                    if (colorInput && /^#[0-9A-F]{6}$/i.test(val)) {
                      colorInput.value = val;
                    }
                  }}
                />
              </div>
            </div>
          </div>

          <div className="col-span-full">
            <label
              htmlFor="description"
              className="block mb-2 font-semibold text-dark"
            >
              Descripción
            </label>
            <textarea
              id="description"
              name="description"
              rows={4}
              className="w-full px-3 py-2 border-2 border-beige rounded-lg text-base focus:border-primary focus:ring-0 outline-none transition-colors resize-y bg-[var(--color-background)] text-dark"
              placeholder="Describe la historia y el ambiente de la sala..."
              required
            />
          </div>
        </fieldset>

        {/* Detalles Técnicos */}
        <fieldset className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <legend className="text-xl font-semibold text-gray-800 mb-4 col-span-full border-b pb-2 w-full">
            Detalles Técnicos
          </legend>

          <Input
            name="capacity_min"
            label="Capacidad Mínima"
            type="number"
            defaultValue="2"
            min="1"
            required
          />
          <Input
            name="capacity_max"
            label="Capacidad Máxima"
            type="number"
            defaultValue="6"
            min="1"
            required
          />
          <Select name="difficulty_level" label="Nivel de Dificultad">
            <option value="1">1 - Principiante</option>
            <option value="2">2 - Fácil</option>
            <option value="3">3 - Intermedio</option>
            <option value="4">4 - Difícil</option>
            <option value="5">5 - Experto</option>
          </Select>
        </fieldset>

        {/* Precios y Duración */}
        <fieldset className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <legend className="text-xl font-semibold text-gray-800 mb-4 col-span-full border-b pb-2 w-full">
            Configuración de Sesión
          </legend>

          <Input
            name="duration_minutes"
            label="Duración (minutos)"
            type="number"
            defaultValue="60"
            step="5"
            required
          />
          <Input
            name="price_per_person"
            label="Precio por Persona (€)"
            type="number"
            step="0.01"
            defaultValue="20.00"
            required
          />
        </fieldset>

        {error && (
          <div
            className="p-4 bg-red-50 text-red-700 rounded-lg border border-red-200"
            role="alert"
          >
            {error}
          </div>
        )}

        <div className="flex justify-end pt-6 border-t border-gray-100">
          <Button
            type="submit"
            loading={loading}
            className="flex items-center gap-2 px-8"
          >
            <Save size={20} />
            Guardar Sala
          </Button>
        </div>
      </form>
    </main>
  );
}
