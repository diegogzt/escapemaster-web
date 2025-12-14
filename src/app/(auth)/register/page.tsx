"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Input from "@/components/Input";
import Button from "@/components/Button";
import { Card, CardHeader, CardTitle, CardFooter } from "@/components/Card";
import { auth } from "@/services/api";

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");

  // Check if user recently registered and saw confirmation screen
  useEffect(() => {
    const confirmationData = localStorage.getItem("email_confirmation");
    if (confirmationData) {
      try {
        const { timestamp, email } = JSON.parse(confirmationData);
        const hoursSinceConfirmation = (Date.now() - timestamp) / (1000 * 60 * 60);
        
        // If less than 24 hours, show the confirmation screen
        if (hoursSinceConfirmation < 24) {
          setRegisteredEmail(email);
          setSuccess(true);
        } else {
          localStorage.removeItem("email_confirmation");
        }
      } catch (e) {
        localStorage.removeItem("email_confirmation");
      }
    }
  }, []);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.target as HTMLFormElement);
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      await auth.register(name, email, password);
      
      // Save confirmation data with timestamp
      localStorage.setItem("email_confirmation", JSON.stringify({
        email,
        timestamp: Date.now()
      }));
      
      setRegisteredEmail(email);
      setSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Error al registrarse");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-light p-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
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
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
            <CardTitle level="h2">¡Revisa tu Email!</CardTitle>
            <p className="text-dark opacity-75 mt-2">
              Hemos enviado un enlace de confirmación a <strong>{registeredEmail}</strong>. Por
              favor, confirma tu cuenta para continuar.
            </p>
          </CardHeader>
          <CardFooter className="flex justify-center">
            <Link 
              href="/login"
              onClick={() => localStorage.removeItem("email_confirmation")}
            >
              <Button>Ya confirmé mi email - Ir al Login</Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-light p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle level="h2">Crear Cuenta</CardTitle>
          <p className="text-dark opacity-75">Únete a EscapeMaster hoy mismo</p>
        </CardHeader>
        <form onSubmit={handleRegister}>
          <div className="space-y-4">
            <Input
              name="name"
              label="Nombre Completo"
              placeholder="Juan Pérez"
              required
            />
            <Input
              name="email"
              label="Email"
              type="email"
              placeholder="tu@email.com"
              required
            />
            <Input
              name="password"
              label="Contraseña"
              type="password"
              placeholder="••••••••"
              required
            />
          </div>
          {error && <p className="text-red-500 text-sm mt-4">{error}</p>}
          <CardFooter>
            <Button type="submit" block loading={loading}>
              Registrarse
            </Button>
            <p className="text-center mt-4 text-sm text-gray-600">
              ¿Ya tienes cuenta?{" "}
              <Link href="/login" className="text-primary font-semibold">
                Inicia Sesión
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
