import { useState, useEffect } from "react";
import { X, Calculator, RefreshCw } from "lucide-react";
import Button from "@/components/Button";
import Input from "@/components/Input";

interface CalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CalculatorModal({ isOpen, onClose }: CalculatorModalProps) {
  const [revenue, setRevenue] = useState<string>("");
  const [vatRate, setVatRate] = useState<string>("21");
  const [expenseRate, setExpenseRate] = useState<string>("30");
  const [results, setResults] = useState({
    base: 0,
    vat: 0,
    expenses: 0,
    net: 0,
    margin: 0
  });

  useEffect(() => {
    calculate();
  }, [revenue, vatRate, expenseRate]);

  const calculate = () => {
    const rev = parseFloat(revenue) || 0;
    const vat = parseFloat(vatRate) || 0;
    const expRate = parseFloat(expenseRate) || 0;

    // Assuming input revenue includes VAT? Or ex-VAT?
    // Usually business revenue inputs are ex-VAT, but let's assume specific request.
    // "Calculadora para calcular otras cifras" implies general utility.
    // Let's assume Input is Gross (Base).

    const vatAmount = rev * (vat / 100);
    const totalWithVat = rev + vatAmount;
    
    // Expenses usually calculated on base
    const expenses = rev * (expRate / 100);
    const net = rev - expenses;
    const margin = rev > 0 ? (net / rev) * 100 : 0;

    setResults({
      base: rev,
      vat: vatAmount,
      expenses,
      net,
      margin
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-[var(--color-background)] rounded-2xl shadow-2xl w-full max-w-md border border-[var(--color-beige)] overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="bg-[var(--color-primary)] text-white p-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Calculator size={20} />
            <h3 className="font-bold text-lg">Calculadora de Rentabilidad</h3>
          </div>
          <button onClick={onClose} className="hover:bg-white/20 p-1 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[var(--color-muted-foreground)] mb-1">
                Ingresos Estimados (Base Imponible)
              </label>
              <Input
                type="number"
                value={revenue}
                onChange={(e) => setRevenue(e.target.value)}
                placeholder="0.00"
                className="text-lg font-bold"
                icon={<span className="text-gray-500 font-bold">€</span>}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[var(--color-muted-foreground)] mb-1">
                  IVA (%)
                </label>
                <div className="flex items-center bg-[var(--color-light)] rounded-xl px-3 border border-transparent focus-within:border-primary">
                  <input
                    type="number"
                    value={vatRate}
                    onChange={(e) => setVatRate(e.target.value)}
                    className="bg-transparent w-full py-2.5 outline-none font-semibold text-[var(--color-foreground)]"
                  />
                  <span className="text-[var(--color-muted-foreground)] font-bold">%</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--color-muted-foreground)] mb-1">
                  Gastos Operativos (%)
                </label>
                <div className="flex items-center bg-[var(--color-light)] rounded-xl px-3 border border-transparent focus-within:border-primary">
                  <input
                    type="number"
                    value={expenseRate}
                    onChange={(e) => setExpenseRate(e.target.value)}
                    className="bg-transparent w-full py-2.5 outline-none font-semibold text-[var(--color-foreground)]"
                  />
                  <span className="text-[var(--color-muted-foreground)] font-bold">%</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[var(--color-light)]/30 rounded-xl p-4 space-y-3 border border-[var(--color-beige)]/50">
            <div className="flex justify-between items-center">
              <span className="text-sm text-[var(--color-muted-foreground)]">IVA Repercutido</span>
              <span className="font-mono font-medium text-[var(--color-foreground)]">+€{results.vat.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-[var(--color-muted-foreground)]">Gastos Estimados</span>
              <span className="font-mono font-medium text-red-500">-€{results.expenses.toFixed(2)}</span>
            </div>
            <div className="h-px bg-[var(--color-beige)] w-full my-2"></div>
            <div className="flex justify-between items-center">
              <span className="font-bold text-[var(--color-foreground)]">Beneficio Neto</span>
              <span className="font-bold text-xl text-primary">€{results.net.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-[var(--color-muted-foreground)]">Margen de Beneficio</span>
              <span className={`font-bold ${results.margin > 20 ? 'text-primary' : 'text-orange-500'}`}>
                {results.margin.toFixed(1)}%
              </span>
            </div>
          </div>
          
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => { setRevenue(""); }}>
              <RefreshCw size={16} className="mr-2" />
              Limpiar
            </Button>
            <Button variant="primary" onClick={onClose}>
              Cerrar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
