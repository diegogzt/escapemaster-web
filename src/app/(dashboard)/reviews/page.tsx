"use client";

import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle } from "@/components/Card";
import Button from "@/components/Button";
import { reviews, rooms as roomsApi, marketplace } from "@/services/api";
import { toast } from "sonner";
import {
  Star,
  CheckCircle,
  XCircle,
  Clock,
  MessageSquare,
  TrendingUp,
  Eye,
  Loader2,
  ThumbsUp,
  AlertCircle,
} from "lucide-react";

export default function ReviewsPage() {
  const [pendingReviews, setPendingReviews] = useState<any[]>([]);
  const [roomSummaries, setRoomSummaries] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [roomList, setRoomList] = useState<any[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<string>("");
  const [roomReviews, setRoomReviews] = useState<any[]>([]);
  const [marketStats, setMarketStats] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      // Load pending reviews
      const pending = await reviews.getPending();
      setPendingReviews(Array.isArray(pending) ? pending : []);

      // Load rooms
      const rData = await roomsApi.list();
      const list = Array.isArray(rData) ? rData : rData.rooms || rData.items || [];
      setRoomList(list);

      // Load summaries for each room
      const summaries: Record<string, any> = {};
      await Promise.all(
        list.slice(0, 10).map(async (room: any) => {
          try {
            const summary = await reviews.getSummary(room.id);
            summaries[room.id] = summary;
          } catch { /* no reviews */ }
        })
      );
      setRoomSummaries(summaries);

      // Marketplace stats
      try {
        const stats = await marketplace.getStats();
        setMarketStats(stats);
      } catch { /* not available */ }
    } catch {
      // Some endpoints might not be live
    } finally {
      setLoading(false);
    }
  }

  const loadRoomReviews = async (roomId: string) => {
    setSelectedRoom(roomId);
    try {
      const data = await reviews.getForRoom(roomId);
      setRoomReviews(Array.isArray(data) ? data : []);
    } catch {
      setRoomReviews([]);
    }
  };

  const handleModerate = async (reviewId: string, action: "approve" | "reject") => {
    try {
      await reviews.moderate(reviewId, { action });
      setPendingReviews(prev => prev.filter(r => r.id !== reviewId));
      toast.success(action === "approve" ? "Review aprobado" : "Review rechazado");
    } catch {
      toast.error("Error al moderar");
    }
  };

  const renderStars = (rating: number) => (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(s => (
        <Star key={s} size={14} className={s <= rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"} />
      ))}
    </div>
  );

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
        <h1 className="text-3xl font-bold text-primary">Reviews & Marketplace</h1>
        <p className="text-[var(--color-foreground)] opacity-60">
          Gestiona las valoraciones de tus clientes y tu presencia en el marketplace.
        </p>
      </div>

      {/* Marketplace Stats */}
      {marketStats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Visitas Marketplace", value: marketStats.total_views || 0, icon: <Eye size={20} /> },
            { label: "Valoración Media", value: `${(marketStats.avg_rating || 0).toFixed(1)}⭐`, icon: <Star size={20} /> },
            { label: "Total Reviews", value: marketStats.total_reviews || 0, icon: <MessageSquare size={20} /> },
            { label: "Reservas vía Marketplace", value: marketStats.marketplace_bookings || 0, icon: <TrendingUp size={20} /> },
          ].map((s, i) => (
            <Card key={i} className="p-4 border-beige">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg text-primary">{s.icon}</div>
                <div>
                  <p className="text-2xl font-bold text-[var(--color-foreground)]">{s.value}</p>
                  <p className="text-xs text-[var(--color-muted-foreground)]">{s.label}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pending Reviews */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-beige">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock size={20} className="text-yellow-500" />
                Reviews Pendientes ({pendingReviews.length})
              </CardTitle>
            </CardHeader>
            <div className="p-6">
              {pendingReviews.length === 0 ? (
                <p className="text-sm text-[var(--color-muted-foreground)] text-center py-4 italic">
                  No hay reviews pendientes de moderación
                </p>
              ) : (
                <div className="space-y-4">
                  {pendingReviews.map(review => (
                    <div key={review.id} className="p-4 border border-beige rounded-lg bg-[var(--color-light)]/20">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-medium text-[var(--color-foreground)]">{review.author_name || "Anónimo"}</p>
                          <p className="text-xs text-[var(--color-muted-foreground)]">{review.room_name} — {new Date(review.created_at).toLocaleDateString()}</p>
                        </div>
                        {renderStars(review.rating)}
                      </div>
                      <p className="text-sm text-[var(--color-foreground)] mb-3">{review.comment}</p>
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => handleModerate(review.id, "approve")}>
                          <CheckCircle size={14} className="mr-1" /> Aprobar
                        </Button>
                        <Button size="sm" variant="danger" onClick={() => handleModerate(review.id, "reject")}>
                          <XCircle size={14} className="mr-1" /> Rechazar
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>

          {/* Room Reviews */}
          {selectedRoom && (
            <Card className="border-beige">
              <CardHeader>
                <CardTitle>Reviews de {roomList.find(r => r.id === selectedRoom)?.name || "Sala"}</CardTitle>
              </CardHeader>
              <div className="p-6">
                {roomReviews.length === 0 ? (
                  <p className="text-sm text-[var(--color-muted-foreground)] italic text-center py-4">Sin reviews</p>
                ) : (
                  <div className="space-y-3">
                    {roomReviews.map((r: any) => (
                      <div key={r.id} className="flex items-start gap-3 p-3 border border-beige rounded-lg">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold shrink-0">
                          {(r.author_name || "A").charAt(0)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-sm">{r.author_name || "Anónimo"}</span>
                            {renderStars(r.rating)}
                          </div>
                          <p className="text-sm text-[var(--color-foreground)] mt-1">{r.comment}</p>
                          <div className="flex items-center gap-3 mt-2 text-xs text-[var(--color-muted-foreground)]">
                            <span>{new Date(r.created_at).toLocaleDateString()}</span>
                            {r.helpful_count > 0 && (
                              <span className="flex items-center gap-1"><ThumbsUp size={12} /> {r.helpful_count}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Card>
          )}
        </div>

        {/* Room Summaries */}
        <div className="space-y-6">
          <Card className="border-beige">
            <CardHeader>
              <CardTitle>Resumen por Sala</CardTitle>
            </CardHeader>
            <div className="p-6 space-y-3">
              {roomList.map((room: any) => {
                const summary = roomSummaries[room.id];
                return (
                  <button
                    key={room.id}
                    onClick={() => loadRoomReviews(room.id)}
                    className={`w-full text-left p-3 rounded-lg border transition-colors ${
                      selectedRoom === room.id ? "border-primary bg-primary/5" : "border-beige hover:border-primary/30"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm text-[var(--color-foreground)]">{room.name}</span>
                      {summary ? (
                        <div className="flex items-center gap-1">
                          <Star size={14} className="text-yellow-400 fill-yellow-400" />
                          <span className="text-sm font-bold">{(summary.average_rating || 0).toFixed(1)}</span>
                          <span className="text-xs text-[var(--color-muted-foreground)]">({summary.total_reviews || 0})</span>
                        </div>
                      ) : (
                        <span className="text-xs text-[var(--color-muted-foreground)]">Sin reviews</span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
