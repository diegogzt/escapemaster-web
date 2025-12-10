"use client";

import React, { useState } from "react";
import { Filter, Download, Search } from "lucide-react";
import Input from "@/components/Input";

const mockTransactions = [
  {
    id: "TRX-9821",
    date: "2023-12-10",
    concept: "Reserva #4021 - La Mazmorra",
    amount: 120,
    status: "completed",
    method: "Tarjeta",
  },
  {
    id: "TRX-9822",
    date: "2023-12-10",
    concept: "Reserva #4022 - Bunker",
    amount: 90,
    status: "completed",
    method: "Bizum",
  },
  {
    id: "TRX-9823",
    date: "2023-12-09",
    concept: "Bono Regalo #55",
    amount: 60,
    status: "completed",
    method: "Web",
  },
  {
    id: "TRX-9824",
    date: "2023-12-09",
    concept: "Reserva #4019 - Laboratorio",
    amount: 100,
    status: "pending",
    method: "Efectivo",
  },
  {
    id: "TRX-9825",
    date: "2023-12-08",
    concept: "Devolución #3990",
    amount: -120,
    status: "refunded",
    method: "Tarjeta",
  },
];

export function RevenueTableWidget() {
  const [filter, setFilter] = useState("");

  const filteredData = mockTransactions.filter(
    (t) =>
      t.concept.toLowerCase().includes(filter.toLowerCase()) ||
      t.id.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-beige h-full flex flex-col">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h3 className="font-semibold text-dark">Registro de Transacciones</h3>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar..."
              className="pl-9 pr-4 py-2 text-sm border border-beige rounded-lg focus:border-primary focus:outline-none w-full sm:w-48"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
          </div>
          <button className="p-2 border border-beige rounded-lg hover:bg-light text-secondary">
            <Filter className="h-4 w-4" />
          </button>
          <button className="p-2 border border-beige rounded-lg hover:bg-light text-secondary">
            <Download className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="overflow-x-auto flex-1">
        <table className="w-full text-sm text-left">
          <thead className="bg-light text-secondary font-medium">
            <tr>
              <th className="p-3 rounded-l-lg">ID</th>
              <th className="p-3">Fecha</th>
              <th className="p-3">Concepto</th>
              <th className="p-3">Método</th>
              <th className="p-3">Estado</th>
              <th className="p-3 text-right rounded-r-lg">Importe</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-beige">
            {filteredData.map((trx) => (
              <tr key={trx.id} className="hover:bg-gray-50 transition-colors">
                <td className="p-3 font-mono text-xs text-gray-500">
                  {trx.id}
                </td>
                <td className="p-3 text-dark">{trx.date}</td>
                <td className="p-3 text-dark font-medium">{trx.concept}</td>
                <td className="p-3 text-secondary">{trx.method}</td>
                <td className="p-3">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      trx.status === "completed"
                        ? "bg-primary/10 text-primary"
                        : trx.status === "pending"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {trx.status === "completed"
                      ? "Completado"
                      : trx.status === "pending"
                      ? "Pendiente"
                      : "Reembolsado"}
                  </span>
                </td>
                <td
                  className={`p-3 text-right font-bold ${
                    trx.amount < 0 ? "text-red-600" : "text-dark"
                  }`}
                >
                  {trx.amount > 0 ? "+" : ""}
                  {trx.amount} €
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
