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
    const inputEmail = (formData.get("email") as string).toLowerCase().trim();
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
      setLoading(false);
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
    <div className="min-h-screen flex items-center justify-center bg-primary p-4 relative overflow-hidden">
      <div className="w-full max-w-md z-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
        <Card className="w-full max-w-none shadow-2xl border-white/20 backdrop-blur-md bg-white/10 overflow-hidden">
          <CardHeader className="text-center pb-2 border-white/10 pt-8">
            <CardTitle level="h2" className="text-2xl font-bold text-white">
              {step === "request" ? "Recuperar Contraseña" : "Restablecer Contraseña"}
            </CardTitle>
            <p className="text-white/70 mt-2 text-sm">
              {step === "request"
                ? "Ingresa tu email para recibir un código de verificación"
                : `Ingresa el código enviado a ${email}`}
            </p>
          </CardHeader>

          <div className="p-6 space-y-4">
            {error && (
              <div className="bg-red-500/20 border border-red-500/50 text-red-200 p-3 rounded-md text-xs font-semibold animate-shake">
                {error}
              </div>
            )}
            {successMessage && ( step === "request" || !error) && (
              <div className="bg-green-500/20 border border-green-500/50 text-green-200 p-3 rounded-md text-xs font-semibold">
                {successMessage}
              </div>
            )}

            {step === "request" ? (
              <form onSubmit={handleRequestCode} className="space-y-6">
                <Input
                  label="Email"
                  name="email"
                  type="email"
                  placeholder="tu@email.com"
                  required
                  defaultValue={email}
                  labelClassName="text-white"
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:bg-white/20 focus:border-white/50 transition-all"
                />
                <Button type="submit" block loading={loading} className="bg-white text-primary font-bold">
                  Enviar Código
                </Button>
              </form>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-5">
                <Input
                  label="Código de Verificación"
                  name="code"
                  type="text"
                  placeholder="123456"
                  required
                  maxLength={6}
                  labelClassName="text-white"
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:bg-white/20 focus:border-white/50 transition-all"
                />
                <Input
                  label="Nueva Contraseña"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  required
                  minLength={8}
                  labelClassName="text-white"
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:bg-white/20 focus:border-white/50 transition-all"
                />
                <Input
                  label="Confirmar Contraseña"
                  name="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  required
                  minLength={8}
                  labelClassName="text-white"
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:bg-white/20 focus:border-white/50 transition-all"
                />
                <Button type="submit" block loading={loading} className="bg-white text-primary font-bold">
                  {loading ? "Actualizando..." : "Cambiar Contraseña"}
                </Button>
                
                <div className="text-center mt-2">
                  <button
                    type="button"
                    onClick={handleResendCode}
                    disabled={loading}
                    className="text-xs text-white/50 hover:text-white transition-colors"
                  >
                    ¿No recibiste el código? <span className="underline">Reenviar</span>
                  </button>
                </div>
              </form>
            )}
          </div>

          <CardFooter className="flex justify-center border-white/10 pt-2 pb-8">
            <p className="text-sm text-white/50">
              ¿Te acordaste?{" "}
              <Link
                href="/login"
                className="text-white hover:underline font-medium"
              >
                Inicia Sesión
              </Link>
            </p>
          </CardFooter>
        </Card>

        <p className="text-center text-xs text-white/40 mt-8">
          &copy; {new Date().getFullYear()} EscapeMaster. Todos los derechos
          reservados.
        </p>
      </div>
    </div>
  );
}
