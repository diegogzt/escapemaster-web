"use client";

import React, { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { Card } from "@/components/Card";
import Button from "@/components/Button";
import { payments as paymentsApi, bookings as bookingsApi } from "@/services/api";
import {
  CreditCard,
  DollarSign,
  RefreshCw,
  Search,
  ChevronLeft,
  ChevronRight,
  X,
  Loader2,
  Banknote,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
  Plus,
  RotateCcw,
} from "lucide-react";

interface Payment {
  id: string;
  booking_id: string;
  amount: number;
  payment_method: string;
  status: string;
  stripe_payment_intent_id?: string;
  stripe_charge_id?: string;
  receipt_url?: string;
  notes?: string;
  created_at: string;
  updated_at?: string;
}

interface PaymentListResponse {
  payments: Payment[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

const STATUS_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  succeeded: { label: "Completado", color: "text-green-700", bg: "bg-green-50" },
  pending: { label: "Pendiente", color: "text-yellow-700", bg: "bg-yellow-50" },
  failed: { label: "Fallido", color: "text-red-700", bg: "bg-red-50" },
  refunded: { label: "Reembolsado", color: "text-blue-700", bg: "bg-blue-50" },
  cancelled: { label: "Cancelado", color: "text-gray-700", bg: "bg-gray-50" },
};

const METHOD_LABELS: Record<string, { label: string; icon: React.ReactNode }> = {
  stripe: { label: "Stripe", icon: <CreditCard size={14} /> },
  card: { label: "Tarjeta", icon: <CreditCard size={14} /> },
  cash: { label: "Efectivo", icon: <Banknote size={14} /> },
  transfer: { label: "Transferencia", icon: <ArrowUpRight size={14} /> },
};

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // Totals computed from current data
  const [totals, setTotals] = useState({
    total: 0,
    succeeded: 0,
    pending: 0,
    refunded: 0,
  });

  // New payment form
  const [showNewPayment, setShowNewPayment] = useState(false);
  const [newPaymentLoading, setNewPaymentLoading] = useState(false);
  const [newPaymentForm, setNewPaymentForm] = useState({
    booking_id: "",
    amount: "",
    payment_method: "cash",
    notes: "",
  });

  // Refund state
  const [refundingId, setRefundingId] = useState<string | null>(null);

  const fetchPayments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params: Record<string, any> = { page, limit: 20 };
      if (statusFilter) params.status = statusFilter;
      if (dateFrom) params.date_from = dateFrom;
      if (dateTo) params.date_to = dateTo;

      const data = await paymentsApi.list(params);

      // Handle both response shapes: { payments, total, ... } or direct array
      if (Array.isArray(data)) {
        setPayments(data);
        setTotal(data.length);
        setTotalPages(1);
        computeTotals(data);
      } else {
        setPayments(data.payments || []);
        setTotal(data.total || 0);
        setTotalPages(data.total_pages || 1);
        computeTotals(data.payments || []);
      }
    } catch (err: any) {
      console.error("Error fetching payments:", err);
      setError(err?.response?.data?.detail || "Error cargando los pagos");
      setPayments([]);
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, dateFrom, dateTo]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  function computeTotals(paymentsList: Payment[]) {
    const result = { total: 0, succeeded: 0, pending: 0, refunded: 0 };
    paymentsList.forEach((p) => {
      const amount = Number(p.amount) || 0;
      result.total += amount;
      if (p.status === "succeeded") result.succeeded += amount;
      else if (p.status === "pending") result.pending += amount;
      else if (p.status === "refunded") result.refunded += amount;
    });
    setTotals(result);
  }

  const handleCreatePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPaymentForm.booking_id.trim()) return;
    try {
      setNewPaymentLoading(true);
      await paymentsApi.create({
        booking_id: newPaymentForm.booking_id.trim(),
        amount: newPaymentForm.amount ? Number(newPaymentForm.amount) : undefined,
        payment_method: newPaymentForm.payment_method,
        notes: newPaymentForm.notes || undefined,
      });
      setShowNewPayment(false);
      setNewPaymentForm({ booking_id: "", amount: "", payment_method: "cash", notes: "" });
      fetchPayments();
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || "Error al crear el pago");
    } finally {
      setNewPaymentLoading(false);
    }
  };

  const handleRefund = async (paymentId: string) => {
    if (!confirm("¿Estás seguro de procesar el reembolso?")) return;
    try {
      setRefundingId(paymentId);
      await paymentsApi.refund(paymentId);
      fetchPayments();
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || "Error al procesar el reembolso");
    } finally {
      setRefundingId(null);
    }
  };

  const clearFilters = () => {
    setStatusFilter("");
    setDateFrom("");
    setDateTo("");
    setPage(1);
  };

  if (loading && payments.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-2" />
          <p className="text-[var(--color-muted-foreground)]">Cargando pagos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 w-full pb-12 px-4 lg:px-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-[var(--color-background)] p-6 rounded-2xl border border-beige/50 shadow-sm">
        <div>
          <h1 className="text-3xl font-bold text-primary tracking-tight">Pagos</h1>
          <p className="text-[var(--color-foreground)]/60 mt-1">
            Gestión de pagos y cobros de la organización
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={fetchPayments} disabled={loading}>
            <RefreshCw size={16} className={`mr-2 ${loading ? "animate-spin" : ""}`} />
            Actualizar
          </Button>
          <Button variant="primary" onClick={() => setShowNewPayment(true)}>
            <Plus size={16} className="mr-2" />
            Registrar Pago
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <Card className="p-6 border-none shadow-sm bg-[var(--color-background)] hover:shadow-md transition-all">
          <div className="flex justify-between items-start mb-3">
            <div className="p-3 bg-primary/10 rounded-2xl text-primary">
              <DollarSign size={22} />
            </div>
          </div>
          <p className="text-sm font-medium text-[var(--color-muted-foreground)] mb-1">Total Recaudado</p>
          <h3 className="text-2xl font-bold text-[var(--color-foreground)]">
            {totals.succeeded.toLocaleString("es-ES", { minimumFractionDigits: 2 })}€
          </h3>
        </Card>

        <Card className="p-6 border-none shadow-sm bg-[var(--color-background)] hover:shadow-md transition-all">
          <div className="flex justify-between items-start mb-3">
            <div className="p-3 bg-yellow-100 rounded-2xl text-yellow-600">
              <Loader2 size={22} />
            </div>
          </div>
          <p className="text-sm font-medium text-[var(--color-muted-foreground)] mb-1">Pendientes</p>
          <h3 className="text-2xl font-bold text-[var(--color-foreground)]">
            {totals.pending.toLocaleString("es-ES", { minimumFractionDigits: 2 })}€
          </h3>
        </Card>

        <Card className="p-6 border-none shadow-sm bg-[var(--color-background)] hover:shadow-md transition-all">
          <div className="flex justify-between items-start mb-3">
            <div className="p-3 bg-blue-100 rounded-2xl text-blue-600">
              <RotateCcw size={22} />
            </div>
          </div>
          <p className="text-sm font-medium text-[var(--color-muted-foreground)] mb-1">Reembolsados</p>
          <h3 className="text-2xl font-bold text-[var(--color-foreground)]">
            {totals.refunded.toLocaleString("es-ES", { minimumFractionDigits: 2 })}€
          </h3>
        </Card>

        <Card className="p-6 border-none shadow-sm bg-[var(--color-background)] hover:shadow-md transition-all">
          <div className="flex justify-between items-start mb-3">
            <div className="p-3 bg-green-100 rounded-2xl text-green-600">
              <CreditCard size={22} />
            </div>
          </div>
          <p className="text-sm font-medium text-[var(--color-muted-foreground)] mb-1">Nº de Pagos</p>
          <h3 className="text-2xl font-bold text-[var(--color-foreground)]">{total}</h3>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4 border-none shadow-sm bg-[var(--color-background)]">
        <div className="flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-xs font-medium text-[var(--color-muted-foreground)] mb-1">Estado</label>
            <select
              className="bg-[var(--color-light)] border border-[var(--color-beige)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            >
              <option value="">Todos</option>
              <option value="succeeded">Completados</option>
              <option value="pending">Pendientes</option>
              <option value="failed">Fallidos</option>
              <option value="refunded">Reembolsados</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-[var(--color-muted-foreground)] mb-1">Desde</label>
            <input
              type="date"
              className="bg-[var(--color-light)] border border-[var(--color-beige)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              value={dateFrom}
              onChange={(e) => { setDateFrom(e.target.value); setPage(1); }}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[var(--color-muted-foreground)] mb-1">Hasta</label>
            <input
              type="date"
              className="bg-[var(--color-light)] border border-[var(--color-beige)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              value={dateTo}
              onChange={(e) => { setDateTo(e.target.value); setPage(1); }}
            />
          </div>
          {(statusFilter || dateFrom || dateTo) && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <X size={14} className="mr-1" /> Limpiar filtros
            </Button>
          )}
        </div>
      </Card>

      {/* Error state */}
      {error && (
        <Card className="p-6 border border-red-200 bg-red-50 text-red-700">
          <p className="font-medium">Error: {error}</p>
          <Button variant="ghost" size="sm" className="mt-2 text-red-600" onClick={fetchPayments}>
            Reintentar
          </Button>
        </Card>
      )}

      {/* Payments Table */}
      <Card className="border-none shadow-sm bg-[var(--color-background)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[var(--color-light)]/30 text-[var(--color-muted-foreground)] text-xs uppercase tracking-wider">
                <th className="px-6 py-4 font-bold">ID</th>
                <th className="px-6 py-4 font-bold">Reserva</th>
                <th className="px-6 py-4 font-bold">Método</th>
                <th className="px-6 py-4 font-bold">Estado</th>
                <th className="px-6 py-4 font-bold">Fecha</th>
                <th className="px-6 py-4 font-bold text-right">Monto</th>
                <th className="px-6 py-4 font-bold text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {payments.length > 0 ? (
                payments.map((payment) => {
                  const statusInfo = STATUS_LABELS[payment.status] || { label: payment.status, color: "text-gray-700", bg: "bg-gray-50" };
                  const methodInfo = METHOD_LABELS[payment.payment_method] || { label: payment.payment_method, icon: <CreditCard size={14} /> };
                  return (
                    <tr key={payment.id} className="hover:bg-[var(--color-light)]/20 transition-colors">
                      <td className="px-6 py-4 text-sm text-[var(--color-muted-foreground)] font-mono">
                        #{payment.id.substring(0, 8)}
                      </td>
                      <td className="px-6 py-4 text-sm text-[var(--color-muted-foreground)] font-mono">
                        #{payment.booking_id.substring(0, 8)}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1.5 text-sm text-[var(--color-foreground)]">
                          {methodInfo.icon}
                          {methodInfo.label}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${statusInfo.color} ${statusInfo.bg}`}>
                          {statusInfo.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-[var(--color-muted-foreground)]">
                        {payment.created_at
                          ? new Date(payment.created_at).toLocaleDateString("es-ES", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "-"}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-sm font-bold text-[var(--color-foreground)]">
                          {Number(payment.amount).toLocaleString("es-ES", { minimumFractionDigits: 2 })}€
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex justify-center gap-2">
                          {payment.receipt_url && (
                            <a
                              href={payment.receipt_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-primary hover:underline"
                            >
                              Recibo
                            </a>
                          )}
                          {payment.status === "succeeded" && (
                            <button
                              onClick={() => handleRefund(payment.id)}
                              disabled={refundingId === payment.id}
                              className="text-xs text-red-600 hover:underline disabled:opacity-50"
                            >
                              {refundingId === payment.id ? "Procesando..." : "Reembolsar"}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-[var(--color-muted-foreground)]">
                    {error ? "Error cargando pagos" : "No hay pagos registrados"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-[var(--color-beige)]">
            <p className="text-sm text-[var(--color-muted-foreground)]">
              Página {page} de {totalPages} · {total} pagos en total
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
              >
                <ChevronLeft size={16} />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
              >
                <ChevronRight size={16} />
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* New Payment Modal */}
      {showNewPayment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md bg-[var(--color-background)] p-0 overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-[var(--color-beige)]">
              <h2 className="text-lg font-bold text-[var(--color-foreground)]">Registrar Pago</h2>
              <button onClick={() => setShowNewPayment(false)} className="text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreatePayment} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--color-foreground)] mb-1">ID de Reserva *</label>
                <input
                  type="text"
                  placeholder="UUID de la reserva"
                  className="w-full bg-[var(--color-light)] border border-[var(--color-beige)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  value={newPaymentForm.booking_id}
                  onChange={(e) => setNewPaymentForm((f) => ({ ...f, booking_id: e.target.value }))}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--color-foreground)] mb-1">Monto (€)</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="Deja vacío para usar el precio de la reserva"
                  className="w-full bg-[var(--color-light)] border border-[var(--color-beige)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  value={newPaymentForm.amount}
                  onChange={(e) => setNewPaymentForm((f) => ({ ...f, amount: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--color-foreground)] mb-1">Método de Pago</label>
                <select
                  className="w-full bg-[var(--color-light)] border border-[var(--color-beige)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  value={newPaymentForm.payment_method}
                  onChange={(e) => setNewPaymentForm((f) => ({ ...f, payment_method: e.target.value }))}
                >
                  <option value="cash">Efectivo</option>
                  <option value="card">Tarjeta</option>
                  <option value="transfer">Transferencia</option>
                  <option value="stripe">Stripe</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--color-foreground)] mb-1">Notas</label>
                <textarea
                  placeholder="Notas opcionales"
                  className="w-full bg-[var(--color-light)] border border-[var(--color-beige)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                  rows={2}
                  value={newPaymentForm.notes}
                  onChange={(e) => setNewPaymentForm((f) => ({ ...f, notes: e.target.value }))}
                />
              </div>
              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => setShowNewPayment(false)}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button variant="primary" type="submit" disabled={newPaymentLoading} className="flex-1">
                  {newPaymentLoading ? (
                    <>
                      <Loader2 size={16} className="mr-2 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    "Registrar Pago"
                  )}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
