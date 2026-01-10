"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import {
  CheckCircle,
  CreditCard,
  Lock,
  Calendar,
  Clock,
  MapPin,
} from "lucide-react";

export default function PlayerPaymentPage() {
  const params = useParams();
  const [isPaid, setIsPaid] = useState(false);
  const [loading, setLoading] = useState(false);

  // Mock data based on token
  const bookingData = {
    room_name: "La Prisión de Alcatraz",
    date: "25 de Diciembre, 2023",
    time: "18:00",
    location: "Calle Falsa 123, Madrid",
    amount: 30.0,
    player_name: "Juan Pérez",
  };

  const handlePayment = () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      setIsPaid(true);
    }, 2000);
  };

  if (isPaid) {
    return (
      <div className="min-h-screen bg-[var(--color-background-soft)] flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={40} className="text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-[var(--color-foreground)] mb-2">
            ¡Pago Realizado!
          </h1>
          <p className="text-[var(--color-muted-foreground)] mb-6">
            Gracias {bookingData.player_name}, tu plaza para{" "}
            <strong>{bookingData.room_name}</strong> está confirmada.
          </p>
          <div className="bg-[var(--color-background-soft)] p-4 rounded-lg text-left mb-6">
            <div className="flex items-center text-sm text-[var(--color-muted-foreground)] mb-2">
              <Calendar size={16} className="mr-2" /> {bookingData.date}
            </div>
            <div className="flex items-center text-sm text-[var(--color-muted-foreground)]">
              <Clock size={16} className="mr-2" /> {bookingData.time}
            </div>
          </div>
          <p className="text-xs text-[var(--color-muted-foreground)]">
            Recibirás un correo con los detalles de tu reserva.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-background-soft)] flex flex-col items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden max-w-md w-full">
        {/* Header */}
        <div className="bg-primary p-6 text-white text-center">
          <h2 className="text-xl font-bold mb-1">Pasarela de Pago</h2>
          <p className="opacity-80 text-sm">Escape Master</p>
        </div>

        {/* Content */}
        <div className="p-8">
          <div className="mb-8 text-center">
            <p className="text-[var(--color-muted-foreground)] text-sm uppercase tracking-wide mb-1">
              Total a pagar
            </p>
            <h1 className="text-4xl font-bold text-[var(--color-foreground)]">
              {bookingData.amount.toFixed(2)}€
            </h1>
          </div>

          <div className="space-y-4 mb-8">
            <div className="flex items-start p-4 bg-[var(--color-background-soft)] rounded-lg">
              <div className="bg-white p-2 rounded shadow-sm mr-4">
                <MapPin size={20} className="text-primary" />
              </div>
              <div>
                <h3 className="font-bold text-[var(--color-foreground)]">
                  {bookingData.room_name}
                </h3>
                <p className="text-sm text-[var(--color-muted-foreground)]">{bookingData.location}</p>
              </div>
            </div>

            <div className="flex justify-between text-sm text-[var(--color-muted-foreground)] px-2">
              <span className="flex items-center">
                <Calendar size={14} className="mr-1" /> {bookingData.date}
              </span>
              <span className="flex items-center">
                <Clock size={14} className="mr-1" /> {bookingData.time}
              </span>
            </div>
          </div>

          <button
            onClick={handlePayment}
            disabled={loading}
            className="w-full bg-primary text-white font-bold py-4 rounded-xl shadow-lg hover:bg-primary/90 transition-all transform active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {loading ? (
              <span className="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
            ) : (
              <CreditCard size={20} className="mr-2" />
            )}
            {loading
              ? "Procesando..."
              : `Pagar ${bookingData.amount.toFixed(2)}€`}
          </button>

          <div className="mt-6 text-center flex items-center justify-center text-xs text-[var(--color-muted-foreground)]">
            <Lock size={12} className="mr-1" />
            Pago seguro encriptado SSL
          </div>
        </div>
      </div>
    </div>
  );
}
