"use client";

import React, { Suspense } from "react";
import BookingForm from "@/components/domain/bookings/BookingForm";

export default function CreateBookingPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <BookingForm />
    </Suspense>
  );
}
