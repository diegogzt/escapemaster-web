"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Clock,
  Users,
  MapPin,
} from "lucide-react";
import Button from "@/components/Button";

// Tipos
type ViewType = "month" | "week" | "day";

interface Session {
  id: string;
  title: string;
  customer: string;
  start: Date;
  end: Date;
  room: string;
  status: "confirmed" | "pending" | "cancelled";
  color: string;
}

// Datos Mock
const generateMockSessions = (): Session[] => {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();

  return [
    // Mes Actual
    {
      id: "1",
      title: "La Cripta del Faraón",
      customer: "Ana García",
      start: new Date(year, month, 10, 10, 0),
      end: new Date(year, month, 10, 11, 30),
      room: "Sala 1",
      status: "confirmed",
      color: "bg-blue-100 text-blue-700 border-blue-200",
    },
    {
      id: "2",
      title: "Misión Espacial",
      customer: "Carlos Ruiz",
      start: new Date(year, month, 10, 14, 0),
      end: new Date(year, month, 10, 15, 0),
      room: "Sala 2",
      status: "pending",
      color: "bg-yellow-100 text-yellow-700 border-yellow-200",
    },
    {
      id: "3",
      title: "El Laboratorio Loco",
      customer: "Empresa Tech S.L.",
      start: new Date(year, month, 12, 16, 0),
      end: new Date(year, month, 12, 17, 30),
      room: "Sala 3",
      status: "confirmed",
      color: "bg-green-100 text-green-700 border-green-200",
    },
    {
      id: "4",
      title: "La Cripta del Faraón",
      customer: "Familia López",
      start: new Date(year, month, 15, 18, 0),
      end: new Date(year, month, 15, 19, 30),
      room: "Sala 1",
      status: "cancelled",
      color: "bg-red-100 text-red-700 border-red-200",
    },
    {
      id: "5",
      title: "Misión Espacial",
      customer: "Grupo de Amigos",
      start: new Date(year, month, 8, 12, 0),
      end: new Date(year, month, 8, 13, 30),
      room: "Sala 2",
      status: "confirmed",
      color: "bg-purple-100 text-purple-700 border-purple-200",
    },
    // Mes Pasado
    {
      id: "6",
      title: "La Cripta del Faraón",
      customer: "Cliente Pasado",
      start: new Date(year, month - 1, 25, 10, 0),
      end: new Date(year, month - 1, 25, 11, 30),
      room: "Sala 1",
      status: "confirmed",
      color: "bg-gray-100 text-gray-700 border-gray-200",
    },
    // Mes Siguiente
    {
      id: "7",
      title: "Misión Espacial",
      customer: "Cliente Futuro",
      start: new Date(year, month + 1, 5, 15, 0),
      end: new Date(year, month + 1, 5, 16, 30),
      room: "Sala 2",
      status: "confirmed",
      color: "bg-blue-100 text-blue-700 border-blue-200",
    },
  ];
};

export default function CalendarPage() {
  const router = useRouter();
  const [view, setView] = useState<ViewType>("month");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [sessions] = useState<Session[]>(generateMockSessions());

  // Utilidades de Fecha
  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    // 0 = Domingo, 1 = Lunes. Ajustamos para que Lunes sea 0
    const day = new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    return day === 0 ? 6 : day - 1;
  };

  const addMonths = (date: Date, amount: number) => {
    return new Date(date.getFullYear(), date.getMonth() + amount, 1);
  };

  const addDays = (date: Date, amount: number) => {
    const newDate = new Date(date);
    newDate.setDate(date.getDate() + amount);
    return newDate;
  };

  const isSameDay = (d1: Date, d2: Date) => {
    return (
      d1.getDate() === d2.getDate() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getFullYear() === d2.getFullYear()
    );
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("es-ES", {
      month: "long",
      year: "numeric",
    }).format(date);
  };

  // Navegación
  const handlePrev = () => {
    if (view === "month") setCurrentDate(addMonths(currentDate, -1));
    else if (view === "week") setCurrentDate(addDays(currentDate, -7));
    else setCurrentDate(addDays(currentDate, -1));
  };

  const handleNext = () => {
    if (view === "month") setCurrentDate(addMonths(currentDate, 1));
    else if (view === "week") setCurrentDate(addDays(currentDate, 7));
    else setCurrentDate(addDays(currentDate, 1));
  };

  const handleToday = () => setCurrentDate(new Date());

  // Renderizadores
  const renderMonthView = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];

    // Padding días vacíos al inicio
    for (let i = 0; i < firstDay; i++) {
      days.push(
        <div
          key={`empty-${i}`}
          className="h-32 bg-gray-50 border border-gray-100"
        ></div>
      );
    }

    // Días del mes
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        day
      );
      const daySessions = sessions.filter((s) => isSameDay(s.start, date));
      const isToday = isSameDay(date, new Date());

      days.push(
        <div
          key={day}
          className={`h-32 border border-gray-100 p-2 overflow-y-auto transition-colors hover:bg-gray-50 ${
            isToday ? "bg-blue-50/30" : "bg-white"
          }`}
        >
          <div className="flex justify-between items-start mb-1">
            <span
              className={`text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full ${
                isToday ? "bg-primary text-white" : "text-gray-700"
              }`}
            >
              {day}
            </span>
            {daySessions.length > 0 && (
              <span className="text-xs text-gray-400">
                {daySessions.length} ses.
              </span>
            )}
          </div>
          <div className="space-y-1">
            {daySessions.map((session) => (
              <div
                key={session.id}
                className={`text-xs p-1 rounded truncate border ${session.color}`}
              >
                {session.start.getHours()}:
                {session.start.getMinutes().toString().padStart(2, "0")}{" "}
                {session.title}
              </div>
            ))}
          </div>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-7 gap-px bg-gray-200 rounded-lg overflow-hidden border border-gray-200">
        {["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"].map((d) => (
          <div
            key={d}
            className="bg-gray-50 p-2 text-center text-sm font-semibold text-gray-500"
          >
            {d}
          </div>
        ))}
        {days}
      </div>
    );
  };

  const renderWeekView = () => {
    // Calcular inicio de semana (Lunes)
    const day = currentDate.getDay();
    const diff = currentDate.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(currentDate);
    monday.setDate(diff);

    const weekDays = Array.from({ length: 7 }, (_, i) => addDays(monday, i));
    const hours = Array.from({ length: 15 }, (_, i) => i + 8); // 08:00 a 22:00

    return (
      <div className="flex flex-col h-[600px] overflow-y-auto border rounded-lg">
        <div className="grid grid-cols-8 border-b sticky top-0 bg-white z-10">
          <div className="p-2 border-r bg-gray-50"></div>
          {weekDays.map((d, i) => (
            <div
              key={i}
              className={`p-2 text-center border-r font-medium ${
                isSameDay(d, new Date())
                  ? "text-primary bg-blue-50"
                  : "text-gray-700"
              }`}
            >
              <div className="text-xs uppercase text-gray-500">
                {["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"][d.getDay()]}
              </div>
              <div className="text-lg">{d.getDate()}</div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-8 flex-1">
          {/* Columna Horas */}
          <div className="border-r bg-gray-50">
            {hours.map((h) => (
              <div
                key={h}
                className="h-20 border-b text-xs text-gray-500 p-1 text-right pr-2"
              >
                {h}:00
              </div>
            ))}
          </div>
          {/* Columnas Días */}
          {weekDays.map((d, i) => (
            <div key={i} className="border-r relative">
              {hours.map((h) => (
                <div key={h} className="h-20 border-b border-gray-50"></div>
              ))}
              {/* Renderizar sesiones posicionadas absolutamente */}
              {sessions
                .filter((s) => isSameDay(s.start, d))
                .map((session) => {
                  const startHour = session.start.getHours();
                  const startMin = session.start.getMinutes();
                  const duration =
                    (session.end.getTime() - session.start.getTime()) /
                    (1000 * 60); // minutos
                  const top = (startHour - 8) * 80 + startMin * (80 / 60); // 80px por hora
                  const height = duration * (80 / 60);

                  return (
                    <div
                      key={session.id}
                      className={`absolute left-1 right-1 rounded p-1 text-xs border overflow-hidden ${session.color}`}
                      style={{ top: `${top}px`, height: `${height}px` }}
                    >
                      <div className="font-bold">{session.title}</div>
                      <div>
                        {session.start.getHours()}:
                        {session.start.getMinutes().toString().padStart(2, "0")}{" "}
                        - {session.end.getHours()}:
                        {session.end.getMinutes().toString().padStart(2, "0")}
                      </div>
                    </div>
                  );
                })}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderDayView = () => {
    const hours = Array.from({ length: 15 }, (_, i) => i + 8); // 08:00 a 22:00
    const daySessions = sessions.filter((s) => isSameDay(s.start, currentDate));

    return (
      <div className="border rounded-lg overflow-hidden bg-white">
        <div className="p-4 border-b bg-gray-50 text-center font-bold text-lg">
          {currentDate.toLocaleDateString("es-ES", {
            weekday: "long",
            day: "numeric",
            month: "long",
          })}
        </div>
        <div className="relative">
          {hours.map((h) => (
            <div key={h} className="flex border-b h-24">
              <div className="w-20 border-r bg-gray-50 p-2 text-right text-sm text-gray-500">
                {h}:00
              </div>
              <div className="flex-1 relative">
                {/* Línea de media hora */}
                <div className="absolute top-1/2 w-full border-t border-dashed border-gray-100"></div>
              </div>
            </div>
          ))}

          {/* Sesiones */}
          {daySessions.map((session) => {
            const startHour = session.start.getHours();
            const startMin = session.start.getMinutes();
            const duration =
              (session.end.getTime() - session.start.getTime()) / (1000 * 60);
            const top = (startHour - 8) * 96 + startMin * (96 / 60); // 96px por hora (h-24 = 6rem = 96px)
            const height = duration * (96 / 60);

            return (
              <div
                key={session.id}
                className={`absolute left-24 right-4 rounded-lg p-3 border shadow-sm ${session.color}`}
                style={{ top: `${top}px`, height: `${height}px` }}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-sm">{session.title}</h4>
                    <div className="flex items-center gap-2 text-xs mt-1 opacity-90">
                      <Clock size={12} />
                      <span>
                        {session.start.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}{" "}
                        -{" "}
                        {session.end.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs mt-1 opacity-90">
                      <Users size={12} />
                      <span>{session.customer}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-xs font-medium px-2 py-1 bg-white/50 rounded">
                    <MapPin size={12} />
                    {session.room}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 h-full flex flex-col">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            <button
              onClick={handlePrev}
              aria-label="Anterior"
              className="p-2 hover:bg-white hover:shadow-sm rounded-md transition-all text-gray-600"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={handleToday}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-white hover:shadow-sm rounded-md transition-all"
            >
              Hoy
            </button>
            <button
              onClick={handleNext}
              aria-label="Siguiente"
              className="p-2 hover:bg-white hover:shadow-sm rounded-md transition-all text-gray-600"
            >
              <ChevronRight size={20} />
            </button>
          </div>
          <h2 className="text-xl font-bold text-gray-900 capitalize">
            {view === "month"
              ? formatDate(currentDate)
              : view === "day"
              ? currentDate.toLocaleDateString("es-ES", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })
              : `Semana del ${currentDate.getDate()}`}
          </h2>
        </div>

        <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setView("month")}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
              view === "month"
                ? "bg-white shadow-sm text-primary"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Mes
          </button>
          <button
            onClick={() => setView("week")}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
              view === "week"
                ? "bg-white shadow-sm text-primary"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Semana
          </button>
          <button
            onClick={() => setView("day")}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
              view === "day"
                ? "bg-white shadow-sm text-primary"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Día
          </button>
        </div>

        <Button onClick={() => router.push("/bookings/create")}>
          <CalendarIcon className="mr-2 h-4 w-4" />
          Nueva Reserva
        </Button>
      </div>

      {/* Calendar Grid */}
      <div className="flex-1 bg-white rounded-xl shadow-sm overflow-hidden">
        {view === "month" && renderMonthView()}
        {view === "week" && renderWeekView()}
        {view === "day" && renderDayView()}
      </div>
    </div>
  );
}
