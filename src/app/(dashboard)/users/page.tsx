"use client";

import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import Link from "next/link";
import { Card } from "@/components/Card";
import Button from "@/components/Button";
import { users } from "@/services/api";
import {
  UserPlus,
  Mail,
  Shield,
  MoreVertical,
  Edit2,
  Trash2,
  Key,
  Search,
  Filter,
} from "lucide-react";

export default function UsersPage() {
  const [usersList, setUsersList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("");

  const fetchUsers = () => {
    setLoading(true);
    users
      .list({ search: searchTerm, role_id: filterRole || undefined })
      .then((data) => setUsersList(Array.isArray(data?.users) ? data.users : Array.isArray(data) ? data : []))
      .catch((err) => {
        console.error("Failed to load users:", err);
        setUsersList([]);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchUsers();
  }, [filterRole]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchUsers();
  };

  const handleDeleteUser = async (id: string) => {
    if (confirm("¿Estás seguro de que quieres desactivar este usuario?")) {
      try {
        await users.delete(id);
        fetchUsers();
      } catch (err) {
        toast.error("Error al desactivar usuario");
      }
    }
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary">Usuarios</h1>
          <p className="text-[var(--color-foreground)] opacity-75">Gestiona tu equipo y permisos</p>
        </div>
        <Link href="/users/create">
          <Button>
            <UserPlus size={20} className="mr-2" />
            Nuevo Usuario
          </Button>
        </Link>
      </div>

      {/* Filters & Search */}
      <Card className="mb-6 p-4">
        <form
          onSubmit={handleSearch}
          className="flex flex-col md:flex-row gap-4"
        >
          <div className="flex-1 relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-muted-foreground)]"
              size={18}
            />
            <input
              type="text"
              placeholder="Buscar por nombre o email..."
              className="w-full pl-10 pr-4 py-2 border border-beige rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <select
              className="px-4 py-2 border border-beige rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 bg-[var(--color-background)]"
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
            >
              <option value="">Todos los roles</option>
              <option value="admin">Administrador</option>
              <option value="manager">Manager</option>
              <option value="staff">Staff</option>
            </select>
            <Button type="submit" variant="secondary">
              Buscar
            </Button>
          </div>
        </form>
      </Card>

      {loading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-[var(--color-muted-foreground)]">Cargando usuarios...</p>
        </div>
      ) : usersList.length === 0 ? (
        <Card className="text-center py-12">
          <UserPlus className="mx-auto text-[var(--color-muted-foreground)] mb-4" size={48} />
          <h3 className="text-xl font-bold text-[var(--color-foreground)] mb-2">
            No se encontraron usuarios
          </h3>
          <p className="text-[var(--color-muted-foreground)] mb-6">
            Prueba con otros filtros o crea uno nuevo
          </p>
          <Link href="/users/create">
            <Button>Crear Usuario</Button>
          </Link>
        </Card>
      ) : (
        <div className="bg-[var(--color-background)] rounded-xl shadow-sm border border-beige overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[var(--color-light)]/50 border-b border-beige">
                <th className="px-6 py-4 font-bold text-[var(--color-foreground)]">Usuario</th>
                <th className="px-6 py-4 font-bold text-[var(--color-foreground)]">Rol</th>
                <th className="px-6 py-4 font-bold text-[var(--color-foreground)]">Estado</th>
                <th className="px-6 py-4 font-bold text-[var(--color-foreground)] text-right">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-beige">
              {usersList.map((user) => (
                <tr
                  key={user.id}
                  className="hover:bg-[var(--color-light)]/30 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold text-sm">
                        {user.full_name?.charAt(0) ||
                          user.email.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-bold text-[var(--color-foreground)]">
                          {user.full_name || "Sin nombre"}
                        </div>
                        <div className="text-xs text-[var(--color-muted-foreground)] flex items-center">
                          <Mail size={12} className="mr-1" />
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center text-sm text-[var(--color-foreground)]">
                      <Shield size={14} className="mr-2 text-primary" />
                      {user.role?.name || "Sin rol"}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        user.is_active
                          ? "bg-green-500/10 text-green-400"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {user.is_active ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <Link href={`/users/${user.id}/edit`}>
                        <button
                          className="p-2 text-[var(--color-muted-foreground)] hover:text-primary transition-colors"
                          title="Editar"
                        >
                          <Edit2 size={18} />
                        </button>
                      </Link>
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="p-2 text-[var(--color-muted-foreground)] hover:text-red-500 transition-colors"
                        title="Desactivar"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
