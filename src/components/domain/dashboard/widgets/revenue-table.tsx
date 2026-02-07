"use client";

import React, { useState, useEffect } from "react";
import { Filter, Download, Search, Loader2, AlertCircle } from "lucide-react";
import Input from "@/components/Input";
import { bookings as bookingsApi } from "@/services/api";

interface Transaction {
  id: string;
  date: string;
  concept: string;
  amount: number;
  status: "completed" | "pending" | "refunded";
  method: string;
}

export function RevenueTableWidget() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState("");

  // Fetch transactions from bookings API
  useEffect(() => {
    async function fetchTransactions() {
      try {
        setLoading(true);
        const bookingsResponse = await bookingsApi.list();
        const bList = Array.isArray(bookingsResponse?.bookings) ? bookingsResponse.bookings : (Array.isArray(bookingsResponse) ? bookingsResponse : []);
        
        // Transform bookings to transactions
        // API returns: id, start_time, booking_status, payment_status, total_price, remaining_balance, room_name, payment_method
        const transformedTransactions: Transaction[] = bList.map((b: any) => {
          const paidAmount = Number(b.total_price) - Number(b.remaining_balance) || 0;
          const status: "completed" | "pending" | "refunded" = 
            b.booking_status === "cancelled" ? "refunded" : 
            b.payment_status === "paid" || paidAmount >= Number(b.total_price) ? "completed" : 
            "pending";
          
          const startTime = b.start_time ? new Date(b.start_time) : null;
          
          return {
            id: `TRX-${b.id?.substring(0, 4) || "0000"}`,
            date: startTime ? startTime.toISOString().split("T")[0] : "",
            concept: `Reserva - ${b.room_name || "Sin sala"}`,
            amount: b.booking_status === "cancelled" ? -paidAmount : Number(b.total_price || 0),
            status,
            method: b.payment_method || "Web",
          };
        });
        
        // Sort by date descending
        transformedTransactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        
        setTransactions(transformedTransactions);
        setError(null);
      } catch (err) {
        console.error("Error fetching transactions:", err);
        setError("Error al cargar transacciones");
      } finally {
        setLoading(false);
      }
    }
    fetchTransactions();
  }, []);

  const filteredData = transactions.filter(
    (t) =>
      t.concept.toLowerCase().includes(filter.toLowerCase()) ||
      t.id.toLowerCase().includes(filter.toLowerCase())
  );

  if (loading) {
    return (
      <div className="bg-[var(--color-background)] p-6 rounded-xl shadow-sm border border-[var(--color-beige)] h-full flex items-center justify-center min-h-[200px]">
        <div className="text-center">
          <Loader2 className="w-6 h-6 animate-spin text-primary mx-auto mb-2" />
          <p className="text-[var(--color-muted-foreground)] text-sm">Cargando transacciones...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[var(--color-background)] p-6 rounded-xl shadow-sm border border-[var(--color-beige)] h-full flex items-center justify-center min-h-[200px]">
        <div className="text-center">
          <AlertCircle className="w-6 h-6 text-red-500 mx-auto mb-2" />
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[var(--color-background)] p-6 rounded-xl shadow-sm border border-[var(--color-beige)] h-full flex flex-col">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h3 className="font-semibold text-[var(--color-foreground)]">Registro de Transacciones</h3>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-muted-foreground)]" />
            <input
              type="text"
              placeholder="Buscar..."
              className="pl-9 pr-4 py-2 text-sm border border-[var(--color-beige)] rounded-lg focus:border-primary focus:outline-none w-full sm:w-48"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
          </div>
          <button className="p-2 border border-[var(--color-beige)] rounded-lg hover:bg-primary/10 hover:text-primary text-secondary" aria-label="Descargar">
            <Download className="h-4 w-4" />
          </button>
          <button className="p-2 border border-[var(--color-beige)] rounded-lg hover:bg-primary/10 hover:text-primary text-secondary" aria-label="Filtrar">
            <Download className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="overflow-x-auto flex-1">
        <table className="w-full text-sm text-left">
          <thead className="bg-[var(--color-light)] text-secondary font-medium">
            <tr>
              <th className="p-3 rounded-l-lg">ID</th>
              <th className="p-3">Fecha</th>
              <th className="p-3">Concepto</th>
              <th className="p-3">Método</th>
              <th className="p-3">Estado</th>
              <th className="p-3 text-right rounded-r-lg">Importe</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-beige">
            {filteredData.map((trx) => (
              <tr key={trx.id} className="hover:bg-[var(--color-light)] transition-colors">
                <td className="p-3 font-mono text-xs text-[var(--color-muted-foreground)]">
                  {trx.id}
                </td>
                <td className="p-3 text-[var(--color-foreground)]">{trx.date}</td>
                <td className="p-3 text-[var(--color-foreground)] font-medium">{trx.concept}</td>
                <td className="p-3 text-secondary">{trx.method}</td>
                <td className="p-3">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      trx.status === "completed"
                        ? "bg-primary/10 text-primary"
                        : trx.status === "pending"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {trx.status === "completed"
                      ? "Completado"
                      : trx.status === "pending"
                      ? "Pendiente"
                      : "Reembolsado"}
                  </span>
                </td>
                <td
                  className={`p-3 text-right font-bold ${
                    trx.amount < 0 ? "text-red-600" : "text-[var(--color-foreground)]"
                  }`}
                >
                  {trx.amount > 0 ? "+" : ""}
                  {trx.amount} €
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
