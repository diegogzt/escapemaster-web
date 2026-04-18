import { useEffect, useState } from "react";
import { Euro, ArrowRightCircle } from "lucide-react";
import { WidgetConfigOptions } from "../types";
import { payments } from "@/services/api";

interface RecentPaymentsProps extends WidgetConfigOptions {}

export function RecentPaymentsWidget({}: RecentPaymentsProps) {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await payments.list({ limit: 5 });
        const list = Array.isArray(response) ? response : (response?.data || response?.payments || []);
        setItems(list.slice(0, 5));
      } catch (error) {
        console.error("Failed to fetch recent payments", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getMethodLabel = (method: string) => {
    switch (method?.toUpperCase()) {
      case "CARD": return "Tarjeta";
      case "CASH": return "Efectivo";
      case "BANK_TRANSFER": return "Transferencia";
      case "PAYPAL": return "PayPal";
      case "Bizum": return "Bizum";
      default: return method || "Otro";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status?.toLowerCase()) {
      case "completed": return "Completado";
      case "pending": return "Pendiente";
      case "failed": return "Fallido";
      case "refunded": return "Reembolsado";
      default: return status || "Desconocido";
    }
  };

  return (
    <div className="bg-[var(--color-background)] rounded-xl border border-[var(--color-beige)] shadow-sm h-full flex flex-col overflow-hidden">
      <div className="p-4 border-b border-[var(--color-beige)] flex-shrink-0">
        <h3 className="text-sm font-semibold flex items-center gap-2"><Euro size={16}/> Pagos Recientes</h3>
        <p className="text-xs text-[var(--color-muted-foreground)]">Últimos abonos registrados</p>
      </div>
      <div className="flex-1 p-4 overflow-auto min-h-0">
        {loading ? (
          <div className="space-y-3 animate-pulse">
            {[1, 2, 3].map(i => <div key={i} className="h-10 bg-[var(--color-background-soft)] rounded-lg"></div>)}
          </div>
        ) : items.length === 0 ? (
          <div className="text-center text-[var(--color-muted-foreground)] py-8 text-sm">No hay transacciones recientes.</div>
        ) : (
          <div className="space-y-2">
            {items.map(p => (
              <div key={p.id} className="flex justify-between items-center p-2 rounded-lg hover:bg-[var(--color-light)] border border-transparent hover:border-beige transition-all">
                <div className="flex items-center gap-2">
                   <ArrowRightCircle size={16} className="text-primary opacity-60"/>
                   <div>
                     <p className="text-sm font-medium">{Number(p.amount).toFixed(2)} €</p>
                     <p className="text-[10px] text-[var(--color-muted-foreground)]">{getMethodLabel(p.payment_method)}</p>
                   </div>
                </div>
                <div className="text-right">
                   <p className="text-xs font-bold">{new Date(p.created_at).toLocaleDateString('es-ES')}</p>
                   <p className="text-[10px] text-green-600 font-bold bg-green-50 px-2 rounded mt-0.5 capitalize">{getStatusLabel(p.status)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
