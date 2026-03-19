"use client";

import React, { useState, useEffect } from "react";
import { Card } from "@/components/Card";
import Button from "@/components/Button";
import { coupons as couponsApi, rooms as roomsApi } from "@/services/api";
import { toast } from "sonner";
import {
  Tags,
  Plus,
  Search,
  Percent,
  DollarSign,
  Copy,
  Edit3,
  Trash2,
  Loader2,
  ArrowLeft,
  Calendar,
  Hash,
  Zap,
} from "lucide-react";

interface Coupon {
  id: string;
  code: string;
  discount_type: "percentage" | "fixed";
  discount_value: number;
  room_id: string | null;
  min_booking_amount: number | null;
  max_uses: number | null;
  current_uses: number;
  valid_until: string | null;
  is_active: boolean;
  created_at: string;
}

type View = "list" | "form";

export default function CouponsPage() {
  const [couponsList, setCouponsList] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showActive, setShowActive] = useState<boolean | undefined>(undefined);
  const [view, setView] = useState<View>("list");
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [allRooms, setAllRooms] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    code: "",
    discount_type: "percentage" as "percentage" | "fixed",
    discount_value: 10,
    room_id: "",
    min_booking_amount: "",
    max_uses: "",
    valid_until: "",
    is_active: true,
  });

  useEffect(() => {
    fetchCoupons();
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      const data = await roomsApi.list();
      setAllRooms(Array.isArray(data?.rooms) ? data.rooms : Array.isArray(data) ? data : []);
    } catch { /* ignore */ }
  };

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const data = await couponsApi.list({ search: search || undefined, is_active: showActive });
      setCouponsList(Array.isArray(data?.coupons) ? data.coupons : Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load coupons:", err);
      toast.error("Error al cargar cupones");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, [showActive]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchCoupons();
  };

  const generateCode = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    const code = Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
    setForm(f => ({ ...f, code }));
  };

  const openCreate = () => {
    setEditingCoupon(null);
    setForm({ code: "", discount_type: "percentage", discount_value: 10, room_id: "", min_booking_amount: "", max_uses: "", valid_until: "", is_active: true });
    generateCode();
    setView("form");
  };

  const openEdit = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setForm({
      code: coupon.code,
      discount_type: coupon.discount_type,
      discount_value: coupon.discount_value,
      room_id: coupon.room_id || "",
      min_booking_amount: coupon.min_booking_amount?.toString() || "",
      max_uses: coupon.max_uses?.toString() || "",
      valid_until: coupon.valid_until ? coupon.valid_until.split("T")[0] : "",
      is_active: coupon.is_active,
    });
    setView("form");
  };

  const handleSave = async () => {
    if (!form.code.trim()) { toast.error("El código es obligatorio"); return; }
    if (form.discount_value <= 0) { toast.error("El valor del descuento debe ser mayor a 0"); return; }

    setSaving(true);
    try {
      const payload: any = {
        code: form.code.toUpperCase(),
        discount_type: form.discount_type,
        discount_value: form.discount_value,
        is_active: form.is_active,
      };
      if (form.room_id) payload.room_id = form.room_id;
      if (form.min_booking_amount) payload.min_booking_amount = +form.min_booking_amount;
      if (form.max_uses) payload.max_uses = +form.max_uses;
      if (form.valid_until) payload.valid_until = form.valid_until;

      if (editingCoupon) {
        await couponsApi.update(editingCoupon.id, payload);
        toast.success("Cupón actualizado");
      } else {
        await couponsApi.create(payload);
        toast.success("Cupón creado");
      }
      setView("list");
      fetchCoupons();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Error al guardar cupón");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Desactivar este cupón?")) return;
    try {
      await couponsApi.delete(id);
      toast.success("Cupón desactivado");
      fetchCoupons();
    } catch {
      toast.error("Error al desactivar cupón");
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success(`Código ${code} copiado`);
  };

  // === FORM VIEW ===
  if (view === "form") {
    return (
      <div className="p-6 md:p-8">
        <div className="max-w-lg mx-auto">
          {/* Back button */}
          <button
            onClick={() => setView("list")}
            className="flex items-center gap-2 text-sm font-medium text-[var(--color-muted-foreground)] hover:text-[var(--color-primary)] transition-colors mb-6"
          >
            <ArrowLeft size={16} />
            Volver a cupones
          </button>

          {/* Form header */}
          <div className="mb-8">
            <h1 className="text-3xl font-black tracking-tight text-[var(--color-primary)]">
              {editingCoupon ? "Editar cupón" : "Crear cupón"}
            </h1>
            <p className="text-[var(--color-muted-foreground)] mt-1">
              {editingCoupon ? "Modifica los datos del cupón" : "Configura un nuevo cupón de descuento"}
            </p>
          </div>

          <div className="rounded-3xl border border-[var(--color-beige)] bg-[var(--color-background)] p-6 space-y-6">
            {/* Code field */}
            <div>
              <label className="text-sm font-semibold mb-2 block text-[var(--color-primary)]">
                Código del cupón
              </label>
              <div className="flex gap-2">
                <input
                  value={form.code}
                  onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))}
                  className="flex-1 px-4 py-3 border border-[var(--color-beige)] rounded-xl font-mono font-black text-xl tracking-widest bg-[var(--color-light)] focus:outline-none focus:border-[var(--color-primary)] transition-colors"
                  placeholder="CODIGO"
                />
                <button
                  onClick={generateCode}
                  className="flex items-center gap-2 px-4 py-3 rounded-xl border border-[var(--color-beige)] text-sm font-semibold text-[var(--color-primary)] hover:bg-[var(--color-light)] transition-colors whitespace-nowrap"
                >
                  <Zap size={15} />
                  Generar
                </button>
              </div>
            </div>

            {/* Discount type toggle */}
            <div>
              <label className="text-sm font-semibold mb-3 block text-[var(--color-primary)]">
                Tipo de descuento
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setForm(f => ({ ...f, discount_type: "percentage" }))}
                  className={`flex flex-col items-center gap-1.5 p-4 rounded-2xl border-2 font-semibold transition-all ${
                    form.discount_type === "percentage"
                      ? "border-[var(--color-primary)] bg-[var(--color-primary)]/5 text-[var(--color-primary)]"
                      : "border-[var(--color-beige)] text-[var(--color-muted-foreground)] hover:border-[var(--color-primary)]/40"
                  }`}
                >
                  <Percent size={22} />
                  <span className="text-sm">Porcentaje</span>
                </button>
                <button
                  onClick={() => setForm(f => ({ ...f, discount_type: "fixed" }))}
                  className={`flex flex-col items-center gap-1.5 p-4 rounded-2xl border-2 font-semibold transition-all ${
                    form.discount_type === "fixed"
                      ? "border-[var(--color-primary)] bg-[var(--color-primary)]/5 text-[var(--color-primary)]"
                      : "border-[var(--color-beige)] text-[var(--color-muted-foreground)] hover:border-[var(--color-primary)]/40"
                  }`}
                >
                  <DollarSign size={22} />
                  <span className="text-sm">Cantidad fija</span>
                </button>
              </div>
            </div>

            {/* Discount value */}
            <div>
              <label className="text-sm font-semibold mb-2 block text-[var(--color-primary)]">
                Valor del descuento{" "}
                <span className="text-[var(--color-muted-foreground)] font-normal">
                  {form.discount_type === "percentage" ? "(%)" : "(€)"}
                </span>
              </label>
              <input
                type="number"
                min={0}
                max={form.discount_type === "percentage" ? 100 : 9999}
                value={form.discount_value}
                onChange={e => setForm(f => ({ ...f, discount_value: +e.target.value }))}
                className="w-full px-4 py-3 border border-[var(--color-beige)] rounded-xl text-2xl font-black text-[var(--color-primary)] bg-[var(--color-light)] focus:outline-none focus:border-[var(--color-primary)] transition-colors"
              />
            </div>

            {/* Room selector */}
            <div>
              <label className="text-sm font-semibold mb-2 block text-[var(--color-primary)]">
                Sala específica{" "}
                <span className="text-[var(--color-muted-foreground)] font-normal">(opcional)</span>
              </label>
              <select
                value={form.room_id}
                onChange={e => setForm(f => ({ ...f, room_id: e.target.value }))}
                className="w-full px-4 py-3 border border-[var(--color-beige)] rounded-xl bg-[var(--color-background)] focus:outline-none focus:border-[var(--color-primary)] transition-colors"
              >
                <option value="">Todas las salas</option>
                {allRooms.map(r => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
              </select>
            </div>

            {/* Optional grid fields */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold mb-2 block text-[var(--color-primary)]">
                  Monto mínimo{" "}
                  <span className="text-[var(--color-muted-foreground)] font-normal">(€)</span>
                </label>
                <input
                  type="number"
                  min={0}
                  value={form.min_booking_amount}
                  onChange={e => setForm(f => ({ ...f, min_booking_amount: e.target.value }))}
                  className="w-full px-4 py-3 border border-[var(--color-beige)] rounded-xl bg-[var(--color-light)] focus:outline-none focus:border-[var(--color-primary)] transition-colors"
                  placeholder="Sin mínimo"
                />
              </div>
              <div>
                <label className="text-sm font-semibold mb-2 block text-[var(--color-primary)]">
                  Usos máximos
                </label>
                <input
                  type="number"
                  min={0}
                  value={form.max_uses}
                  onChange={e => setForm(f => ({ ...f, max_uses: e.target.value }))}
                  className="w-full px-4 py-3 border border-[var(--color-beige)] rounded-xl bg-[var(--color-light)] focus:outline-none focus:border-[var(--color-primary)] transition-colors"
                  placeholder="Ilimitado"
                />
              </div>
            </div>

            {/* Valid until */}
            <div>
              <label className="text-sm font-semibold mb-2 block text-[var(--color-primary)]">
                Válido hasta{" "}
                <span className="text-[var(--color-muted-foreground)] font-normal">(opcional)</span>
              </label>
              <input
                type="date"
                value={form.valid_until}
                onChange={e => setForm(f => ({ ...f, valid_until: e.target.value }))}
                className="w-full px-4 py-3 border border-[var(--color-beige)] rounded-xl bg-[var(--color-light)] focus:outline-none focus:border-[var(--color-primary)] transition-colors"
              />
            </div>

            {/* Active checkbox */}
            <label className="flex items-center gap-3 cursor-pointer group">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={form.is_active}
                  onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))}
                  className="sr-only"
                />
                <div
                  className={`w-11 h-6 rounded-full transition-colors ${
                    form.is_active ? "bg-[var(--color-primary)]" : "bg-[var(--color-beige)]"
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white shadow-sm absolute top-0.5 transition-transform ${
                      form.is_active ? "translate-x-5.5" : "translate-x-0.5"
                    }`}
                    style={{ transform: form.is_active ? "translateX(22px)" : "translateX(2px)" }}
                  />
                </div>
              </div>
              <span className="font-semibold text-sm">Cupón activo</span>
            </label>

            {/* Action buttons */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setView("list")}
                className="flex-1 px-4 py-3 rounded-2xl border border-[var(--color-beige)] font-semibold text-[var(--color-muted-foreground)] hover:bg-[var(--color-light)] transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 px-4 py-3 rounded-2xl bg-[var(--color-primary)] text-white font-semibold hover:opacity-90 transition-opacity disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {saving && <Loader2 size={16} className="animate-spin" />}
                {editingCoupon ? "Guardar cambios" : "Crear cupón"}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // === LIST VIEW ===
  return (
    <div className="p-6 md:p-8">
      {/* Header row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-black tracking-tight text-[var(--color-primary)]">
            Cupones
          </h1>
          {!loading && (
            <span className="px-3 py-1 rounded-full text-sm font-bold bg-[var(--color-light)] text-[var(--color-primary)] border border-[var(--color-beige)]">
              {couponsList.length}
            </span>
          )}
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[var(--color-primary)] text-white font-semibold hover:opacity-90 transition-opacity text-sm"
        >
          <Plus size={16} />
          Crear cupón
        </button>
      </div>

      {/* Filter row */}
      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        <form onSubmit={handleSearch} className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-muted-foreground)]" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar por código..."
              className="w-full pl-10 pr-4 py-2.5 border border-[var(--color-beige)] rounded-xl bg-[var(--color-background)] text-sm focus:outline-none focus:border-[var(--color-primary)] transition-colors"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2.5 rounded-xl border border-[var(--color-beige)] text-sm font-semibold hover:bg-[var(--color-light)] transition-colors"
          >
            Buscar
          </button>
        </form>
        <select
          value={showActive === undefined ? "" : showActive ? "true" : "false"}
          onChange={e => setShowActive(e.target.value === "" ? undefined : e.target.value === "true")}
          className="px-4 py-2.5 border border-[var(--color-beige)] rounded-xl bg-[var(--color-background)] text-sm focus:outline-none focus:border-[var(--color-primary)] transition-colors"
        >
          <option value="">Todos los estados</option>
          <option value="true">Activos</option>
          <option value="false">Inactivos</option>
        </select>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center py-24">
          <Loader2 className="animate-spin text-[var(--color-primary)]" size={32} />
        </div>
      ) : couponsList.length === 0 ? (
        <div className="rounded-3xl border border-[var(--color-beige)] bg-[var(--color-background)] flex flex-col items-center justify-center py-20 text-center px-6">
          <div className="w-16 h-16 rounded-2xl bg-[var(--color-light)] flex items-center justify-center mb-4">
            <Tags size={28} className="text-[var(--color-muted-foreground)]" />
          </div>
          <h3 className="text-lg font-black tracking-tight mb-1">No hay cupones</h3>
          <p className="text-[var(--color-muted-foreground)] text-sm mb-6">
            Crea tu primer cupón de descuento
          </p>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[var(--color-primary)] text-white font-semibold hover:opacity-90 transition-opacity text-sm"
          >
            <Plus size={16} />
            Crear cupón
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {couponsList.map(coupon => {
            const isExpired = coupon.valid_until && new Date(coupon.valid_until) < new Date();
            const isExhausted = coupon.max_uses != null && coupon.current_uses >= coupon.max_uses;
            const isDimmed = !coupon.is_active || isExpired || isExhausted;

            let statusLabel = "Activo";
            let statusClass = "bg-green-50 text-green-700 border-green-200";
            let topBorderClass = "border-[var(--color-primary)]";

            if (!coupon.is_active) {
              statusLabel = "Inactivo";
              statusClass = "bg-gray-100 text-gray-500 border-gray-200";
              topBorderClass = "border-gray-300";
            } else if (isExpired) {
              statusLabel = "Expirado";
              statusClass = "bg-red-50 text-red-600 border-red-200";
              topBorderClass = "border-red-400";
            } else if (isExhausted) {
              statusLabel = "Agotado";
              statusClass = "bg-orange-50 text-orange-600 border-orange-200";
              topBorderClass = "border-orange-400";
            }

            return (
              <div
                key={coupon.id}
                className={`rounded-3xl border border-[var(--color-beige)] bg-[var(--color-background)] overflow-hidden transition-opacity ${isDimmed ? "opacity-70" : ""}`}
              >
                {/* Dashed top accent */}
                <div className={`border-t-2 border-dashed ${topBorderClass}`} />

                <div className="p-5">
                  {/* Top row: code + status badge */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-black text-2xl tracking-widest text-[var(--color-primary)]">
                        {coupon.code}
                      </span>
                      <button
                        onClick={() => copyCode(coupon.code)}
                        className="p-1.5 rounded-lg hover:bg-[var(--color-light)] text-[var(--color-muted-foreground)] hover:text-[var(--color-primary)] transition-colors"
                        title="Copiar código"
                      >
                        <Copy size={14} />
                      </button>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${statusClass} shrink-0`}>
                      {statusLabel}
                    </span>
                  </div>

                  {/* Discount badge + usage */}
                  <div className="flex items-center gap-3 mb-4">
                    <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--color-primary)]/10 text-[var(--color-primary)] text-sm font-black">
                      {coupon.discount_type === "percentage" ? (
                        <><Percent size={13} />{coupon.discount_value}%</>
                      ) : (
                        <><DollarSign size={13} />{coupon.discount_value}€</>
                      )}
                    </span>
                    <span className="text-sm text-[var(--color-muted-foreground)]">
                      {coupon.current_uses}{coupon.max_uses ? `/${coupon.max_uses}` : ""} usos
                    </span>
                  </div>

                  {/* Expiry */}
                  {coupon.valid_until && (
                    <div className="flex items-center gap-1.5 text-xs text-[var(--color-muted-foreground)] mb-4">
                      <Calendar size={12} />
                      <span>Válido hasta {new Date(coupon.valid_until).toLocaleDateString("es-ES")}</span>
                    </div>
                  )}

                  {/* Action row */}
                  <div className="flex items-center justify-end gap-2 pt-3 border-t border-[var(--color-beige)]">
                    <button
                      onClick={() => openEdit(coupon)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border border-[var(--color-beige)] hover:bg-[var(--color-light)] transition-colors"
                    >
                      <Edit3 size={13} />
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(coupon.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border border-red-200 text-red-500 hover:bg-red-50 transition-colors"
                    >
                      <Trash2 size={13} />
                      Desactivar
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
