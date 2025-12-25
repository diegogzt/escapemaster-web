"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/Card";
import Button from "@/components/Button";
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
} from "lucide-react";

// Mock Data for a specific booking
const MOCK_BOOKING_DETAILS = {
  id: "1",
  room_name: "La Prisión de Alcatraz",
  group_name: "Los Escapistas",
  date: "2023-12-25",
  time: "18:00",
  status: "confirmed",
  total_price: 120,
  paid_amount: 30, // Partial payment
  game_master: "Carlos GM",
  game_master_id: "gm1",
  players: [
    {
      id: "p1",
      name: "Juan Pérez",
      email: "juan@example.com",
      phone: "+34 600 000 001",
      gdpr_signed: true,
      paid: true,
      amount: 30,
    },
    {
      id: "p2",
      name: "María García",
      email: "maria@example.com",
      phone: "+34 600 000 002",
      gdpr_signed: false,
      paid: false,
      amount: 0,
    },
    {
      id: "p3",
      name: "Pedro López",
      email: "pedro@example.com",
      phone: "+34 600 000 003",
      gdpr_signed: true,
      paid: false,
      amount: 0,
    },
    {
      id: "p4",
      name: "Ana Martínez",
      email: "ana@example.com",
      phone: "+34 600 000 004",
      gdpr_signed: false,
      paid: false,
      amount: 0,
    },
  ],
  custom_fields: [
    { label: "¿Cómo nos conociste?", value: "Instagram" },
    { label: "Alergias", value: "Ninguna" },
    { label: "Ocasión especial", value: "Cumpleaños" },
  ],
  comments: [
    {
      id: "c1",
      author: "System",
      text: "Reserva creada online",
      date: "2023-12-20 10:00",
    },
    {
      id: "c2",
      author: "Carlos GM",
      text: "Llamaron para preguntar por aparcamiento",
      date: "2023-12-21 15:30",
    },
  ],
};

export default function BookingDetailsPage() {
  const params = useParams();
  const [booking, setBooking] = useState(MOCK_BOOKING_DETAILS);
  const [newComment, setNewComment] = useState("");
  const [assignedGM, setAssignedGM] = useState(booking.game_master_id);

  // Mock current user ID
  const currentUserId = "gm1";

  const handleSendPaymentLink = (email: string) => {
    alert(`Enlace de pago enviado a ${email}`);
  };

  const handleCopyLink = (id: string) => {
    const link = `${window.location.origin}/payment/${booking.id}/${id}`;
    navigator.clipboard.writeText(link);
    alert("Enlace copiado al portapapeles: " + link);
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

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

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-3xl font-bold text-primary">
              {booking.group_name}
            </h1>
            <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 flex items-center">
              <CheckCircle size={14} className="mr-1" /> Confirmada
            </span>
          </div>
          <div className="flex items-center text-gray-600 gap-4">
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
            <div className="p-4 border-b border-beige bg-light/30 flex justify-between items-center">
              <h3 className="font-bold text-lg text-dark flex items-center">
                <Users size={20} className="mr-2 text-primary" />
                Integrantes ({booking.players.length})
              </h3>
              <Button size="sm" variant="secondary">
                Añadir Jugador
              </Button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 text-xs uppercase text-gray-500">
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
                    <tr key={player.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-dark">
                        {player.name}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
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
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
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
                                className="p-1.5 text-gray-500 hover:bg-gray-100 rounded transition-colors"
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
            <h3 className="font-bold text-lg text-dark mb-4 flex items-center">
              <FileText size={20} className="mr-2 text-primary" />
              Información Adicional
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {booking.custom_fields.map((field, index) => (
                <div
                  key={index}
                  className="bg-light/30 p-3 rounded-lg border border-beige"
                >
                  <span className="text-xs text-gray-500 uppercase font-semibold block mb-1">
                    {field.label}
                  </span>
                  <span className="text-dark font-medium">{field.value}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-6">
          {/* Payment Summary */}
          <Card className="p-6">
            <h3 className="font-bold text-lg text-dark mb-4 flex items-center">
              <DollarSign size={20} className="mr-2 text-primary" />
              Resumen de Pago
            </h3>
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-gray-600">
                <span>Precio Total</span>
                <span className="font-medium">{booking.total_price}€</span>
              </div>
              <div className="flex justify-between text-green-600">
                <span>Pagado</span>
                <span className="font-medium">-{booking.paid_amount}€</span>
              </div>
              <div className="pt-3 border-t border-dashed border-gray-300 flex justify-between text-lg font-bold text-dark">
                <span>Pendiente</span>
                <span>{booking.total_price - booking.paid_amount}€</span>
              </div>
            </div>
            <Button block>Registrar Pago Manual</Button>
          </Card>

          {/* Game Master Assignment */}
          <Card className="p-6">
            <h3 className="font-bold text-lg text-dark mb-4 flex items-center">
              <Shield size={20} className="mr-2 text-primary" />
              Game Master
            </h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Asignado a:
              </label>
              <select
                className="w-full p-2 border border-beige rounded-md bg-white"
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
                className="mr-2 h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                checked={assignedGM === currentUserId}
                onChange={toggleAssignMe}
              />
              <label
                htmlFor="assignMe"
                className="text-sm text-gray-700 cursor-pointer"
              >
                Yo haré esta sesión
              </label>
            </div>
          </Card>

          {/* Internal Comments */}
          <Card className="p-6 flex flex-col h-[400px]">
            <h3 className="font-bold text-lg text-dark mb-4 flex items-center">
              <MessageSquare size={20} className="mr-2 text-primary" />
              Comentarios Internos
            </h3>

            <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
              {booking.comments.map((comment) => (
                <div
                  key={comment.id}
                  className="bg-gray-50 p-3 rounded-lg text-sm"
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-primary">
                      {comment.author}
                    </span>
                    <span className="text-xs text-gray-400">
                      {comment.date}
                    </span>
                  </div>
                  <p className="text-gray-700">{comment.text}</p>
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
