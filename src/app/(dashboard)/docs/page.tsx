import React from "react";
import { Card, CardHeader, CardTitle } from "@/components/Card";

export default function DocsPage() {
  return (
    <div className="w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-primary">Documentación</h1>
        <p className="text-dark opacity-75">
          Guías y referencias para usar EscapeMaster.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="hover:border-primary cursor-pointer transition-colors">
          <CardHeader>
            <CardTitle>Guía de Inicio</CardTitle>
          </CardHeader>
          <p className="text-gray-600 mb-4">
            Aprende los conceptos básicos para configurar tu organización y
            empezar a recibir reservas.
          </p>
          <a href="#" className="text-primary font-semibold hover:underline">
            Leer más →
          </a>
        </Card>

        <Card className="hover:border-primary cursor-pointer transition-colors">
          <CardHeader>
            <CardTitle>Gestión de Salas</CardTitle>
          </CardHeader>
          <p className="text-gray-600 mb-4">
            Cómo crear salas, configurar horarios y gestionar la disponibilidad.
          </p>
          <a href="#" className="text-primary font-semibold hover:underline">
            Leer más →
          </a>
        </Card>

        <Card className="hover:border-primary cursor-pointer transition-colors">
          <CardHeader>
            <CardTitle>API Reference</CardTitle>
          </CardHeader>
          <p className="text-gray-600 mb-4">
            Documentación técnica completa de la API para integraciones
            personalizadas.
          </p>
          <a
            href="https://api.escapemaster.es/docs"
            target="_blank"
            className="text-primary font-semibold hover:underline"
          >
            Ver Swagger UI →
          </a>
        </Card>

        <Card className="hover:border-primary cursor-pointer transition-colors">
          <CardHeader>
            <CardTitle>Soporte</CardTitle>
          </CardHeader>
          <p className="text-gray-600 mb-4">
            ¿Necesitas ayuda? Contacta con nuestro equipo de soporte técnico.
          </p>
          <a href="#" className="text-primary font-semibold hover:underline">
            Contactar →
          </a>
        </Card>
      </div>
    </div>
  );
}
