"use client";

import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle } from "@/components/Card";
import { notifications } from "@/services/api";
import { toast } from "sonner";
import {
  Bell,
  BellOff,
  CheckCircle,
  Trash2,
  Loader2,
  Info,
  AlertTriangle,
  Calendar,
  DollarSign,
  Users,
  Star,
} from "lucide-react";

export default function NotificationsPage() {
  const [notifList, setNotifList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "unread">("all");

  useEffect(() => {
    loadNotifications();
  }, []);

  async function loadNotifications() {
    try {
      const data = await notifications.list();
      setNotifList(Array.isArray(data) ? data : data.items || []);
    } catch { /* endpoint may not exist yet */ }
    finally { setLoading(false); }
  }

  const handleMarkRead = async (id: string) => {
    try {
      await notifications.markRead(id);
      setNotifList(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    } catch {
      toast.error("Error al marcar como leída");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await notifications.delete(id);
      setNotifList(prev => prev.filter(n => n.id !== id));
      toast.success("Notificación eliminada");
    } catch {
      toast.error("Error al eliminar");
    }
  };

  const handleMarkAllRead = async () => {
    const unread = notifList.filter(n => !n.read);
    try {
      await Promise.all(unread.map(n => notifications.markRead(n.id)));
      setNotifList(prev => prev.map(n => ({ ...n, read: true })));
      toast.success("Todas marcadas como leídas");
    } catch {
      toast.error("Error al marcar");
    }
  };

  const iconFor = (type: string) => {
    switch (type) {
      case "booking": return <Calendar size={18} className="text-blue-500" />;
      case "payment": return <DollarSign size={18} className="text-green-500" />;
      case "review": return <Star size={18} className="text-yellow-500" />;
      case "user": return <Users size={18} className="text-purple-500" />;
      case "warning": return <AlertTriangle size={18} className="text-orange-500" />;
      default: return <Info size={18} className="text-[var(--color-muted-foreground)]" />;
    }
  };

  const filtered = filter === "unread" ? notifList.filter(n => !n.read) : notifList;
  const unreadCount = notifList.filter(n => !n.read).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="w-full pb-12">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary flex items-center gap-2">
            <Bell size={28} />
            Notificaciones
            {unreadCount > 0 && (
              <span className="ml-2 px-2.5 py-0.5 rounded-full bg-red-500 text-white text-sm font-medium">
                {unreadCount}
              </span>
            )}
          </h1>
          <p className="text-[var(--color-foreground)] opacity-60">
            Centro de notificaciones de tu negocio.
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="flex items-center gap-1 px-3 py-1.5 text-sm text-primary hover:bg-primary/10 rounded-lg transition-colors"
          >
            <CheckCircle size={14} /> Marcar todas como leídas
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setFilter("all")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === "all" ? "bg-primary text-white" : "bg-[var(--color-light)] text-[var(--color-foreground)]"}`}
        >
          Todas ({notifList.length})
        </button>
        <button
          onClick={() => setFilter("unread")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === "unread" ? "bg-primary text-white" : "bg-[var(--color-light)] text-[var(--color-foreground)]"}`}
        >
          Sin leer ({unreadCount})
        </button>
      </div>

      {/* Notification List */}
      <Card className="border-beige overflow-hidden">
        <div className="divide-y divide-[var(--color-beige)]">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-[var(--color-muted-foreground)]">
              <BellOff size={48} strokeWidth={1} className="mb-3 opacity-40" />
              <p className="text-lg font-medium">No hay notificaciones</p>
              <p className="text-sm">Cuando recibas notificaciones aparecerán aquí</p>
            </div>
          ) : (
            filtered.map((n: any) => (
              <div
                key={n.id}
                className={`flex items-start gap-4 p-4 transition-colors ${!n.read ? "bg-primary/5" : "hover:bg-[var(--color-light)]/50"}`}
              >
                <div className="mt-1">{iconFor(n.type)}</div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm ${!n.read ? "font-semibold" : ""} text-[var(--color-foreground)]`}>
                    {n.title || n.message}
                  </p>
                  {n.body && <p className="text-xs text-[var(--color-muted-foreground)] mt-0.5">{n.body}</p>}
                  <p className="text-xs text-[var(--color-muted-foreground)] mt-1">
                    {n.created_at ? new Date(n.created_at).toLocaleString() : ""}
                  </p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {!n.read && (
                    <button
                      onClick={() => handleMarkRead(n.id)}
                      className="p-1.5 text-[var(--color-muted-foreground)] hover:text-primary rounded transition-colors"
                      title="Marcar como leída"
                    >
                      <CheckCircle size={16} />
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(n.id)}
                    className="p-1.5 text-[var(--color-muted-foreground)] hover:text-red-500 rounded transition-colors"
                    title="Eliminar"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}
