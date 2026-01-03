"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle } from "@/components/Card";
import Input from "@/components/Input";
import Button from "@/components/Button";
import api, { users, roles } from "@/services/api";
import { Shield, Mail, User, Lock, ArrowLeft, UserPlus, AlertCircle } from "lucide-react";
import Link from "next/link";

export default function CreateUserPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [loadingRoles, setLoadingRoles] = useState(true);
  const [error, setError] = useState("");
  const [rolesList, setRolesList] = useState<any[]>([]);

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        setLoadingRoles(true);
        setError("");
        const data = await roles.list();
        
        // Handle both object {roles: []} and array [] responses
        const list = data.roles || (Array.isArray(data) ? data : []);
        setRolesList(list);
        
        if (list.length === 0) {
          console.warn('No roles found in API response');
        }
      } catch (err: any) {
        console.error('Error fetching roles:', err);
        const detail = err.response?.data?.detail || err.message;
        setError(`Error al cargar roles: ${detail}`);
      } finally {
        setLoadingRoles(false);
      }
    };

    fetchRoles();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const userData = {
      email: formData.get("email"),
      full_name: formData.get("full_name"),
      password: formData.get("password"),
      role_id: formData.get("role_id") || null,
      is_active: formData.get("is_active") === "true",
      target_hours: parseFloat(formData.get("target_hours") as string) || 0,
      hourly_rate: parseFloat(formData.get("hourly_rate") as string) || 0,
      vacation_days_total: parseInt(formData.get("vacation_days_total") as string) || 0,
    };

    console.log("Sending user data:", userData);

    try {
      await users.create(userData);
      router.push("/users");
    } catch (err: any) {
      console.error("Error creating user:", err);
      
      if (err.response?.data?.detail) {
        const detail = err.response.data.detail;
        if (Array.isArray(detail)) {
          const errorMessages = detail.map((e: any) => `${e.loc.join('.')}: ${e.msg}`).join(', ');
          setError(errorMessages);
        } else {
          setError(typeof detail === 'string' ? detail : "Error al crear el usuario");
        }
      } else {
        setError("Error al crear el usuario. Por favor, inténtalo de nuevo.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full pb-20 px-4 lg:px-8">
      {/* Header Section - Desktop Optimized */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
        <div className="space-y-1">
          <h1 className="text-4xl font-extrabold text-primary tracking-tight">
            Crear Nuevo Usuario
          </h1>
          <p className="text-dark/60 text-lg">
            Configura el acceso y permisos para un nuevo miembro de tu equipo.
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => router.back()}
          className="w-fit px-6 py-2 border-beige hover:bg-beige/10"
        >
          Volver al listado
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Left Column: Main Information (8 cols) */}
          <div className="lg:col-span-8 space-y-8">
            <Card className="border-none shadow-xl shadow-primary/5 bg-white overflow-hidden">
              <div className="h-2 bg-primary w-full" />
              <CardHeader className="px-8 pt-8 pb-4">
                <CardTitle className="flex items-center text-2xl font-bold text-dark">
                  <UserPlus size={28} className="mr-3 text-primary" />
                  Información Personal
                </CardTitle>
              </CardHeader>

              <div className="p-8 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <Input
                    name="full_name"
                    label="Nombre Completo"
                    placeholder="Ej: Juan Pérez"
                    required
                    icon={<User size={18} />}
                    className="bg-white py-3"
                  />
                  <Input
                    name="email"
                    label="Correo Electrónico"
                    type="email"
                    placeholder="ejemplo@correo.com"
                    required
                    icon={<Mail size={18} />}
                    className="bg-white py-3"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <Input
                    name="password"
                    label="Contraseña Temporal"
                    type="password"
                    placeholder="••••••••"
                    required
                    icon={<Lock size={18} />}
                    className="bg-white py-3"
                  />
                  <div className="space-y-3">
                    <label className="block text-sm font-bold text-gray-700">
                      Estado de la Cuenta
                    </label>
                    <div className="flex items-center space-x-6 p-3.5 bg-light/20 rounded-xl border border-beige/40">
                      <label className="flex items-center cursor-pointer group">
                        <input
                          type="radio"
                          id="active"
                          name="is_active"
                          value="true"
                          defaultChecked
                          className="w-5 h-5 text-primary focus:ring-primary border-gray-300 transition-all"
                        />
                        <span className="ml-3 text-sm font-semibold text-gray-700 group-hover:text-primary transition-colors">
                          Activo
                        </span>
                      </label>
                      <label className="flex items-center cursor-pointer group">
                        <input
                          type="radio"
                          id="inactive"
                          name="is_active"
                          value="false"
                          className="w-5 h-5 text-primary focus:ring-primary border-gray-300 transition-all"
                        />
                        <span className="ml-3 text-sm font-semibold text-gray-700 group-hover:text-primary transition-colors">
                          Inactivo
                        </span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="border-none shadow-xl shadow-primary/5 bg-white overflow-hidden">
              <div className="h-2 bg-accent w-full" />
              <CardHeader className="px-8 pt-8 pb-4">
                <CardTitle className="flex items-center text-2xl font-bold text-dark">
                  <Lock size={28} className="mr-3 text-accent" />
                  Configuración de Horas y Salario
                </CardTitle>
              </CardHeader>
              <div className="p-8 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <Input
                    name="target_hours"
                    label="Horas Mensuales"
                    type="number"
                    step="0.5"
                    placeholder="Ej: 160"
                    icon={<Lock size={18} />}
                    className="bg-white py-3"
                  />
                  <Input
                    name="hourly_rate"
                    label="Precio por Hora (€)"
                    type="number"
                    step="0.01"
                    placeholder="Ej: 12.50"
                    icon={<Lock size={18} />}
                    className="bg-white py-3"
                  />
                  <Input
                    name="vacation_days_total"
                    label="Días Vacaciones/Año"
                    type="number"
                    placeholder="Ej: 30"
                    icon={<Lock size={18} />}
                    className="bg-white py-3"
                  />
                </div>
              </div>
            </Card>

            <div className="flex justify-end items-center space-x-6 pt-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="text-dark/60 font-bold hover:text-dark transition-colors px-4"
              >
                Descartar cambios
              </button>
              <Button
                type="submit"
                loading={loading}
                className="px-16 py-4 text-lg font-bold shadow-xl shadow-primary/20 rounded-2xl"
              >
                Guardar Usuario
              </Button>
            </div>
          </div>

          {/* Right Column: Role & Permissions (4 cols) */}
          <div className="lg:col-span-4 space-y-8">
            <Card className="border-none shadow-xl shadow-primary/5 bg-white overflow-hidden">
              <div className="h-2 bg-secondary w-full" />
              <CardHeader className="px-8 pt-8 pb-4">
                <CardTitle className="flex items-center text-2xl font-bold text-dark">
                  <Shield size={28} className="mr-3 text-secondary" />
                  Rol y Acceso
                </CardTitle>
              </CardHeader>

              <div className="p-8 space-y-8">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <label className="block text-sm font-bold text-gray-700">
                      Rol del Sistema
                    </label>
                    {loadingRoles && <span className="text-[10px] text-primary animate-pulse font-bold uppercase tracking-widest">Cargando...</span>}
                  </div>
                  <div className="relative">
                    <Shield
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                      size={20}
                    />
                    <select
                      name="role_id"
                      className="w-full pl-12 pr-10 py-4 border-2 border-beige/50 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/10 bg-white appearance-none transition-all hover:border-primary/30 font-medium text-dark"
                      required
                      disabled={loadingRoles}
                    >
                      <option value="">
                        {loadingRoles ? "Cargando roles..." : "Selecciona un rol"}
                      </option>
                      {rolesList.map((role) => (
                        <option key={role.id} value={role.id}>
                          {role.name}
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                      <svg className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                        <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                      </svg>
                    </div>
                  </div>
                  
                  {rolesList.length === 0 && !loadingRoles && (
                    <div className="p-4 bg-red-50 border border-red-100 rounded-xl flex items-start">
                      <AlertCircle size={16} className="text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-red-600 font-medium">
                        No se encontraron roles disponibles. Verifica tus permisos o contacta a soporte.
                      </p>
                    </div>
                  )}
                </div>

                <div className="bg-beige/10 p-6 rounded-2xl border border-beige/30 space-y-3">
                  <h4 className="text-sm font-bold text-primary flex items-center">
                    <AlertCircle size={16} className="mr-2" />
                    Guía de Roles
                  </h4>
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs font-bold text-dark">Admin</p>
                      <p className="text-[11px] text-dark/60">Acceso total a configuración, finanzas y usuarios.</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-dark">Manager</p>
                      <p className="text-[11px] text-dark/60">Gestión de salas, reservas y reportes básicos.</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-dark">Staff / Recepción</p>
                      <p className="text-[11px] text-dark/60">Gestión de reservas diarias y check-in de clientes.</p>
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-r-xl text-red-700 text-sm flex items-start shadow-sm">
                    <AlertCircle size={20} className="mr-3 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-bold">Ha ocurrido un error</p>
                      <p className="opacity-90">{error}</p>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}
