import { useEffect, useState } from "react";
import { Clock } from "lucide-react";
import { WidgetConfigOptions } from "../types";

interface DigitalClockProps extends WidgetConfigOptions {}

export function DigitalClockWidget({}: DigitalClockProps) {
  const [time, setTime] = useState<Date | null>(null);

  useEffect(() => {
    setTime(new Date());
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  if (!time) return <div className="bg-[var(--color-background)] rounded-xl h-full animate-pulse border border-[var(--color-beige)]"></div>;

  return (
    <div className="bg-primary text-white rounded-xl shadow-xl h-full flex flex-col overflow-hidden relative group">
      <div className="absolute inset-0 bg-black/10 transition-opacity group-hover:bg-transparent duration-500"></div>
      <div className="absolute top-4 right-4 opacity-50"><Clock size={40} className="text-white drop-shadow-lg" /></div>
      
      <div className="flex-1 flex flex-col items-center justify-center p-6 z-10 text-center">
         <p className="text-[10px] sm:text-sm font-bold uppercase tracking-[0.3em] mb-2 opacity-80 shadow-black drop-shadow-sm">
           {time.toLocaleDateString('es-ES', { weekday: 'long' })}
         </p>
         <h2 className="text-4xl sm:text-6xl md:text-7xl font-black tabular-nums tracking-tighter drop-shadow-md">
           {time.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
         </h2>
         <div className="flex items-center gap-2 mt-2 opacity-90 drop-shadow-sm">
             <span className="text-sm sm:text-lg font-bold">
               {time.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
             </span>
         </div>
         <p className="text-[10px] opacity-50 mt-4 tracking-widest uppercase">Hora Local</p>
      </div>
    </div>
  );
}
