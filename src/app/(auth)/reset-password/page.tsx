"use client";

import React, { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Input from "@/components/Input";
import Button from "@/components/Button";
import { Card, CardHeader, CardTitle, CardFooter } from "@/components/Card";
import { auth } from "@/services/api";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const initialCode = searchParams.get("code") || "";
  const initialEmail = searchParams.get("email") || "";

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.target as HTMLFormElement);
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;
    const email = formData.get("email") as string;
    const code = formData.get("code") as string;

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    try {
      await auth.resetPassword(email, code, password);
      setSuccess(true);
      setTimeout(() => {
        router.push("/login");
      }, 3000);
    } catch (err: any) {
      setError(
        err.response?.data?.detail || "Error al restablecer la contraseña"
      );
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="text-center p-6">
        <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
          <svg
            className="w-8 h-8 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-dark mb-2">
          ¡Contraseña Actualizada!
        </h3>
        <p className="text-dark opacity-75 mb-4">
          Tu contraseña ha sido cambiada exitosamente. Redirigiendo al login...
        </p>
        <Link href="/login">
          <Button>Ir al Login ahora</Button>
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-4">
      {error && (
        <div className="bg-red-50 text-red-500 p-3 rounded-md text-sm">
          {error}
        </div>
      )}

      <Input
        label="Correo Electrónico"
        name="email"
        type="email"
        defaultValue={initialEmail}
        placeholder="tu@email.com"
        required
      />

      <Input
        label="Código de Verificación"
        name="code"
        type="text"
        defaultValue={initialCode}
        placeholder="123456"
        required
      />

      <Input
        label="Nueva Contraseña"
        name="password"
        type="password"
        placeholder="••••••••"
        required
        minLength={8}
      />

      <Input
        label="Confirmar Contraseña"
        name="confirmPassword"
        type="password"
        placeholder="••••••••"
        required
        minLength={8}
      />

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Actualizando..." : "Cambiar Contraseña"}
      </Button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-light p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle level="h2">Restablecer Contraseña</CardTitle>
          <p className="text-dark opacity-75">Ingresa tu nueva contraseña</p>
        </CardHeader>
        <Suspense fallback={<div className="p-6 text-center">Cargando...</div>}>
          <ResetPasswordForm />
        </Suspense>
      </Card>
    </div>
  );
}
