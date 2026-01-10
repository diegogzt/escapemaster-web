"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, CardHeader, CardTitle, CardFooter } from "@/components/Card";
import Input from "@/components/Input";
import Button from "@/components/Button";
import { users, roles } from "@/services/api";
import { Shield, Mail, User, ArrowLeft, CheckCircle, Lock } from "lucide-react";
import Link from "next/link";

export default function EditUserPage() {
  const router = useRouter();
  const params = useParams();
  const userId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [rolesList, setRolesList] = useState<any[]>([]);
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [rolesData, userDetails] = await Promise.all([
          roles.list(),
          users.get(userId),
        ]);
        setRolesList(rolesData.roles || rolesData);
        setUserData(userDetails);
      } catch (err) {
        console.error("Error loading data:", err);
        setError("No se pudo cargar la información del usuario");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    const formData = new FormData(e.target as HTMLFormElement);
    const data = {
      full_name: formData.get("full_name"),
      email: formData.get("email"),
      role_id: formData.get("role_id"),
      is_active: formData.get("is_active") === "true",
      target_hours: parseFloat(formData.get("target_hours") as string) || 0,
      hourly_rate: parseFloat(formData.get("hourly_rate") as string) || 0,
      vacation_days_total: parseInt(formData.get("vacation_days_total") as string) || 0,
    };

    try {
      await users.update(userId, data);
      router.push("/users");
    } catch (err: any) {
      setError(err.response?.data?.detail || "Error al actualizar el usuario");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-gray-500">Cargando información del usuario...</p>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 mb-4">{error || "Usuario no encontrado"}</p>
        <Link href="/users">
          <Button variant="secondary">Volver a la lista</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="mb-8">
        <Link
          href="/users"
          className="text-primary flex items-center text-sm mb-4 hover:underline"
        >
          <ArrowLeft size={16} className="mr-1" />
          Volver a usuarios
        </Link>
        <h1 className="text-3xl font-bold text-primary">Editar Usuario</h1>
        <p className="text-dark opacity-75">
          Modifica los datos y permisos de{" "}
          {userData.full_name || userData.email}
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card className="border-beige">
          <CardHeader>
            <CardTitle className="flex items-center">
              <User size={20} className="mr-2 text-primary" />
              Información del Usuario
            </CardTitle>
          </CardHeader>

          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                name="full_name"
                label="Nombre Completo"
                defaultValue={userData.full_name}
                placeholder="Ej: Juan Pérez"
                required
                icon={<User size={18} />}
              />
              <Input
                name="email"
                label="Correo Electrónico"
                type="email"
                defaultValue={userData.email}
                placeholder="ejemplo@correo.com"
                required
                icon={<Mail size={18} />}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Rol del Sistema
                </label>
                <div className="relative">
                  <Shield
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    size={18}
                  />
                  <select
                    name="role_id"
                    defaultValue={userData.role_id}
                    className="w-full pl-10 pr-4 py-2 border border-beige rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 bg-[var(--color-background)] appearance-none"
                    required
                  >
                    <option value="">Selecciona un rol</option>
                    {rolesList.map((role) => (
                      <option key={role.id} value={role.id}>
                        {role.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Estado de la Cuenta
                </label>
                <div className="relative">
                  <CheckCircle
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    size={18}
                  />
                  <select
                    name="is_active"
                    defaultValue={userData.is_active ? "true" : "false"}
                    className="w-full pl-10 pr-4 py-2 border border-beige rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 bg-[var(--color-background)] appearance-none"
                    required
                  >
                    <option value="true">Activo</option>
                    <option value="false">Inactivo</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-beige">
              <h3 className="text-lg font-bold text-dark mb-4 flex items-center">
                <Lock size={20} className="mr-2 text-accent" />
                Configuración de Horas y Salario
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Input
                  name="target_hours"
                  label="Horas Mensuales"
                  type="number"
                  step="0.5"
                  defaultValue={userData.target_hours}
                  placeholder="Ej: 160"
                />
                <Input
                  name="hourly_rate"
                  label="Precio por Hora (€)"
                  type="number"
                  step="0.01"
                  defaultValue={userData.hourly_rate}
                  placeholder="Ej: 12.50"
                />
                <Input
                  name="vacation_days_total"
                  label="Días Vacaciones/Año"
                  type="number"
                  defaultValue={userData.vacation_days_total}
                  placeholder="Ej: 30"
                />
              </div>
            </div>
          </div>

          {error && (
            <div className="px-6 py-3 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm">
              {error}
            </div>
          )}

          <CardFooter className="bg-[var(--color-light)]/30 flex justify-end space-x-4 p-6">
            <Button type="button" variant="ghost" onClick={() => router.back()}>
              Cancelar
            </Button>
            <Button type="submit" loading={saving}>
              Guardar Cambios
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
