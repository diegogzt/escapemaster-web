"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Card, CardHeader, CardTitle } from "@/components/Card";
import Button from "@/components/Button";
import { users, bookings as bookingsApi } from "@/services/api";
import { toast } from "sonner";
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Calendar,
  Trophy,
  Clock,
  Star,
  Gamepad2,
  TrendingUp,
  Loader2,
} from "lucide-react";

export default function UserDetailPage() {
  const params = useParams();
  const userId = params.id as string;

  const [userData, setUserData] = useState<any>(null);
  const [bookingHistory, setBookingHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total_bookings: 0, total_spent: 0, escape_rate: 0, avg_time: 0, favorite_room: "" });

  useEffect(() => {
    async function load() {
      try {
        const u = await users.get(userId);
        setUserData(u);

        // Try to get booking history for this user
        try {
          const bData = await bookingsApi.list({ guest_id: userId, page_size: 20 });
          const list = Array.isArray(bData) ? bData : bData.bookings || bData.items || [];
          setBookingHistory(list);

          // Compute stats from history
          const total = list.length;
          const spent = list.reduce((sum: number, b: any) => sum + (Number(b.total_price) || 0), 0);
          const escaped = list.filter((b: any) => b.result?.escaped).length;
          const times = list.filter((b: any) => b.result?.escape_time_seconds).map((b: any) => b.result.escape_time_seconds);
          const roomCounts: Record<string, number> = {};
          list.forEach((b: any) => { const r = b.room_name || ""; roomCounts[r] = (roomCounts[r] || 0) + 1; });
          const fav = Object.entries(roomCounts).sort((a, b) => b[1] - a[1])[0];

          setStats({
            total_bookings: total,
            total_spent: spent,
            escape_rate: total > 0 ? Math.round((escaped / total) * 100) : 0,
            avg_time: times.length > 0 ? Math.round(times.reduce((a: number, b: number) => a + b, 0) / times.length / 60) : 0,
            favorite_room: fav ? fav[0] : "—",
          });
        } catch { /* no bookings */ }
      } catch {
        toast.error("Error al cargar el perfil del usuario");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [userId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 mb-4">Usuario no encontrado</p>
        <Link href="/users"><Button variant="secondary">Volver</Button></Link>
      </div>
    );
  }

  return (
    <div className="w-full pb-12">
      <Link href="/users" className="text-primary flex items-center text-sm mb-4 hover:underline">
        <ArrowLeft size={16} className="mr-1" /> Volver a usuarios
      </Link>

      {/* Header */}
      <div className="flex items-center gap-6 mb-8">
        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-primary text-3xl font-bold border-2 border-beige">
          {userData.full_name?.charAt(0) || "U"}
        </div>
        <div>
          <h1 className="text-3xl font-bold text-primary">{userData.full_name}</h1>
          <div className="flex items-center gap-4 text-[var(--color-muted-foreground)] text-sm mt-1">
            {userData.email && <span className="flex items-center gap-1"><Mail size={14} /> {userData.email}</span>}
            {userData.phone && <span className="flex items-center gap-1"><Phone size={14} /> {userData.phone}</span>}
            <span className="flex items-center gap-1"><Calendar size={14} /> Cliente desde {new Date(userData.created_at || Date.now()).toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        {[
          { label: "Reservas", value: stats.total_bookings, icon: <Gamepad2 size={20} /> },
          { label: "Gastado", value: `${stats.total_spent.toFixed(0)}€`, icon: <TrendingUp size={20} /> },
          { label: "Tasa Escape", value: `${stats.escape_rate}%`, icon: <Trophy size={20} /> },
          { label: "Tiempo Medio", value: `${stats.avg_time} min`, icon: <Clock size={20} /> },
          { label: "Sala Favorita", value: stats.favorite_room || "—", icon: <Star size={20} /> },
        ].map((s, i) => (
          <Card key={i} className="p-4 text-center border-beige">
            <div className="text-primary mx-auto mb-2">{s.icon}</div>
            <p className="text-2xl font-bold text-[var(--color-foreground)]">{s.value}</p>
            <p className="text-xs text-[var(--color-muted-foreground)]">{s.label}</p>
          </Card>
        ))}
      </div>

      {/* Booking History */}
      <Card className="border-beige">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar size={20} className="text-primary" />
            Historial de Reservas
          </CardTitle>
        </CardHeader>
        <div className="p-0">
          {bookingHistory.length === 0 ? (
            <p className="text-sm text-[var(--color-muted-foreground)] text-center py-8 italic">Sin reservas registradas</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-[var(--color-light)] text-xs uppercase text-[var(--color-muted-foreground)]">
                  <tr>
                    <th className="px-4 py-3">Fecha</th>
                    <th className="px-4 py-3">Sala</th>
                    <th className="px-4 py-3">Estado</th>
                    <th className="px-4 py-3 text-right">Importe</th>
                    <th className="px-4 py-3 text-center">Resultado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {bookingHistory.map((b: any) => (
                    <tr key={b.id} className="hover:bg-[var(--color-light)]/50">
                      <td className="px-4 py-3">{b.start_time ? new Date(b.start_time).toLocaleDateString() : "—"}</td>
                      <td className="px-4 py-3 font-medium">{b.room_name || "—"}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                          b.booking_status === "completed" ? "bg-green-100 text-green-700" :
                          b.booking_status === "cancelled" ? "bg-red-100 text-red-600" :
                          "bg-yellow-100 text-yellow-800"
                        }`}>
                          {b.booking_status || "pendiente"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">{Number(b.total_price || 0).toFixed(2)}€</td>
                      <td className="px-4 py-3 text-center">
                        {b.result?.escaped === true ? (
                          <span className="text-green-600">✓ Escapó</span>
                        ) : b.result?.escaped === false ? (
                          <span className="text-red-500">✗ No escapó</span>
                        ) : (
                          <span className="text-[var(--color-muted-foreground)]">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
