"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/Card";
import Button from "@/components/Button";
import { users } from "@/services/api";
import { UserPlus, Mail, Shield } from "lucide-react";

export default function UsersPage() {
  const [usersList, setUsersList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    users.list()
      .then((data) => setUsersList(data.users || data))
      .catch((err) => {
        console.error("Failed to load users:", err);
        setUsersList([]);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-gray-500">Cargando usuarios...</p>
      </div>
    );
  }

  if (usersList.length === 0) {
    return (
      <div>
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-primary">Usuarios</h1>
            <p className="text-dark opacity-75">Gestiona tu equipo</p>
          </div>
        </div>

        <Card className="text-center py-12">
          <UserPlus className="mx-auto text-gray-400 mb-4" size={48} />
          <h3 className="text-xl font-bold text-dark mb-2">
            No hay usuarios todavía
          </h3>
          <p className="text-gray-600 mb-6">
            Invita a tu equipo para empezar a colaborar
          </p>
          <Link href="/dashboard/users/create">
            <Button>Crear Usuario</Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-primary">Usuarios</h1>
          <p className="text-dark opacity-75">
            {usersList.length} {usersList.length === 1 ? "usuario" : "usuarios"}
          </p>
        </div>
        <Link href="/dashboard/users/create">
          <Button>
            <UserPlus size={20} className="mr-2" />
            Nuevo Usuario
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {usersList.map((user) => (
          <Card key={user.id} className="hover:shadow-lg transition-shadow">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold">
                {user.full_name?.charAt(0) || user.email.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-dark">{user.full_name || "Sin nombre"}</h3>
                <div className="flex items-center text-sm text-gray-600 mt-1">
                  <Mail size={14} className="mr-1" />
                  {user.email}
                </div>
                {user.role && (
                  <div className="flex items-center text-sm text-gray-600 mt-1">
                    <Shield size={14} className="mr-1" />
                    {user.role.name}
                  </div>
                )}
                <div className="mt-2">
                  <span
                    className={`inline-block px-2 py-1 text-xs rounded ${
                      user.is_active
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {user.is_active ? "Activo" : "Inactivo"}
                  </span>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
