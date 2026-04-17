"use client";

import React, { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { integrationCalendars } from "@/services/api";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default function EmbedCalendarPage({ params }: PageProps) {
  const { slug } = use(params);
  const router = useRouter();

  const [calendar, setCalendar] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Selection state
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<any>(null);
  const [numPeople, setNumPeople] = useState(2);

  // Booking state
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [customFields, setCustomFields] = useState<Record<string, string>>({});
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingResult, setBookingResult] = useState<any>(null);

  // Availability
  const [availability, setAvailability] = useState<any>(null);
  const [availabilityLoading, setAvailabilityLoading] = useState(false);

  useEffect(() => {
    loadCalendar();
  }, [slug]);

  useEffect(() => {
    if (selectedRoom && selectedDate) {
      loadAvailability();
    }
  }, [selectedRoom, selectedDate]);

  async function loadCalendar() {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const response = await fetch(`${baseUrl}/embed/calendar/${slug}`);
      if (!response.ok) {
        throw new Error("Calendario no encontrado");
      }
      const data = await response.json();
      setCalendar(data);

      // Set initial values
      if (data.rooms && data.rooms.length > 0) {
        if (data.flow_type === "room_first") {
          // Don't select room yet in room_first flow
        } else {
          // In date_first flow, we don't need room initially
        }
      }
    } catch (err: any) {
      setError(err.message || "Error al cargar el calendario");
    } finally {
      setLoading(false);
    }
  }

  async function loadAvailability() {
    if (!selectedRoom || !selectedDate) return;

    setAvailabilityLoading(true);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const dateStr = selectedDate.toISOString().split("T")[0];
      const response = await fetch(
        `${baseUrl}/embed/calendar/${slug}/availability?room_id=${selectedRoom}&date=${dateStr}`
      );
      if (response.ok) {
        const data = await response.json();
        setAvailability(data);
      }
    } catch {
      // Ignore availability errors
    } finally {
      setAvailabilityLoading(false);
    }
  }

  async function handleBooking() {
    if (!selectedRoom || !selectedDate || !selectedSlot || !calendar) return;

    if (!guestName.trim() || !guestEmail.trim()) {
      alert("Por favor completa los campos obligatorios");
      return;
    }

    if (!acceptTerms) {
      alert("Debes aceptar los términos y condiciones");
      return;
    }

    setBookingLoading(true);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const response = await fetch(`${baseUrl}/embed/calendar/${slug}/bookings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          room_id: selectedRoom,
          start_time: `${selectedDate.toISOString().split("T")[0]}T${selectedSlot.start}:00Z`,
          end_time: `${selectedDate.toISOString().split("T")[0]}T${selectedSlot.end}:00Z`,
          num_people: numPeople,
          guest_name: guestName,
          guest_email: guestEmail,
          guest_phone: guestPhone || undefined,
          custom_fields: Object.keys(customFields).length > 0 ? customFields : undefined,
          accept_terms: acceptTerms,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setBookingResult(data);
      } else {
        alert(data.error || "Error al crear la reserva");
      }
    } catch {
      alert("Error de conexión");
    } finally {
      setBookingLoading(false);
    }
  }

  // Styles
  const styles = {
    primaryColor: calendar?.primary_color || "#6366f1",
    backgroundColor: calendar?.background_color || "#ffffff",
    fontFamily: calendar?.font_family || "system-ui, -apple-system, sans-serif",
    borderRadius: calendar?.border_radius || 12,
  };

  if (loading) {
    return (
      <div
        style={{
          fontFamily: styles.fontFamily,
          backgroundColor: styles.backgroundColor,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <p style={{ color: styles.primaryColor }}>Cargando calendario...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          fontFamily: styles.fontFamily,
          backgroundColor: styles.backgroundColor,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ textAlign: "center", padding: "2rem" }}>
          <h1 style={{ color: "#ef4444", marginBottom: "1rem" }}>Error</h1>
          <p style={{ color: "#666" }}>{error}</p>
        </div>
      </div>
    );
  }

  if (bookingResult) {
    return (
      <div
        style={{
          fontFamily: styles.fontFamily,
          backgroundColor: styles.backgroundColor,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "1rem",
        }}
      >
        <div
          style={{
            backgroundColor: "white",
            borderRadius: styles.borderRadius,
            padding: "2rem",
            maxWidth: "500px",
            width: "100%",
            boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
            textAlign: "center",
          }}
        >
          <div
            style={{
              width: "60px",
              height: "60px",
              borderRadius: "50%",
              backgroundColor: "#22c55e",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 1rem",
            }}
          >
            <svg
              width="30"
              height="30"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="3"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h2
            style={{
              fontSize: "1.5rem",
              fontWeight: "bold",
              marginBottom: "0.5rem",
              color: "#1f2937",
            }}
          >
            ¡Reserva Confirmada!
          </h2>
          <p style={{ color: "#6b7280", marginBottom: "1rem" }}>
            Tu reserva ha sido creada exitosamente.
          </p>
          <div
            style={{
              backgroundColor: "#f3f4f6",
              borderRadius: styles.borderRadius,
              padding: "1rem",
              marginBottom: "1rem",
            }}
          >
            <p style={{ fontSize: "0.875rem", color: "#6b7280" }}>Código de confirmación</p>
            <p
              style={{
                fontSize: "1.5rem",
                fontWeight: "bold",
                letterSpacing: "0.1em",
                color: styles.primaryColor,
              }}
            >
              {bookingResult.confirmation_code}
            </p>
          </div>
          <p style={{ fontSize: "0.875rem", color: "#6b7280" }}>
            {bookingResult.message}
          </p>
        </div>
      </div>
    );
  }

  if (calendar?.read_only) {
    return (
      <div
        style={{
          fontFamily: styles.fontFamily,
          backgroundColor: styles.backgroundColor,
          minHeight: "100vh",
          padding: "1rem",
        }}
      >
        <div
          style={{
            backgroundColor: "white",
            borderRadius: styles.borderRadius,
            padding: "2rem",
            maxWidth: "600px",
            margin: "0 auto",
            boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
          }}
        >
          <h1 style={{ fontSize: "1.5rem", fontWeight: "bold", marginBottom: "1rem", color: "#1f2937" }}>
            {calendar.name}
          </h1>
          <p style={{ color: "#6b7280", marginBottom: "2rem" }}>
            Este calendario es de solo consulta. Para realizar una reserva, contacte directamente con el establecimiento.
          </p>
          <p style={{ textAlign: "center", color: "#9ca3af", fontSize: "0.875rem" }}>
            Powered by EscapeMaster
          </p>
        </div>
      </div>
    );
  }

  // Room First Flow
  const isRoomFirst = calendar?.flow_type === "room_first";

  return (
    <div
      style={{
        fontFamily: styles.fontFamily,
        backgroundColor: styles.backgroundColor,
        minHeight: "100vh",
        padding: "1rem",
      }}
    >
      <div
        style={{
          backgroundColor: "white",
          borderRadius: styles.borderRadius,
          padding: "1.5rem",
          maxWidth: "800px",
          margin: "0 auto",
          boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
        }}
      >
        {/* Header */}
        <div style={{ marginBottom: "1.5rem", borderBottom: "1px solid #e5e7eb", paddingBottom: "1rem" }}>
          <h1
            style={{
              fontSize: "1.25rem",
              fontWeight: "bold",
              color: "#1f2937",
              marginBottom: "0.25rem",
            }}
          >
            {calendar?.name || "Reservar"}
          </h1>
          {calendar?.description && (
            <p style={{ fontSize: "0.875rem", color: "#6b7280" }}>{calendar.description}</p>
          )}
        </div>

        {/* Step 1: Select Room (Room First) or Date (Date First) */}
        {!selectedRoom && isRoomFirst && (
          <div>
            <h2 style={{ fontSize: "1rem", fontWeight: "600", marginBottom: "1rem", color: "#374151" }}>
              1. Selecciona una sala
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "1rem" }}>
              {calendar?.rooms?.map((room: any) => (
                <div
                  key={room.id}
                  onClick={() => setSelectedRoom(room.id)}
                  style={{
                    border: `2px solid ${room.color}30`,
                    borderRadius: styles.borderRadius,
                    padding: "1rem",
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                >
                  <div
                    style={{
                      width: "12px",
                      height: "12px",
                      borderRadius: "50%",
                      backgroundColor: room.color,
                      marginBottom: "0.5rem",
                    }}
                  />
                  <h3 style={{ fontWeight: "600", fontSize: "0.875rem", marginBottom: "0.25rem" }}>
                    {room.name}
                  </h3>
                  <p style={{ fontSize: "0.75rem", color: "#6b7280" }}>
                    {room.duration_minutes} min • {room.capacity_min}-{room.capacity} personas
                  </p>
                  <p style={{ fontSize: "0.875rem", fontWeight: "600", color: styles.primaryColor }}>
                    €{Number(room.price_per_person).toFixed(2)}/persona
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 1: Select Date (Date First) */}
        {!selectedDate && !isRoomFirst && (
          <div>
            <h2 style={{ fontSize: "1rem", fontWeight: "600", marginBottom: "1rem", color: "#374151" }}>
              1. Selecciona una fecha
            </h2>
            <input
              type="date"
              onChange={(e) => {
                if (e.target.value) {
                  setSelectedDate(new Date(e.target.value + "T12:00:00"));
                }
              }}
              min={new Date().toISOString().split("T")[0]}
              style={{
                padding: "0.75rem",
                borderRadius: styles.borderRadius,
                border: "1px solid #d1d5db",
                fontSize: "1rem",
                width: "100%",
                maxWidth: "300px",
              }}
            />
          </div>
        )}

        {/* Step 2: Select Date and Time */}
        {selectedRoom && isRoomFirst && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <h2 style={{ fontSize: "1rem", fontWeight: "600", color: "#374151" }}>
                2. Selecciona fecha y hora
              </h2>
              <button
                onClick={() => {
                  setSelectedRoom(null);
                  setSelectedDate(null);
                  setSelectedSlot(null);
                  setAvailability(null);
                }}
                style={{
                  fontSize: "0.75rem",
                  color: styles.primaryColor,
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Cambiar sala
              </button>
            </div>

            {!selectedDate ? (
              <input
                type="date"
                onChange={(e) => {
                  if (e.target.value) {
                    setSelectedDate(new Date(e.target.value + "T12:00:00"));
                  }
                }}
                min={new Date().toISOString().split("T")[0]}
                style={{
                  padding: "0.75rem",
                  borderRadius: styles.borderRadius,
                  border: "1px solid #d1d5db",
                  fontSize: "1rem",
                  width: "100%",
                  maxWidth: "300px",
                }}
              />
            ) : (
              <div>
                <p style={{ fontSize: "0.875rem", color: "#374151", marginBottom: "0.75rem" }}>
                  Fecha: {selectedDate.toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" })}
                </p>

                {availabilityLoading ? (
                  <p style={{ color: "#6b7280" }}>Cargando horarios...</p>
                ) : availability?.slots?.[0]?.slots?.length > 0 ? (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                    {availability.slots[0].slots.map((slot: any) => (
                      <button
                        key={`${slot.start}-${slot.end}`}
                        onClick={() => !slot.available || setSelectedSlot(slot)}
                        disabled={!slot.available}
                        style={{
                          padding: "0.5rem 1rem",
                          borderRadius: styles.borderRadius,
                          border: `1px solid ${slot.available ? styles.primaryColor : "#d1d5db"}`,
                          backgroundColor: selectedSlot?.start === slot.start
                            ? styles.primaryColor
                            : slot.available
                            ? "white"
                            : "#f3f4f6",
                          color: selectedSlot?.start === slot.start
                            ? "white"
                            : slot.available
                            ? styles.primaryColor
                            : "#9ca3af",
                          fontSize: "0.875rem",
                          fontWeight: "500",
                          cursor: slot.available ? "pointer" : "not-allowed",
                          opacity: slot.available ? 1 : 0.5,
                        }}
                      >
                        {slot.start}
                      </button>
                    ))}
                  </div>
                ) : (
                  <p style={{ color: "#6b7280" }}>No hay horarios disponibles para esta fecha.</p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Step 3: Booking Form */}
        {selectedSlot && (
          <div style={{ marginTop: "1.5rem", borderTop: "1px solid #e5e7eb", paddingTop: "1.5rem" }}>
            <h2 style={{ fontSize: "1rem", fontWeight: "600", marginBottom: "1rem", color: "#374151" }}>
              3. Completa tu reserva
            </h2>

            {/* Selected info */}
            <div
              style={{
                backgroundColor: "#f9fafb",
                borderRadius: styles.borderRadius,
                padding: "1rem",
                marginBottom: "1rem",
              }}
            >
              <p style={{ fontSize: "0.875rem", color: "#374151" }}>
                <strong>{calendar?.rooms?.find((r: any) => r.id === selectedRoom)?.name}</strong>
                {" • "}
                {selectedDate?.toLocaleDateString("es-ES", { day: "numeric", month: "long" })}
                {" • "}
                {selectedSlot.start} - {selectedSlot.end}
              </p>
            </div>

            {/* Number of people */}
            <div style={{ marginBottom: "1rem" }}>
              <label style={{ display: "block", fontSize: "0.875rem", fontWeight: "500", marginBottom: "0.5rem" }}>
                Número de personas
              </label>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <button
                  onClick={() => setNumPeople(Math.max(1, numPeople - 1))}
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "50%",
                    border: "1px solid #d1d5db",
                    background: "white",
                    cursor: "pointer",
                    fontSize: "1.25rem",
                  }}
                >
                  -
                </button>
                <span style={{ fontSize: "1.25rem", fontWeight: "600", minWidth: "2rem", textAlign: "center" }}>
                  {numPeople}
                </span>
                <button
                  onClick={() => setNumPeople(Math.min(10, numPeople + 1))}
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "50%",
                    border: "1px solid #d1d5db",
                    background: "white",
                    cursor: "pointer",
                    fontSize: "1.25rem",
                  }}
                >
                  +
                </button>
              </div>
            </div>

            {/* Guest info */}
            <div style={{ display: "grid", gap: "1rem", marginBottom: "1rem" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.875rem", fontWeight: "500", marginBottom: "0.25rem" }}>
                  Nombre completo *
                </label>
                <input
                  type="text"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    borderRadius: styles.borderRadius,
                    border: "1px solid #d1d5db",
                    fontSize: "0.875rem",
                  }}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "0.875rem", fontWeight: "500", marginBottom: "0.25rem" }}>
                  Email *
                </label>
                <input
                  type="email"
                  value={guestEmail}
                  onChange={(e) => setGuestEmail(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    borderRadius: styles.borderRadius,
                    border: "1px solid #d1d5db",
                    fontSize: "0.875rem",
                  }}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "0.875rem", fontWeight: "500", marginBottom: "0.25rem" }}>
                  Teléfono
                </label>
                <input
                  type="tel"
                  value={guestPhone}
                  onChange={(e) => setGuestPhone(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    borderRadius: styles.borderRadius,
                    border: "1px solid #d1d5db",
                    fontSize: "0.875rem",
                  }}
                />
              </div>
            </div>

            {/* Custom fields */}
            {calendar?.custom_fields?.map((field: any) => (
              <div key={field.id} style={{ marginBottom: "1rem" }}>
                <label style={{ display: "block", fontSize: "0.875rem", fontWeight: "500", marginBottom: "0.25rem" }}>
                  {field.field_label}
                  {field.is_required && " *"}
                </label>
                {field.field_type === "select" ? (
                  <select
                    value={customFields[field.field_key] || ""}
                    onChange={(e) => setCustomFields({ ...customFields, [field.field_key]: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      borderRadius: styles.borderRadius,
                      border: "1px solid #d1d5db",
                      fontSize: "0.875rem",
                    }}
                  >
                    <option value="">Selecciona...</option>
                    {field.options?.map((opt: any) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type={field.field_type === "email" ? "email" : field.field_type === "phone" ? "tel" : "text"}
                    value={customFields[field.field_key] || ""}
                    onChange={(e) => setCustomFields({ ...customFields, [field.field_key]: e.target.value })}
                    placeholder={field.field_placeholder}
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      borderRadius: styles.borderRadius,
                      border: "1px solid #d1d5db",
                      fontSize: "0.875rem",
                    }}
                  />
                )}
              </div>
            ))}

            {/* Terms */}
            <div style={{ marginBottom: "1rem" }}>
              <label style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem", fontSize: "0.875rem" }}>
                <input
                  type="checkbox"
                  checked={acceptTerms}
                  onChange={(e) => setAcceptTerms(e.target.checked)}
                  style={{ marginTop: "0.25rem" }}
                />
                <span>
                  Acepto los{" "}
                  <a href="#" style={{ color: styles.primaryColor }}>
                    términos y condiciones
                  </a>
                </span>
              </label>
            </div>

            {/* Total and Submit */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                paddingTop: "1rem",
                borderTop: "1px solid #e5e7eb",
              }}
            >
              <div>
                <p style={{ fontSize: "0.75rem", color: "#6b7280" }}>Total</p>
                <p style={{ fontSize: "1.5rem", fontWeight: "bold", color: styles.primaryColor }}>
                  €
                  {(
                    Number(calendar?.rooms?.find((r: any) => r.id === selectedRoom)?.price_per_person || 0) *
                    numPeople
                  ).toFixed(2)}
                </p>
              </div>
              <button
                onClick={handleBooking}
                disabled={bookingLoading}
                style={{
                  padding: "0.75rem 2rem",
                  borderRadius: styles.borderRadius,
                  backgroundColor: styles.primaryColor,
                  color: "white",
                  fontWeight: "600",
                  fontSize: "1rem",
                  border: "none",
                  cursor: bookingLoading ? "not-allowed" : "pointer",
                  opacity: bookingLoading ? 0.7 : 1,
                }}
              >
                {bookingLoading ? "Procesando..." : "Confirmar Reserva"}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <p
        style={{
          textAlign: "center",
          marginTop: "1rem",
          fontSize: "0.75rem",
          color: "#9ca3af",
        }}
      >
        Powered by{" "}
        <a href="/" style={{ color: styles.primaryColor }}>
          EscapeMaster
        </a>
      </p>
    </div>
  );
}
