"use client";

import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/Card";
import Button from "@/components/Button";
import { bookings as bookingsApi } from "@/services/api";
import {
  Calendar,
  Clock,
  Users,
  Mail,
  Phone,
  CheckCircle,
  XCircle,
  AlertCircle,
  DollarSign,
  Send,
  MessageSquare,
  User,
  Shield,
  FileText,
  Copy,
  Loader2,
} from "lucide-react";

// Types for booking details
interface Player {
  id: string;
  name: string;
  email: string;
  phone: string;
  gdpr_signed: boolean;
  paid: boolean;
  amount: number;
}

interface Comment {
  id: string;
  author: string;
  text: string;
  date: string;
}

interface CustomField {
  label: string;
  value: string;
}

interface BookingDetails {
  id: string;
  room_name: string;
  group_name: string;
  date: string;
  time: string;
  status: string;
  total_price: number;
  paid_amount: number;
  game_master: string;
  game_master_id: string;
  players: Player[];
  custom_fields: CustomField[];
  comments: Comment[];
}

export default function BookingDetailsPage() {
  const params = useParams();
  const bookingId = params.id as string;
  
  const [booking, setBooking] = useState<BookingDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newComment, setNewComment] = useState("");
  const [assignedGM, setAssignedGM] = useState("");

  // Mock current user ID
  const currentUserId = "gm1";

  // Fetch booking details from API
  useEffect(() => {
    async function fetchBooking() {
      try {
        setLoading(true);
        const data = await bookingsApi.get(bookingId);
        
        // Transform API response to expected format
        // API returns: id, start_time, end_time, num_people, booking_status, payment_status,
        //              total_price, remaining_balance, guest, room_name, assigned_users
        const startTime = data.start_time ? new Date(data.start_time) : null;
        const paidAmount = Number(data.total_price) - Number(data.remaining_balance) || 0;
        
        const transformedBooking: BookingDetails = {
          id: data.id,
          room_name: data.room_name || "Sin sala",
          group_name: data.guest?.full_name || "Sin grupo",
          date: startTime ? startTime.toISOString().split("T")[0] : "",
          time: startTime ? startTime.toTimeString().substring(0, 5) : "",
          status: data.booking_status || "pending",
          total_price: Number(data.total_price) || 0,
          paid_amount: paidAmount,
          game_master: data.assigned_users?.[0]?.full_name || "Sin asignar",
          game_master_id: data.assigned_users?.[0]?.id || "",
          // For now, create a single player entry from guest data
          // TODO: Add proper multi-player support when API supports it
          players: data.guest ? [{
            id: data.guest.id,
            name: data.guest.full_name || "Invitado",
            email: data.guest.email || "",
            phone: data.guest.phone || "",
            gdpr_signed: true, // TODO: Get from API
            paid: paidAmount >= Number(data.total_price),
            amount: paidAmount,
          }] : [],
          custom_fields: data.custom_fields ? JSON.parse(data.custom_fields) : [],
          comments: [], // TODO: Add comments endpoint to API
        };
        
        setBooking(transformedBooking);
        setAssignedGM(transformedBooking.game_master_id);
        setError(null);
      } catch (err) {
        console.error("Error fetching booking:", err);
        setError("Error al cargar los detalles de la reserva");
      } finally {
        setLoading(false);
      }
    }
    
    if (bookingId) {
      fetchBooking();
    }
  }, [bookingId]);

  const handleSendPaymentLink = (email: string) => {
    toast.success(`Enlace de pago enviado a ${email}`);
  };

  const handleCopyLink = (id: string) => {
    if (!booking) return;
    const link = `${window.location.origin}/payment/${booking.id}/${id}`;
    navigator.clipboard.writeText(link);
    toast.success("Enlace copiado al portapapeles: " + link);
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !booking) return;

    const comment = {
      id: `c${Date.now()}`,
      author: "Yo", // Should be current user name
      text: newComment,
      date: new Date().toLocaleString(),
    };

    setBooking({
      ...booking,
      comments: [...booking.comments, comment],
    });
    setNewComment("");
  };

  const toggleAssignMe = () => {
    if (assignedGM === currentUserId) {
      setAssignedGM("");
      // Update booking mock
    } else {
      setAssignedGM(currentUserId);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-2" />
          <p className="text-[var(--color-muted-foreground)]">Cargando detalles de la reserva...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !booking) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
          <p className="text-red-600">{error || "Reserva no encontrada"}</p>
          <Link href="/bookings">
            <Button className="mt-4">Volver a reservas</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-3xl font-bold text-primary">
              {booking.group_name}
            </h1>
            <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-500/10 text-green-400 flex items-center">
              <CheckCircle size={14} className="mr-1" /> Confirmada
            </span>
          </div>
          <div className="flex items-center text-[var(--color-muted-foreground)] gap-4">
            <span className="flex items-center">
              <Calendar size={16} className="mr-1" />{" "}
              {new Date(booking.date).toLocaleDateString()}
            </span>
            <span className="flex items-center">
              <Clock size={16} className="mr-1" /> {booking.time}
            </span>
            <span className="flex items-center font-medium text-primary">
              <FileText size={16} className="mr-1" /> {booking.room_name}
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary">Editar Reserva</Button>
          <Button variant="danger">Cancelar</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Players List */}
          <Card className="p-0 overflow-hidden">
            <div className="p-4 border-b border-beige bg-[var(--color-light)]/30 flex justify-between items-center">
              <h3 className="font-bold text-lg text-[var(--color-foreground)] flex items-center">
                <Users size={20} className="mr-2 text-primary" />
                Integrantes ({booking.players.length})
              </h3>
              <Button size="sm" variant="secondary">
                Añadir Jugador
              </Button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-[var(--color-light)] text-xs uppercase text-[var(--color-muted-foreground)]">
                  <tr>
                    <th className="px-4 py-3">Jugador</th>
                    <th className="px-4 py-3">Contacto</th>
                    <th className="px-4 py-3 text-center">RGPD</th>
                    <th className="px-4 py-3 text-center">Pago</th>
                    <th className="px-4 py-3 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {booking.players.map((player) => (
                    <tr key={player.id} className="hover:bg-[var(--color-light)]">
                      <td className="px-4 py-3 font-medium text-[var(--color-foreground)]">
                        {player.name}
                      </td>
                      <td className="px-4 py-3 text-sm text-[var(--color-muted-foreground)]">
                        <div className="flex items-center">
                          <Mail size={12} className="mr-1" /> {player.email}
                        </div>
                        <div className="flex items-center mt-1">
                          <Phone size={12} className="mr-1" /> {player.phone}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {player.gdpr_signed ? (
                          <span className="text-green-600" title="Firmado">
                            <CheckCircle size={18} className="mx-auto" />
                          </span>
                        ) : (
                          <span className="text-gray-300" title="Pendiente">
                            <AlertCircle size={18} className="mx-auto" />
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {player.paid ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-500/10 text-green-400">
                            Pagado
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                            Pendiente
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-2">
                          {!player.paid && (
                            <>
                              <button
                                onClick={() =>
                                  handleSendPaymentLink(player.email)
                                }
                                className="p-1.5 text-primary hover:bg-primary/10 rounded transition-colors"
                                title="Enviar enlace de pago"
                              >
                                <Send size={16} />
                              </button>
                              <button
                                onClick={() => handleCopyLink(player.id)}
                                className="p-1.5 text-[var(--color-muted-foreground)] hover:bg-[var(--color-light)] rounded transition-colors"
                                title="Copiar enlace"
                              >
                                <Copy size={16} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Custom Fields */}
          <Card className="p-6">
            <h3 className="font-bold text-lg text-[var(--color-foreground)] mb-4 flex items-center">
              <FileText size={20} className="mr-2 text-primary" />
              Información Adicional
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {booking.custom_fields.map((field, index) => (
                <div
                  key={index}
                  className="bg-[var(--color-light)]/30 p-3 rounded-lg border border-beige"
                >
                  <span className="text-xs text-[var(--color-muted-foreground)] uppercase font-semibold block mb-1">
                    {field.label}
                  </span>
                  <span className="text-[var(--color-foreground)] font-medium">{field.value}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-6">
          {/* Payment Summary */}
          <Card className="p-6">
            <h3 className="font-bold text-lg text-[var(--color-foreground)] mb-4 flex items-center">
              <DollarSign size={20} className="mr-2 text-primary" />
              Resumen de Pago
            </h3>
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-[var(--color-muted-foreground)]">
                <span>Precio Total</span>
                <span className="font-medium">{booking.total_price}€</span>
              </div>
              <div className="flex justify-between text-green-600">
                <span>Pagado</span>
                <span className="font-medium">-{booking.paid_amount}€</span>
              </div>
              <div className="pt-3 border-t border-dashed border-[var(--color-beige)] flex justify-between text-lg font-bold text-[var(--color-foreground)]">
                <span>Pendiente</span>
                <span>{booking.total_price - booking.paid_amount}€</span>
              </div>
            </div>
            <Button block>Registrar Pago Manual</Button>
          </Card>

          {/* Game Master Assignment */}
          <Card className="p-6">
            <h3 className="font-bold text-lg text-[var(--color-foreground)] mb-4 flex items-center">
              <Shield size={20} className="mr-2 text-primary" />
              Game Master
            </h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-[var(--color-foreground)] mb-1">
                Asignado a:
              </label>
              <select
                className="w-full p-2 border border-beige rounded-md bg-[var(--color-background)]"
                value={assignedGM}
                onChange={(e) => setAssignedGM(e.target.value)}
              >
                <option value="">Sin asignar</option>
                <option value="gm1">Carlos GM (Yo)</option>
                <option value="gm2">Ana GM</option>
                <option value="gm3">Pedro GM</option>
              </select>
            </div>
            <div className="flex items-center mb-2">
              <input
                type="checkbox"
                id="assignMe"
                className="mr-2 h-4 w-4 text-primary focus:ring-primary border-[var(--color-beige)] rounded"
                checked={assignedGM === currentUserId}
                onChange={toggleAssignMe}
              />
              <label
                htmlFor="assignMe"
                className="text-sm text-[var(--color-foreground)] cursor-pointer"
              >
                Yo haré esta sesión
              </label>
            </div>
          </Card>

          {/* Internal Comments */}
          <Card className="p-6 flex flex-col h-[400px]">
            <h3 className="font-bold text-lg text-[var(--color-foreground)] mb-4 flex items-center">
              <MessageSquare size={20} className="mr-2 text-primary" />
              Comentarios Internos
            </h3>

            <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
              {booking.comments.map((comment) => (
                <div
                  key={comment.id}
                  className="bg-[var(--color-light)] p-3 rounded-lg text-sm"
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-primary">
                      {comment.author}
                    </span>
                    <span className="text-xs text-[var(--color-muted-foreground)]">
                      {comment.date}
                    </span>
                  </div>
                  <p className="text-[var(--color-foreground)]">{comment.text}</p>
                </div>
              ))}
            </div>

            <form onSubmit={handleAddComment} className="mt-auto">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Escribe un comentario..."
                  className="flex-1 p-2 border border-beige rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                />
                <button
                  type="submit"
                  className="p-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
                >
                  <Send size={16} />
                </button>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
