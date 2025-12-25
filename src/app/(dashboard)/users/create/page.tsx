"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardFooter } from "@/components/Card";
import Input from "@/components/Input";
import Button from "@/components/Button";
import { users, roles } from "@/services/api";
import { Shield, Mail, User, Lock, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function CreateUserPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [rolesList, setRolesList] = useState<any[]>([]);

  useEffect(() => {
    roles
      .list()
      .then((data) => setRolesList(data.roles || data))
      .catch((err) => console.error("Error loading roles:", err));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.target as HTMLFormElement);
    const data = {
      full_name: formData.get("full_name"),
      email: formData.get("email"),
      password: formData.get("password"),
      role_id: formData.get("role_id"),
      is_active: true,
    };

    try {
      await users.create(data);
      router.push("/users");
    } catch (err: any) {
      setError(err.response?.data?.detail || "Error al crear el usuario");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <Link
          href="/users"
          className="text-primary flex items-center text-sm mb-4 hover:underline"
        >
          <ArrowLeft size={16} className="mr-1" />
          Volver a usuarios
        </Link>
        <h1 className="text-3xl font-bold text-primary">Nuevo Usuario</h1>
        <p className="text-dark opacity-75">
          Crea un nuevo miembro para tu equipo y asígnale un rol
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card className="border-beige">
          <CardHeader>
            <CardTitle className="flex items-center">
              <User size={20} className="mr-2 text-primary" />
              Información Personal
            </CardTitle>
          </CardHeader>

          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                name="full_name"
                label="Nombre Completo"
                placeholder="Ej: Juan Pérez"
                required
                icon={<User size={18} />}
              />
              <Input
                name="email"
                label="Correo Electrónico"
                type="email"
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
                    className="w-full pl-10 pr-4 py-2 border border-beige rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 bg-white appearance-none"
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
                <p className="text-xs text-gray-500">
                  El rol determina qué acciones puede realizar el usuario.
                </p>
              </div>

              <Input
                name="password"
                label="Contraseña Temporal"
                type="password"
                placeholder="••••••••"
                required
                icon={<Lock size={18} />}
              />
            </div>
          </div>

          {error && (
            <div className="px-6 py-3 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm">
              {error}
            </div>
          )}

          <CardFooter className="bg-light/30 flex justify-end space-x-4 p-6">
            <Button type="button" variant="ghost" onClick={() => router.back()}>
              Cancelar
            </Button>
            <Button type="submit" loading={loading}>
              Crear Usuario
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
