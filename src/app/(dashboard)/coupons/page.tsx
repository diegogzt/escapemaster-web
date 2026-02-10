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
      <div className="p-6 max-w-2xl mx-auto">
        <button onClick={() => setView("list")} className="flex items-center gap-2 text-primary hover:underline mb-4">
          <ArrowLeft size={16} /> Volver a cupones
        </button>
        <h1 className="text-2xl font-bold text-primary mb-6">{editingCoupon ? "Editar cupón" : "Crear cupón"}</h1>

        <Card className="hover:translate-y-0 space-y-5">
          <div>
            <label className="text-sm font-medium mb-1 block">Código</label>
            <div className="flex gap-2">
              <input value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))} className="flex-1 p-2 border border-[var(--color-beige)] rounded-lg font-mono text-lg tracking-wider" placeholder="CODIGO" />
              <Button variant="outline" size="sm" onClick={generateCode}><Zap size={14} className="mr-1" /> Generar</Button>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Tipo de descuento</label>
            <div className="flex gap-2">
              <button onClick={() => setForm(f => ({ ...f, discount_type: "percentage" }))} className={`flex-1 p-3 rounded-lg border-2 font-medium ${form.discount_type === "percentage" ? "border-primary bg-primary/5 text-primary" : "border-[var(--color-beige)]"}`}>
                <Percent size={18} className="mx-auto mb-1" /> Porcentaje
              </button>
              <button onClick={() => setForm(f => ({ ...f, discount_type: "fixed" }))} className={`flex-1 p-3 rounded-lg border-2 font-medium ${form.discount_type === "fixed" ? "border-primary bg-primary/5 text-primary" : "border-[var(--color-beige)]"}`}>
                <DollarSign size={18} className="mx-auto mb-1" /> Cantidad fija
              </button>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">Valor del descuento {form.discount_type === "percentage" ? "(%)" : "(€)"}</label>
            <input type="number" min={0} max={form.discount_type === "percentage" ? 100 : 9999} value={form.discount_value} onChange={e => setForm(f => ({ ...f, discount_value: +e.target.value }))} className="w-full p-2 border border-[var(--color-beige)] rounded-lg" />
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">Sala específica (opcional)</label>
            <select value={form.room_id} onChange={e => setForm(f => ({ ...f, room_id: e.target.value }))} className="w-full p-2 border border-[var(--color-beige)] rounded-lg bg-[var(--color-background)]">
              <option value="">Todas las salas</option>
              {allRooms.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Monto mínimo (€)</label>
              <input type="number" min={0} value={form.min_booking_amount} onChange={e => setForm(f => ({ ...f, min_booking_amount: e.target.value }))} className="w-full p-2 border border-[var(--color-beige)] rounded-lg" placeholder="Sin mínimo" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Usos máximos</label>
              <input type="number" min={0} value={form.max_uses} onChange={e => setForm(f => ({ ...f, max_uses: e.target.value }))} className="w-full p-2 border border-[var(--color-beige)] rounded-lg" placeholder="Ilimitado" />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">Válido hasta</label>
            <input type="date" value={form.valid_until} onChange={e => setForm(f => ({ ...f, valid_until: e.target.value }))} className="w-full p-2 border border-[var(--color-beige)] rounded-lg" />
          </div>

          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={form.is_active} onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))} className="w-5 h-5 accent-primary" />
            <span className="font-medium">Activo</span>
          </label>

          <div className="flex gap-3 pt-2">
            <Button variant="outline" onClick={() => setView("list")} className="flex-1">Cancelar</Button>
            <Button onClick={handleSave} loading={saving} className="flex-1">{editingCoupon ? "Guardar cambios" : "Crear cupón"}</Button>
          </div>
        </Card>
      </div>
    );
  }

  // === LIST VIEW ===
  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary flex items-center gap-2"><Tags size={28} /> Cupones</h1>
          <p className="text-[var(--color-muted-foreground)]">{couponsList.length} {couponsList.length === 1 ? "cupón" : "cupones"}</p>
        </div>
        <Button onClick={openCreate}><Plus size={16} className="mr-1" /> Crear cupón</Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <form onSubmit={handleSearch} className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-muted-foreground)]" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por código..." className="w-full pl-9 pr-3 py-2 border border-[var(--color-beige)] rounded-lg" />
          </div>
          <Button variant="outline" type="submit" size="sm">Buscar</Button>
        </form>
        <select value={showActive === undefined ? "" : showActive ? "true" : "false"} onChange={e => setShowActive(e.target.value === "" ? undefined : e.target.value === "true")} className="p-2 border border-[var(--color-beige)] rounded-lg bg-[var(--color-background)] text-sm">
          <option value="">Todos</option>
          <option value="true">Activos</option>
          <option value="false">Inactivos</option>
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-primary" size={32} /></div>
      ) : couponsList.length === 0 ? (
        <Card className="text-center py-12 hover:translate-y-0">
          <Tags size={48} className="mx-auto mb-4 text-[var(--color-muted-foreground)]" />
          <h3 className="text-lg font-bold mb-1">No hay cupones</h3>
          <p className="text-[var(--color-muted-foreground)] mb-4">Crea tu primer cupón de descuento</p>
          <Button onClick={openCreate}><Plus size={16} className="mr-1" /> Crear cupón</Button>
        </Card>
      ) : (
        <div className="grid gap-3">
          {couponsList.map(coupon => {
            const isExpired = coupon.valid_until && new Date(coupon.valid_until) < new Date();
            const isExhausted = coupon.max_uses && coupon.current_uses >= coupon.max_uses;
            return (
              <Card key={coupon.id} className={`hover:translate-y-0 ${!coupon.is_active || isExpired || isExhausted ? "opacity-60" : ""}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      {coupon.discount_type === "percentage" ? <Percent size={20} className="text-primary" /> : <DollarSign size={20} className="text-primary" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-lg tracking-wider">{coupon.code}</span>
                        <button onClick={() => copyCode(coupon.code)} className="p-1 hover:bg-[var(--color-light)] rounded"><Copy size={14} /></button>
                      </div>
                      <p className="text-sm text-[var(--color-muted-foreground)]">
                        {coupon.discount_type === "percentage" ? `${coupon.discount_value}% descuento` : `${coupon.discount_value}€ descuento`}
                        {coupon.max_uses && ` · ${coupon.current_uses}/${coupon.max_uses} usos`}
                        {coupon.valid_until && ` · hasta ${new Date(coupon.valid_until).toLocaleDateString("es-ES")}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {!coupon.is_active ? (
                      <span className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-600">Inactivo</span>
                    ) : isExpired ? (
                      <span className="px-2 py-1 rounded-full text-xs bg-red-100 text-red-600">Expirado</span>
                    ) : isExhausted ? (
                      <span className="px-2 py-1 rounded-full text-xs bg-orange-100 text-orange-600">Agotado</span>
                    ) : (
                      <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-600">Activo</span>
                    )}
                    <button onClick={() => openEdit(coupon)} className="p-2 hover:bg-[var(--color-light)] rounded-lg"><Edit3 size={16} /></button>
                    <button onClick={() => handleDelete(coupon.id)} className="p-2 hover:bg-red-50 text-red-500 rounded-lg"><Trash2 size={16} /></button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
