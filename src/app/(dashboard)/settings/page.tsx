"use client";

import React from "react";
import { Card, CardHeader, CardTitle } from "@/components/Card";
import Input from "@/components/Input";
import Select from "@/components/Select";
import Button from "@/components/Button";
import {
  Globe,
  Mail,
  MapPin,
  Phone,
  Building,
  CreditCard,
  Palette,
  Layout,
  Moon,
  Sun,
} from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

const themesList = [
  { id: "tropical", name: "Tropical", primary: "#1F6357", secondary: "#4DB8A8" },
  { id: "ocean", name: "Ocean", primary: "#006D77", secondary: "#83C5BE" },
  { id: "sunset", name: "Sunset", primary: "#FF6B9D", secondary: "#FFA07A" },
  { id: "nature", name: "Nature", primary: "#2D6A4F", secondary: "#52B788" },
  { id: "mint", name: "Mint Fresh", primary: "#1F756E", secondary: "#5DDCC3" },
  { id: "vista", name: "Vista", primary: "#D56A34", secondary: "#3F170E" },
  { id: "twilight", name: "Twilight", primary: "#4338CA", secondary: "#6B7280" },
  { id: "lavender", name: "Lavender", primary: "#9D84B7", secondary: "#C8B6E2" },
  { id: "fire", name: "Fire", primary: "#FF4500", secondary: "#FFD700" },
];

export default function SettingsPage() {
  const { 
    theme, 
    setTheme, 
    useCustomBackground, 
    setUseCustomBackground,
    isDarkMode,
    setIsDarkMode
  } = useTheme();

  return (
    <div className="w-full pb-20">
      <div className="mb-10">
        <h1 className="text-4xl font-bold text-primary mb-2">Ajustes de Organización</h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Gestiona los detalles y la configuración de tu empresa.
        </p>
      </div>

      <div className="space-y-10">
        {/* Personalization Section */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Palette className="text-primary" size={24} />
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">
              Personalización Visual
            </h2>
          </div>
          <Card className="w-full max-w-none bg-white dark:bg-slate-900 border-gray-100 dark:border-slate-800">
            <CardHeader>
              <CardTitle className="dark:text-white">Tema y Colores</CardTitle>
            </CardHeader>
            <div className="p-6 pt-0 space-y-8">
              {/* Palette Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                  Selecciona la paleta de colores de tu organización
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                  {themesList.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setTheme(t.id as any)}
                      aria-label={`Seleccionar tema ${t.name}`}
                      className={`relative flex flex-col items-center p-4 rounded-xl border-2 transition-all cursor-pointer ${
                        theme === t.id
                          ? "border-primary bg-primary/5 ring-4 ring-primary/10"
                          : "border-gray-100 dark:border-slate-800 hover:border-gray-200 dark:hover:border-slate-700"
                      }`}
                    >
                      <div className="flex gap-1 mb-3 pointer-events-none">
                        <div className="w-6 h-6 rounded-full shadow-sm" style={{ backgroundColor: t.primary }} />
                        <div className="w-6 h-6 rounded-full shadow-sm" style={{ backgroundColor: t.secondary }} />
                      </div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white pointer-events-none">{t.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Background Toggle */}
                <div className="flex items-center justify-between p-4 border border-gray-100 dark:border-slate-800 rounded-xl bg-gray-50/50 dark:bg-slate-800/50">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${useCustomBackground ? 'bg-primary/10 text-primary' : 'bg-gray-100 dark:bg-slate-700 text-gray-400 dark:text-gray-500'}`}>
                      <Layout size={20} />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 dark:text-white">Fondo personalizado</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Usa el color de la paleta</p>
                    </div>
                  </div>
                  <button 
                    type="button"
                    onClick={() => setUseCustomBackground(!useCustomBackground)}
                    aria-label="Toggle fondo personalizado"
                    className={`w-14 h-8 rounded-full transition-all relative outline-hidden ${useCustomBackground ? 'bg-primary' : 'bg-gray-200 dark:bg-slate-700'}`}
                  >
                    <div className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transition-all ${useCustomBackground ? 'left-7' : 'left-1'}`} />
                  </button>
                </div>

                {/* Dark Mode Toggle */}
                <div className="flex items-center justify-between p-4 border border-gray-100 dark:border-slate-800 rounded-xl bg-gray-50/50 dark:bg-slate-800/50">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-indigo-100 text-indigo-600' : 'bg-amber-100 text-amber-600'}`}>
                      {isDarkMode ? <Moon size={20} /> : <Sun size={20} />}
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 dark:text-white">Modo Oscuro</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{isDarkMode ? 'Activado' : 'Desactivado'}</p>
                    </div>
                  </div>
                  <button 
                    type="button"
                    onClick={() => setIsDarkMode(!isDarkMode)}
                    aria-label="Toggle modo oscuro"
                    className={`w-14 h-8 rounded-full transition-all relative outline-hidden ${isDarkMode ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-slate-700'}`}
                  >
                    <div className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transition-all ${isDarkMode ? 'left-7' : 'left-1'}`} />
                  </button>
                </div>
              </div>
            </div>
          </Card>
        </section>

        {/* Organization Info Section */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Building className="text-primary" size={24} />
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">Datos Generales</h2>
          </div>
          <Card className="w-full max-w-none bg-white dark:bg-slate-900 border-gray-100 dark:border-slate-800">
            <CardHeader>
              <CardTitle className="dark:text-white">Información de la Organización</CardTitle>
            </CardHeader>
            <div className="p-6 pt-0 grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input label="Nombre de la Organización" defaultValue="Mi Escape Room" />
              <Input label="Sitio Web" defaultValue="https://miescaperoom.com" />
              <Input label="Correo Electrónico de Contacto" defaultValue="contacto@miescaperoom.com" />
              <Input label="Teléfono" defaultValue="+34 912 345 678" />
            </div>
          </Card>
        </section>

        {/* Location Section */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="text-primary" size={24} />
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">Ubicación</h2>
          </div>
          <Card className="w-full max-w-none bg-white dark:bg-slate-900 border-gray-100 dark:border-slate-800">
            <CardHeader>
              <CardTitle className="dark:text-white">Dirección y Horario</CardTitle>
            </CardHeader>
            <div className="p-6 pt-0 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <Input
                  label="Dirección Completa"
                  defaultValue="Calle Principal 123, Local Bajo"
                />
              </div>
              <div>
                <Input label="Código Postal" defaultValue="28001" />
              </div>
              <div>
                <Input label="Ciudad" defaultValue="Madrid" />
              </div>
              <div>
                <Input label="Provincia/Estado" defaultValue="Madrid" />
              </div>
              <div>
                <Select label="Zona Horaria" defaultValue="Europe/Madrid">
                  <option value="Europe/Madrid">Europe/Madrid (GMT+1)</option>
                  <option value="Europe/London">Europe/London (GMT+0)</option>
                  <option value="America/New_York">
                    America/New_York (GMT-5)
                  </option>
                </Select>
              </div>
            </div>
          </Card>
        </section>

        {/* Integrations Section */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <CreditCard className="text-primary" size={24} />
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">
              Integraciones
            </h2>
          </div>
          <Card className="w-full max-w-none bg-white dark:bg-slate-900 border-gray-100 dark:border-slate-800">
            <CardHeader>
              <CardTitle className="dark:text-white">Servicios Conectados</CardTitle>
            </CardHeader>
            <div className="p-6 pt-0 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center justify-between p-5 border border-gray-100 dark:border-slate-800 rounded-xl hover:border-primary/30 transition-colors bg-gray-50/50 dark:bg-slate-800/50">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white dark:bg-slate-700 rounded-lg shadow-sm flex items-center justify-center text-xl font-bold text-indigo-600 border border-gray-100 dark:border-slate-600">
                    S
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-white">Stripe</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Pagos y facturación</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="border-gray-300 dark:border-slate-600 dark:text-gray-300">
                  Configurar
                </Button>
              </div>

              <div className="flex items-center justify-between p-5 border border-gray-100 dark:border-slate-800 rounded-xl hover:border-primary/30 transition-colors bg-gray-50/50 dark:bg-slate-800/50">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white dark:bg-slate-700 rounded-lg shadow-sm flex items-center justify-center text-xl font-bold text-black dark:text-white border border-gray-100 dark:border-slate-600">
                    R
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-white">Resend</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Notificaciones por email
                    </p>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="border-gray-300 dark:border-slate-600 dark:text-gray-300">
                  Conectar
                </Button>
              </div>
            </div>
          </Card>
        </section>

        <div className="flex justify-end pt-6 pb-10">
          <Button
            size="lg"
            className="px-8 text-lg shadow-lg shadow-primary/20"
          >
            Guardar Cambios
          </Button>
        </div>
      </div>
    </div>
  );
}
