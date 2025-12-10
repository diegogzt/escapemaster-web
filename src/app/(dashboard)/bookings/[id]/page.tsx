"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import BookingForm from "@/components/domain/bookings/BookingForm";
import { bookings } from "@/services/api";

export default function EditBookingPage() {
  const params = useParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBooking = async () => {
      if (params.id) {
        try {
          const data = await bookings.get(params.id as string);
          setBooking(data);
        } catch (error) {
          console.error("Error fetching booking", error);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchBooking();
  }, [params.id]);

  if (loading) return <div>Cargando...</div>;
  if (!booking) return <div>Reserva no encontrada</div>;

  return <BookingForm initialData={booking} isEdit={true} />;
}
