"use client";

import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle } from "@/components/Card";
import Input from "@/components/Input";
import Button from "@/components/Button";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";
import {
  Check,
  Mail,
  User as UserIcon,
  Lock,
  Layout,
} from "lucide-react";

const THEMES = [
  {
    id: "twilight",
    name: "Twilight",
    colors: ["#4338CA", "#6B7280", "#F3F4F6"],
  },
  {
    id: "tropical",
    name: "Tropical",
    colors: ["#1F6357", "#4DB8A8", "#F4E9CD"],
  },
  { id: "vista", name: "Vista", colors: ["#d56a34", "#3f170e", "#f9f7e9"] },
  { id: "mint", name: "Mint Fresh", colors: ["#1F756E", "#5DDCC3", "#C8E86C"] },
  { id: "sunset", name: "Sunset", colors: ["#FF6B9D", "#FFA07A", "#FFD700"] },
  { id: "ocean", name: "Ocean", colors: ["#006D77", "#83C5BE", "#EDF6F9"] },
  {
    id: "lavender",
    name: "Lavender",
    colors: ["#9D84B7", "#C8B6E2", "#E8DFF5"],
  },
  { id: "fire", name: "Fire", colors: ["#FF4500", "#FFD700", "#FF6347"] },
];

export default function ProfilePage() {
  const { theme, setTheme } = useTheme();
  const { user } = useAuth();
  const [userData, setUserData] = useState({
    full_name: "",
    email: "",
  });

  useEffect(() => {
    if (user) {
      setUserData({
        full_name: user.full_name || "",
        email: user.email || "",
      });
    }
  }, [user]);

  const handleUserUpdate = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserData({ ...userData, [e.target.name]: e.target.value });
  };

  return (
    <div className="w-full pb-20">
      <div className="mb-10">
        <h1 className="text-4xl font-bold text-primary mb-2">Mi Cuenta</h1>
        <p className="text-lg text-gray-600">
          Gestiona tu perfil personal y preferencias de apariencia.
        </p>
      </div>

      <div className="space-y-10">
        {/* User Profile Section */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <UserIcon className="text-primary" size={24} />
            <h2 className="text-2xl font-semibold text-gray-800">
              Perfil de Usuario
            </h2>
          </div>
          <Card className="w-full max-w-none">
            <CardHeader>
              <CardTitle>Información Personal</CardTitle>
              <p className="text-gray-500">
                Actualiza tus datos de acceso y perfil.
              </p>
            </CardHeader>
            <div className="p-6 pt-0 grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <Input
                  label="Nombre Completo"
                  name="full_name"
                  value={userData.full_name}
                  onChange={handleUserUpdate}
                  placeholder="Tu nombre"
                  icon={<UserIcon size={18} />}
                />
                <Input
                  label="Correo Electrónico"
                  name="email"
                  value={userData.email}
                  onChange={handleUserUpdate}
                  placeholder="tu@email.com"
                  icon={<Mail size={18} />}
                  disabled
                />
              </div>
              <div className="space-y-6">
                <div className="p-4 bg-yellow-50 border border-yellow-100 rounded-lg">
                  <h4 className="font-bold text-yellow-800 mb-2 flex items-center gap-2">
                    <Lock size={16} /> Seguridad
                  </h4>
                  <p className="text-sm text-yellow-700 mb-4">
                    Para cambiar tu contraseña, te enviaremos un enlace a tu
                    correo.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-white border-yellow-200 text-yellow-800 hover:bg-yellow-100"
                  >
                    Cambiar Contraseña
                  </Button>
                </div>
              </div>
            </div>
            <div className="flex justify-end p-6 pt-0">
               <Button>Guardar Cambios</Button>
            </div>
          </Card>
        </section>

        {/* Appearance Section */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Layout className="text-primary" size={24} />
            <h2 className="text-2xl font-semibold text-gray-800">Apariencia</h2>
          </div>
          <Card className="w-full max-w-none">
            <CardHeader>
              <CardTitle>Tema de la Interfaz</CardTitle>
              <p className="text-gray-500">
                Selecciona un esquema de colores para personalizar tu panel.
              </p>
            </CardHeader>
            <div className="p-6 pt-0">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-4">
                {THEMES.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setTheme(t.id as any)}
                    className={`relative flex flex-col items-center p-4 rounded-xl border-2 transition-all duration-200 ${
                      theme === t.id
                        ? "border-primary bg-primary/5 shadow-sm"
                        : "border-transparent bg-gray-50 hover:bg-gray-100 hover:border-gray-200"
                    }`}
                  >
                    <div className="flex -space-x-2 mb-3 overflow-hidden p-1">
                      {t.colors.map((color, i) => (
                        <div
                          key={i}
                          className="w-8 h-8 rounded-full ring-2 ring-white shadow-sm"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                    <span
                      className={`font-medium text-sm ${
                        theme === t.id ? "text-primary" : "text-gray-700"
                      }`}
                    >
                      {t.name}
                    </span>
                    {theme === t.id && (
                      <div className="absolute top-2 right-2 text-primary bg-white rounded-full p-0.5 shadow-sm">
                        <Check size={14} />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </Card>
        </section>
      </div>
    </div>
  );
}
