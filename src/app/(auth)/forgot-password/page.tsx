"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Input from "@/components/Input";
import Button from "@/components/Button";
import { Card, CardHeader, CardTitle, CardFooter } from "@/components/Card";
import { auth } from "@/services/api";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<"request" | "verify">("request");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [email, setEmail] = useState("");

  // Step 1: Request Code
  const handleRequestCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccessMessage("");

    const formData = new FormData(e.target as HTMLFormElement);
    const inputEmail = (formData.get("email") as string).toLowerCase();
    setEmail(inputEmail);

    try {
      await auth.forgotPassword(inputEmail);
      setStep("verify");
      setSuccessMessage("Código enviado. Revisa tu correo.");
    } catch (err: any) {
      setError(err.response?.data?.detail || "Error al solicitar recuperación");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify Code & Reset Password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccessMessage("");

    const formData = new FormData(e.target as HTMLFormElement);
    const code = formData.get("code") as string;
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    try {
      await auth.resetPassword(email, code, password);
      setSuccessMessage("¡Contraseña actualizada! Redirigiendo...");
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Error al restablecer la contraseña");
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setLoading(true);
    setError("");
    setSuccessMessage("");
    try {
      await auth.forgotPassword(email);
      setSuccessMessage("Nuevo código enviado.");
    } catch (err: any) {
      setError(err.response?.data?.detail || "Error al reenviar código");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-light p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle level="h2">
            {step === "request" ? "Recuperar Contraseña" : "Restablecer Contraseña"}
          </CardTitle>
          <p className="text-[var(--color-foreground)] opacity-75">
            {step === "request"
              ? "Ingresa tu email para recibir instrucciones"
              : `Ingresa el código enviado a ${email}`}
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

          {step === "request" ? (
            <form onSubmit={handleRequestCode} className="space-y-4">
              <Input
                label="Email"
                name="email"
                type="email"
                placeholder="tu@email.com"
                required
                defaultValue={email}
              />
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Enviando..." : "Enviar Instrucciones"}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <Input
                label="Código de Verificación"
                name="code"
                type="text"
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
              
              <div className="text-center mt-4">
                <button
                  type="button"
                  onClick={handleResendCode}
                  disabled={loading}
                  className="text-sm text-primary hover:underline"
                >
                  ¿No recibiste el código? Reenviar
                </button>
              </div>
            </form>
          )}
        </div>

        <CardFooter className="flex justify-center border-t pt-4">
          <p className="text-sm text-[var(--color-foreground)] opacity-75">
            ¿Te acordaste?{" "}
            <Link
              href="/login"
              className="text-primary hover:underline font-medium"
            >
              Iniciar Sesión
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
