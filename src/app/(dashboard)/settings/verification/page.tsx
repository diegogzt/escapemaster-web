"use client";

import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle } from "@/components/Card";
import Button from "@/components/Button";
import { kyb } from "@/services/api";
import { toast } from "sonner";
import {
  FileCheck,
  Upload,
  CheckCircle,
  Clock,
  XCircle,
  Building,
  CreditCard,
  AlertCircle,
  Loader2,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";

export default function VerificationPage() {
  const [documents, setDocuments] = useState<any[]>([]);
  const [status, setStatus] = useState<any>(null);
  const [bankAccount, setBankAccount] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [savingBank, setSavingBank] = useState(false);
  const [bankForm, setBankForm] = useState({ iban: "", bic_swift: "", bank_name: "", account_holder_name: "" });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [docs, stat, bank] = await Promise.allSettled([
        kyb.getDocuments(),
        kyb.getStatus(),
        kyb.getBankAccount(),
      ]);
      if (docs.status === "fulfilled") setDocuments(Array.isArray(docs.value) ? docs.value : docs.value.documents || []);
      if (stat.status === "fulfilled") setStatus(stat.value);
      if (bank.status === "fulfilled" && bank.value) {
        setBankAccount(bank.value);
        setBankForm({ iban: bank.value.iban || "", bic_swift: bank.value.bic_swift || "", bank_name: bank.value.bank_name || "", account_holder_name: bank.value.account_holder_name || "" });
      }
    } catch { /* some endpoints may not exist */ }
    finally { setLoading(false); }
  }

  const handleUpload = async (docType: string, file: File) => {
    setUploading(true);
    try {
      const result = await kyb.uploadDocument(docType, file);
      setDocuments(prev => [...prev, result]);
      toast.success(`Documento "${docType}" subido correctamente`);
    } catch {
      toast.error("Error al subir el documento");
    } finally {
      setUploading(false);
    }
  };

  const handleSaveBank = async () => {
    if (!bankForm.iban || !bankForm.account_holder_name || !bankForm.bank_name) {
      toast.error("Completa IBAN, titular y nombre del banco");
      return;
    }
    setSavingBank(true);
    try {
      await kyb.updateBankAccount(bankForm);
      toast.success("Datos bancarios actualizados");
    } catch {
      toast.error("Error al guardar");
    } finally {
      setSavingBank(false);
    }
  };

  const statusColor = (s: string) => {
    switch (s) {
      case "approved": case "verified": return "text-green-600 bg-green-50";
      case "pending": case "under_review": return "text-yellow-700 bg-yellow-50";
      case "rejected": return "text-red-600 bg-red-50";
      default: return "text-[var(--color-muted-foreground)] bg-[var(--color-light)]";
    }
  };

  const statusIcon = (s: string) => {
    switch (s) {
      case "approved": case "verified": return <CheckCircle size={18} />;
      case "pending": case "under_review": return <Clock size={18} />;
      case "rejected": return <XCircle size={18} />;
      default: return <AlertCircle size={18} />;
    }
  };

  const DOC_TYPES = [
    { key: "business_registration", label: "Registro Mercantil" },
    { key: "tax_id", label: "CIF / NIF Empresa" },
    { key: "proof_of_address", label: "Justificante de Domicilio" },
    { key: "id_document", label: "DNI del Representante" },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="w-full pb-12">
      <Link href="/settings" className="text-primary text-sm hover:underline mb-2 inline-block">
        <ArrowLeft size={14} className="inline mr-1" /> Volver a Ajustes
      </Link>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-primary flex items-center gap-2">
          <FileCheck size={28} />
          Verificación Empresarial (KYB)
        </h1>
        <p className="text-[var(--color-foreground)] opacity-60">
          Verifica tu empresa para poder recibir pagos y acceder a todas las funcionalidades.
        </p>
      </div>

      {/* Status Banner */}
      {status && (
        <div className={`mb-6 p-4 rounded-lg border flex items-center gap-3 ${statusColor(status.kyb_status || "not_started")}`}>
          {statusIcon(status.kyb_status || "not_started")}
          <div>
            <p className="font-semibold">
              Estado: {status.kyb_status === "verified" ? "Verificado" : status.kyb_status === "pending" ? "En revisión" : status.kyb_status === "rejected" ? "Rechazado" : "No iniciado"}
            </p>
            {status.message && <p className="text-sm">{status.message}</p>}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Documents */}
        <Card className="border-beige">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building size={20} className="text-primary" />
              Documentos Requeridos
            </CardTitle>
          </CardHeader>
          <div className="p-6 space-y-4">
            {DOC_TYPES.map(docType => {
              const uploaded = documents.find((d: any) => d.document_type === docType.key);
              return (
                <div key={docType.key} className="flex items-center justify-between p-3 border border-beige rounded-lg">
                  <div className="flex items-center gap-3">
                    {uploaded ? (
                      <CheckCircle size={20} className="text-green-500" />
                    ) : (
                      <AlertCircle size={20} className="text-yellow-500" />
                    )}
                    <div>
                      <p className="text-sm font-medium text-[var(--color-foreground)]">{docType.label}</p>
                      {uploaded && (
                        <p className="text-xs text-[var(--color-muted-foreground)]">
                          Subido el {new Date(uploaded.created_at).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                  {!uploaded && (
                    <label className="cursor-pointer">
                      <input
                        type="file"
                        className="hidden"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={e => {
                          const file = e.target.files?.[0];
                          if (file) handleUpload(docType.key, file);
                        }}
                      />
                      <span className="flex items-center gap-1 px-3 py-1.5 bg-primary/10 text-primary text-sm rounded-lg hover:bg-primary/20 transition-colors">
                        <Upload size={14} /> Subir
                      </span>
                    </label>
                  )}
                </div>
              );
            })}
          </div>
        </Card>

        {/* Bank Account */}
        <Card className="border-beige">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard size={20} className="text-primary" />
              Datos Bancarios
            </CardTitle>
          </CardHeader>
          <div className="p-6 space-y-4">
            <p className="text-sm text-[var(--color-muted-foreground)]">
              Indica tu cuenta bancaria para recibir los pagos de tus reservas.
            </p>
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-sm font-medium">Titular de la cuenta</label>
                <input
                  type="text"
                  value={bankForm.account_holder_name}
                  onChange={e => setBankForm(p => ({ ...p, account_holder_name: e.target.value }))}
                  placeholder="Nombre empresa o titular"
                  className="w-full px-4 py-2 border border-beige rounded-lg"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Nombre del banco</label>
                <input
                  type="text"
                  value={bankForm.bank_name}
                  onChange={e => setBankForm(p => ({ ...p, bank_name: e.target.value }))}
                  placeholder="Banco Santander, CaixaBank, etc."
                  className="w-full px-4 py-2 border border-beige rounded-lg"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">IBAN</label>
                <input
                  type="text"
                  value={bankForm.iban}
                  onChange={e => setBankForm(p => ({ ...p, iban: e.target.value.toUpperCase() }))}
                  placeholder="ES00 0000 0000 0000 0000 0000"
                  className="w-full px-4 py-2 border border-beige rounded-lg font-mono"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">SWIFT / BIC (opcional)</label>
                <input
                  type="text"
                  value={bankForm.bic_swift}
                  onChange={e => setBankForm(p => ({ ...p, bic_swift: e.target.value.toUpperCase() }))}
                  placeholder="XXXXESXX"
                  className="w-full px-4 py-2 border border-beige rounded-lg font-mono"
                />
              </div>
            </div>
            <Button loading={savingBank} onClick={handleSaveBank} block>
              Guardar Datos Bancarios
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
