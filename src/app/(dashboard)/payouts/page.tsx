"use client";

import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle } from "@/components/Card";
import Button from "@/components/Button";
import { payouts } from "@/services/api";
import { toast } from "sonner";
import {
  Wallet,
  Download,
  Loader2,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  CheckCircle,
  Search,
  Calendar,
  TrendingUp,
} from "lucide-react";

export default function PayoutsPage() {
  const [payoutList, setPayoutList] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [downloading, setDownloading] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [list, sum] = await Promise.allSettled([
        payouts.list(),
        payouts.getSummary(),
      ]);
      if (list.status === "fulfilled") {
        const data = list.value;
        setPayoutList(Array.isArray(data) ? data : data.items || []);
      }
      if (sum.status === "fulfilled") setSummary(sum.value);
    } catch { /* graceful */ }
    finally { setLoading(false); }
  }

  const handleDownloadInvoice = async (payoutId: string) => {
    setDownloading(payoutId);
    try {
      const blob = await payouts.getInvoice(payoutId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `payout-${payoutId}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch {
      toast.error("Error al descargar factura");
    } finally {
      setDownloading(null);
    }
  };

  const statusBadge = (status: string) => {
    const map: Record<string, { label: string; class: string }> = {
      completed: { label: "Completado", class: "bg-green-100 text-green-800" },
      pending: { label: "Pendiente", class: "bg-yellow-100 text-yellow-800" },
      processing: { label: "Procesando", class: "bg-blue-100 text-blue-800" },
      failed: { label: "Fallido", class: "bg-red-100 text-red-800" },
    };
    const s = map[status] || { label: status, class: "bg-gray-100 text-gray-700" };
    return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${s.class}`}>{s.label}</span>;
  };

  const filtered = payoutList.filter(p => {
    const matchSearch = !searchTerm || p.id?.includes(searchTerm) || p.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === "all" || p.status === statusFilter;
    return matchSearch && matchStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="w-full pb-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-primary flex items-center gap-2">
          <Wallet size={28} />
          Pagos y Liquidaciones
        </h1>
        <p className="text-[var(--color-foreground)] opacity-60">
          Gestiona tus liquidaciones, consulta el historial de pagos y descarga facturas.
        </p>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="border-beige p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-50">
                <ArrowUpRight size={20} className="text-green-600" />
              </div>
              <div>
                <p className="text-xs text-[var(--color-muted-foreground)]">Total Recibido</p>
                <p className="text-xl font-bold text-[var(--color-foreground)]">{(summary.total_paid || 0).toFixed(2)} €</p>
              </div>
            </div>
          </Card>
          <Card className="border-beige p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-yellow-50">
                <Clock size={20} className="text-yellow-600" />
              </div>
              <div>
                <p className="text-xs text-[var(--color-muted-foreground)]">Pendiente</p>
                <p className="text-xl font-bold text-[var(--color-foreground)]">{(summary.pending_amount || 0).toFixed(2)} €</p>
              </div>
            </div>
          </Card>
          <Card className="border-beige p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-50">
                <TrendingUp size={20} className="text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-[var(--color-muted-foreground)]">Este Mes</p>
                <p className="text-xl font-bold text-[var(--color-foreground)]">{(summary.current_month || 0).toFixed(2)} €</p>
              </div>
            </div>
          </Card>
          <Card className="border-beige p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-50">
                <Calendar size={20} className="text-purple-600" />
              </div>
              <div>
                <p className="text-xs text-[var(--color-muted-foreground)]">Próximo Pago</p>
                <p className="text-xl font-bold text-[var(--color-foreground)]">
                  {summary.next_payout_date ? new Date(summary.next_payout_date).toLocaleDateString() : "—"}
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card className="border-beige mb-6">
        <div className="p-4 flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2 flex-1 min-w-[200px]">
            <Search size={16} className="text-[var(--color-muted-foreground)]" />
            <input
              type="text"
              placeholder="Buscar por ID o descripción..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full px-3 py-1.5 border border-beige rounded-lg text-sm"
            />
          </div>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 border border-beige rounded-lg text-sm"
          >
            <option value="all">Todos los estados</option>
            <option value="completed">Completado</option>
            <option value="pending">Pendiente</option>
            <option value="processing">Procesando</option>
            <option value="failed">Fallido</option>
          </select>
        </div>
      </Card>

      {/* Payout List */}
      <Card className="border-beige overflow-hidden">
        <CardHeader>
          <CardTitle>Historial de Liquidaciones</CardTitle>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[var(--color-light)]">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-[var(--color-muted-foreground)]">Fecha</th>
                <th className="text-left px-4 py-3 font-medium text-[var(--color-muted-foreground)]">ID</th>
                <th className="text-left px-4 py-3 font-medium text-[var(--color-muted-foreground)]">Descripción</th>
                <th className="text-right px-4 py-3 font-medium text-[var(--color-muted-foreground)]">Importe</th>
                <th className="text-center px-4 py-3 font-medium text-[var(--color-muted-foreground)]">Estado</th>
                <th className="text-center px-4 py-3 font-medium text-[var(--color-muted-foreground)]">Factura</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-beige)]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-[var(--color-muted-foreground)]">
                    No hay liquidaciones registradas
                  </td>
                </tr>
              ) : (
                filtered.map((p: any, i: number) => (
                  <tr key={p.id || i} className="hover:bg-[var(--color-light)]/50 transition-colors">
                    <td className="px-4 py-3">
                      {p.created_at ? new Date(p.created_at).toLocaleDateString() : "—"}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs">{p.id?.slice(0, 8)}...</td>
                    <td className="px-4 py-3">{p.description || "Liquidación periódica"}</td>
                    <td className="px-4 py-3 text-right font-semibold">{(p.amount || 0).toFixed(2)} €</td>
                    <td className="px-4 py-3 text-center">{statusBadge(p.status)}</td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => handleDownloadInvoice(p.id)}
                        disabled={downloading === p.id}
                        className="text-primary hover:text-primary/80 transition-colors disabled:opacity-50"
                        title="Descargar factura"
                      >
                        {downloading === p.id ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
