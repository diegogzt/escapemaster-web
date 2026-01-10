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
} from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="w-full pb-20">
      <div className="mb-10">
        <h1 className="text-4xl font-bold text-primary mb-2">Ajustes de Organización</h1>
        <p className="text-lg text-gray-600">
          Gestiona los detalles y la configuración de tu empresa.
        </p>
      </div>

      <div className="space-y-10">
        {/* Organization Info Section */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Building className="text-primary" size={24} />
            <h2 className="text-2xl font-semibold text-gray-800">
              Datos Generales
            </h2>
          </div>
          <Card className="w-full max-w-none">
            <CardHeader>
              <CardTitle>Información General</CardTitle>
            </CardHeader>
            <div className="p-6 pt-0 grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <Input
                  label="Nombre de la Organización"
                  defaultValue="Escape Room Madrid"
                  placeholder="Ej. Mi Empresa S.L."
                  icon={<Building size={18} />}
                />
                <Input
                  label="Sitio Web"
                  defaultValue="https://escaperoom.com"
                  placeholder="https://..."
                  icon={<Globe size={18} />}
                />
              </div>
              <div className="space-y-6">
                <Input
                  label="Email de Contacto"
                  defaultValue="info@escape.com"
                  placeholder="contacto@empresa.com"
                  icon={<Mail size={18} />}
                />
                <Input
                  label="Teléfono"
                  defaultValue="+34 600 000 000"
                  placeholder="+34 ..."
                  icon={<Phone size={18} />}
                />
              </div>
            </div>
          </Card>
        </section>

        {/* Location Section */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="text-primary" size={24} />
            <h2 className="text-2xl font-semibold text-gray-800">Ubicación</h2>
          </div>
          <Card className="w-full max-w-none">
            <CardHeader>
              <CardTitle>Dirección y Horario</CardTitle>
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
            <h2 className="text-2xl font-semibold text-gray-800">
              Integraciones
            </h2>
          </div>
          <Card className="w-full max-w-none">
            <CardHeader>
              <CardTitle>Servicios Conectados</CardTitle>
            </CardHeader>
            <div className="p-6 pt-0 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center justify-between p-5 border border-gray-200 rounded-xl hover:border-primary/30 transition-colors bg-gray-50/50">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white rounded-lg shadow-sm flex items-center justify-center text-xl font-bold text-indigo-600 border border-gray-100">
                    S
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">Stripe</h4>
                    <p className="text-sm text-gray-500">Pagos y facturación</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="border-gray-300">
                  Configurar
                </Button>
              </div>

              <div className="flex items-center justify-between p-5 border border-gray-200 rounded-xl hover:border-primary/30 transition-colors bg-gray-50/50">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white rounded-lg shadow-sm flex items-center justify-center text-xl font-bold text-black border border-gray-100">
                    R
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">Resend</h4>
                    <p className="text-sm text-gray-500">
                      Notificaciones por email
                    </p>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="border-gray-300">
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
