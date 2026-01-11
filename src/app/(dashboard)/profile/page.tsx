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
  Moon,
  Sun,
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
  const { theme, setTheme, isDarkMode, setIsDarkMode } = useTheme();
  const { user, updateUser } = useAuth();
  const [userData, setUserData] = useState({
    full_name: "",
    email: "",
  });
  const [isSaving, setIsSaving] = useState(false);

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

  const onSave = async () => {
    setIsSaving(true);
    try {
      await updateUser({ full_name: userData.full_name });
      // Show success toast or notification if available
    } catch (error) {
      console.error("Failed to update user", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="w-full pb-20">
      <div className="mb-10">
        <h1 className="text-4xl font-bold text-primary mb-2">Configuración de la Cuenta</h1>
        <p className="text-lg text-[var(--color-foreground)] opacity-60">
          Gestiona tu perfil personal, seguridad y preferencias de interfaz.
        </p>
      </div>

      <div className="space-y-10">
        {/* User Profile Section */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <UserIcon className="text-primary" size={24} />
            <h2 className="text-2xl font-semibold text-[var(--color-foreground)]">
              Perfil Personal
            </h2>
          </div>
          <Card className="w-full max-w-none bg-[var(--color-background)] border-[var(--color-beige)]">
            <CardHeader>
              <CardTitle>Información del Usuario</CardTitle>
            </CardHeader>
            <div className="p-6 pt-0 space-y-8">
              <div className="flex flex-col md:flex-row gap-10">
                {/* Avatar Section */}
                <div className="flex flex-col items-center gap-4">
                  <div className="relative group">
                    <div className="w-32 h-32 rounded-full bg-primary/10 flex items-center justify-center text-primary border-2 border-[var(--color-beige)] overflow-hidden">
                      {user?.photo_url ? (
                        <img src={user.photo_url} alt={user.full_name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-4xl font-bold">{userData.full_name?.charAt(0) || "U"}</span>
                      )}
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="w-full">
                    Cambiar Foto
                  </Button>
                </div>

                {/* Form Fields */}
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
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
                    placeholder="tu@email.com"
                    icon={<Mail size={18} />}
                    disabled
                  />
                  <div className="md:col-span-2 p-4 bg-primary/5 border border-primary/10 rounded-2xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 text-primary rounded-xl">
                        <Lock size={20} />
                      </div>
                      <div>
                        <h4 className="font-bold text-[var(--color-foreground)]">Seguridad de la Cuenta</h4>
                        <p className="text-sm text-[var(--color-foreground)] opacity-60">Gestiona tu contraseña y sesiones activas.</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      Cambiar Contraseña
                    </Button>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-end p-6 border-t border-[var(--color-beige)]/50">
              <Button onClick={onSave} disabled={isSaving}>
                {isSaving ? "Guardando..." : "Guardar Perfil"}
              </Button>
            </div>
          </Card>
        </section>

        {/* Interface Preferences */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Layout className="text-primary" size={24} />
            <h2 className="text-2xl font-semibold text-[var(--color-foreground)]">Preferencias de Interfaz</h2>
          </div>
          <Card className="w-full max-w-none bg-[var(--color-background)] border-[var(--color-beige)]">
            <CardHeader>
              <CardTitle>Tema Personal</CardTitle>
            </CardHeader>
            <div className="p-6 pt-0 space-y-8">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                {/* Dark Mode Toggle */}
                <div className="flex items-center justify-between p-4 border border-[var(--color-beige)] rounded-xl bg-[var(--color-background-soft)]">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-indigo-100 text-indigo-600' : 'bg-amber-100 text-amber-600'}`}>
                      {isDarkMode ? <Moon size={20} /> : <Sun size={20} />}
                    </div>
                    <div>
                      <h4 className="font-bold text-[var(--color-foreground)]">Modo Oscuro</h4>
                      <p className="text-sm text-[var(--color-foreground)] opacity-60">Personalizar mi vista</p>
                    </div>
                  </div>
                  <button 
                    type="button"
                    onClick={() => setIsDarkMode(!isDarkMode)}
                    className={`w-14 h-8 rounded-full transition-all relative outline-hidden ${isDarkMode ? 'bg-indigo-600' : 'bg-[var(--color-background-soft)]'}`}
                  >
                    <div className={`absolute top-1 w-6 h-6 bg-[var(--color-background)] rounded-full shadow-md transition-all ${isDarkMode ? 'left-7' : 'left-1'}`} />
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--color-foreground)] opacity-80 mb-4">
                  Selecciona tu paleta personal (solo afecta a tu vista)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {THEMES.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setTheme(t.id as any)}
                      className={`relative flex flex-col items-center p-4 rounded-xl border-2 transition-all duration-200 ${
                        theme === t.id
                          ? "border-primary bg-primary/5 ring-4 ring-primary/10"
                          : "border-[var(--color-beige)] hover:border-primary/30"
                      }`}
                    >
                      <div className="flex -space-x-2 mb-3">
                        {t.colors.map((color, i) => (
                          <div
                            key={i}
                            className="w-8 h-8 rounded-full ring-2 ring-[var(--color-background)] shadow-sm"
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                      <span className={`font-medium text-sm ${theme === t.id ? "text-primary" : "text-[var(--color-foreground)]"}`}>
                        {t.name}
                      </span>
                      {theme === t.id && (
                        <div className="absolute top-2 right-2 text-primary">
                          <Check size={14} />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </section>
      </div>
    </div>
  );
}
