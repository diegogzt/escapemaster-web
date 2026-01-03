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
  const [step, setStep] = useState<"register" | "verify">("register");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [registeredEmail, setRegisteredEmail] = useState("");

  // Check if user was in the middle of verification
  useEffect(() => {
    const pendingVerification = localStorage.getItem("pending_email_verification");
    if (pendingVerification) {
      try {
        const { email, timestamp } = JSON.parse(pendingVerification);
        const minutesSince = (Date.now() - timestamp) / (1000 * 60);
        
        // If less than 15 minutes, resume verification
        if (minutesSince < 15) {
          setRegisteredEmail(email);
          setStep("verify");
        } else {
          localStorage.removeItem("pending_email_verification");
        }
      } catch (e) {
        localStorage.removeItem("pending_email_verification");
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
    const organizationName = formData.get("organizationName") as string;

    try {
      // 1. Register the user
      await auth.register(name, email, password, organizationName);
      
      // 2. Send verification code
      await auth.sendVerificationCode(email);

      // Save email for verification step
      localStorage.setItem(
        "pending_email_verification",
        JSON.stringify({
          email,
          timestamp: Date.now(),
        })
      );

      setRegisteredEmail(email);
      setStep("verify");
      setSuccessMessage("Código enviado. Revisa tu correo.");
    } catch (err: any) {
      setError(err.response?.data?.detail || "Error al registrarse");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccessMessage("");

    const formData = new FormData(e.target as HTMLFormElement);
    const code = formData.get("code") as string;

    try {
      await auth.verifyEmailCode(registeredEmail, code);
      
      // Clear pending verification
      localStorage.removeItem("pending_email_verification");
      
      setSuccessMessage("¡Email verificado! Redirigiendo al login...");
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Código inválido o expirado");
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setLoading(true);
    setError("");
    setSuccessMessage("");
    try {
      await auth.sendVerificationCode(registeredEmail);
      setSuccessMessage("Nuevo código enviado. Revisa tu correo.");
    } catch (err: any) {
      setError(err.response?.data?.detail || "Error al reenviar código");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify Email Code
  if (step === "verify") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-light p-4">
        <Card className="w-full max-w-md">
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
            <CardTitle level="h2">Verifica tu Email</CardTitle>
            <p className="text-dark opacity-75 mt-2">
              Hemos enviado un código de 6 dígitos a{" "}
              <strong>{registeredEmail}</strong>
            </p>
          </CardHeader>

          <div className="p-6 space-y-4">
            {error && (
              <div className="bg-red-50 text-red-500 p-3 rounded-md text-sm">
                {error}
              </div>
            )}
            {successMessage && (
              <div className="bg-green-50 text-green-600 p-3 rounded-md text-sm">
                {successMessage}
              </div>
            )}

            <form onSubmit={handleVerifyCode} className="space-y-4">
              <Input
                label="Código de Verificación"
                name="code"
                type="text"
                placeholder="123456"
                maxLength={6}
                required
                className="text-center text-2xl tracking-widest"
              />
              <Button type="submit" block loading={loading}>
                {loading ? "Verificando..." : "Verificar Email"}
              </Button>
            </form>

            <div className="text-center space-y-2">
              <p className="text-sm text-gray-500">¿No recibiste el código?</p>
              <button
                type="button"
                onClick={handleResendCode}
                disabled={loading}
                className="text-primary font-semibold hover:underline disabled:opacity-50"
              >
                Reenviar código
              </button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  // Step 1: Registration Form
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
              name="organizationName"
              label="Nombre de tu Escape Room"
              placeholder="Ej. Mystery Escape"
              required
            />
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
