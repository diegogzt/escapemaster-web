import React, { useState } from "react";
import { cn } from "../utils";

export interface CalendarProps {
  size?: "sm" | "md" | "lg";
  selectedDate?: Date;
  onDateSelect?: (date: Date) => void;
  variant?: "primary" | "secondary" | "accent";
  showHeader?: boolean;
  disablePastDates?: boolean;
  className?: string;
}

const Calendar = ({
  size = "md",
  selectedDate = new Date(),
  onDateSelect,
  variant = "primary",
  showHeader = true,
  disablePastDates = false,
  className,
}: CalendarProps) => {
  const [currentMonth, setCurrentMonth] = useState(
    new Date(selectedDate.getFullYear(), selectedDate.getMonth())
  );
  const [selected, setSelected] = useState(selectedDate);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Get days in month
  const daysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  // Get first day of month (0 = Sunday, 1 = Monday, etc.)
  const firstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  // Navigate months
  const previousMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1)
    );
  };

  const nextMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1)
    );
  };

  // Handle date selection
  const handleDateClick = (day: number) => {
    const selectedDay = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      day
    );

    if (disablePastDates && selectedDay < today) {
      return;
    }

    setSelected(selectedDay);
    if (onDateSelect) {
      onDateSelect(selectedDay);
    }
  };

  // Generate calendar days
  const generateCalendarDays = () => {
    const days: (number | null)[] = [];
    const firstDay = firstDayOfMonth(currentMonth);
    const totalDays = daysInMonth(currentMonth);

    // Empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }

    // Days of the month
    for (let i = 1; i <= totalDays; i++) {
      days.push(i);
    }

    return days;
  };

  const calendarDays = generateCalendarDays();
  const monthName = currentMonth.toLocaleString("es-ES", { month: "long" });
  const year = currentMonth.getFullYear();

  // Size configurations
  const sizeConfig = {
    sm: {
      container: "w-64",
      header: "text-base",
      day: "text-xs",
      dayCell: "w-8 h-8 text-xs",
      weekday: "text-xs",
      nav: "text-sm",
    },
    md: {
      container: "w-80",
      header: "text-lg",
      day: "text-sm",
      dayCell: "w-10 h-10 text-sm",
      weekday: "text-sm",
      nav: "text-base",
    },
    lg: {
      container: "w-96",
      header: "text-xl",
      day: "text-base",
      dayCell: "w-12 h-12 text-base",
      weekday: "text-base",
      nav: "text-lg",
    },
  };

  const variantConfig = {
    primary: {
      header: "text-primary",
      selected: "bg-primary text-white",
      today: "border-2 border-primary",
      hover: "hover:bg-[var(--color-light)] hover:text-[var(--color-foreground)]",
      nav: "text-primary hover:bg-[var(--color-light)]",
    },
    secondary: {
      header: "text-secondary",
      selected: "bg-secondary text-[var(--color-foreground)]",
      today: "border-2 border-secondary",
      hover: "hover:bg-[var(--color-light)] hover:text-[var(--color-foreground)]",
      nav: "text-secondary hover:bg-[var(--color-light)]",
    },
    accent: {
      header: "text-accent",
      selected: "bg-accent text-white",
      today: "border-2 border-accent",
      hover: "hover:bg-[var(--color-light)] hover:text-[var(--color-foreground)]",
      nav: "text-accent hover:bg-[var(--color-light)]",
    },
  };

  const config = sizeConfig[size];
  const colors = variantConfig[variant];

  const isDateSelected = (day: number | null) => {
    if (day === null) return false;
    return (
      day === selected.getDate() &&
      selected.getMonth() === currentMonth.getMonth() &&
      selected.getFullYear() === currentMonth.getFullYear()
    );
  };

  const isToday = (day: number | null) => {
    if (day === null) return false;
    const checkDate = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      day
    );
    return checkDate.getTime() === today.getTime();
  };

  const isPastDate = (day: number | null) => {
    if (day === null) return false;
    const checkDate = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      day
    );
    return checkDate < today;
  };

  return (
    <div
      className={cn(
        "bg-[var(--color-background)] border-2 border-[var(--color-beige)] rounded-lg p-4 shadow-sm",
        config.container,
        className
      )}
    >
      {/* Header */}
      {showHeader && (
        <div
          className={cn(
            "text-center font-bold mb-4",
            config.header,
            colors.header
          )}
        >
          <div className="capitalize">
            {monthName} {year}
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={previousMonth}
          className={cn(
            "px-3 py-1 rounded font-semibold transition-colors",
            config.nav,
            colors.nav
          )}
        >
          ←
        </button>
        <span className={cn("font-semibold", config.nav)}>
          {monthName} {year}
        </span>
        <button
          onClick={nextMonth}
          className={cn(
            "px-3 py-1 rounded font-semibold transition-colors",
            config.nav,
            colors.nav
          )}
        >
          →
        </button>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"].map((day) => (
          <div
            key={day}
            className={cn("text-center font-bold text-[var(--color-foreground)]", config.weekday)}
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((day, index) => {
          const isSelected = isDateSelected(day);
          const isTodayDate = isToday(day);
          const isPast = isPastDate(day);
          const isDisabled = disablePastDates && isPast;

          return (
            <button
              key={index}
              onClick={() => day !== null && handleDateClick(day)}
              disabled={isDisabled || day === null}
              className={cn(
                "rounded font-semibold transition-all",
                config.dayCell,
                day === null && "invisible",
                isDisabled && "opacity-30 cursor-not-allowed",
                isSelected && colors.selected,
                isTodayDate && !isSelected && colors.today,
                !isSelected &&
                  !isTodayDate &&
                  day !== null &&
                  !isDisabled &&
                  colors.hover,
                "flex items-center justify-center"
              )}
            >
              {day}
            </button>
          );
        })}
      </div>

      {/* Footer with selected date */}
      <div className="mt-4 pt-4 border-t-2 border-[var(--color-beige)] text-center">
        <p className={cn("text-sm font-semibold", colors.header)}>
          {selected.toLocaleDateString("es-ES", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      </div>
    </div>
  );
};

export default Calendar;
