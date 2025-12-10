"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardFooter } from "@/components/Card";
import Input from "@/components/Input";
import Button from "@/components/Button";
import { users } from "@/services/api";

export default function CreateUserPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.target as HTMLFormElement);
    const data = {
      full_name: formData.get("full_name"),
      email: formData.get("email"),
      is_active: true,
    };

    try {
      await users.create(data);
      router.push("/dashboard/users");
    } catch (err: any) {
      setError(err.response?.data?.detail || "Error al crear el usuario");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-primary">Nuevo Usuario</h1>
        <p className="text-dark opacity-75">
          Invita a un nuevo miembro a tu equipo
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Información del Usuario</CardTitle>
          </CardHeader>
          
          <div className="space-y-4">
            <Input
              name="full_name"
              label="Nombre Completo"
              placeholder="Juan Pérez"
              required
            />
            <Input
              name="email"
              label="Email"
              type="email"
              placeholder="juan@ejemplo.com"
              required
            />
          </div>

          {error && <p className="text-red-500 text-sm mt-4">{error}</p>}

          <CardFooter className="flex justify-end space-x-4">
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
