"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Input from "@/components/Input";
import Select from "@/components/Select";
import Button from "@/components/Button";
import Tabs from "@/components/Tabs";
import { bookings, rooms } from "@/services/api";
import {
  ArrowLeft,
  Save,
  Phone,
  MessageCircle,
  Camera,
  PenTool,
  Plus,
  Trash2,
} from "lucide-react";

interface BookingFormProps {
  initialData?: any;
  isEdit?: boolean;
}

export default function BookingForm({
  initialData,
  isEdit = false,
}: BookingFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [roomOptions, setRoomOptions] = useState<
    { value: string; label: string }[]
  >([]);

  // Form State
  const [formData, setFormData] = useState({
    // General
    room_id: "",
    game_level: "Normal",
    num_people: 2,
    booking_status: "confirmed",
    created_at: new Date().toISOString(), // Read-only
    start_date: new Date().toISOString().split("T")[0],
    start_time: "10:00",
    game_language: "Español",

    // Guest
    full_name: "",
    email: "",
    identification_number: "",
    phone: "",
    gdpr_link: "", // Read-only/Generated
    notes: "",
    internal_notes: "",
    calendar_language: "Castellano",

    // Payment
    payment_method: "Redsys",
    transaction_id: "",
    voucher_code: "",
    voucher_amount: 0,
    promo_code: "",
    promo_amount: 0,

    // Custom Fields
    custom_escapes_played: "Menos de 5",
    custom_played_resident: "No",
    custom_source: "Google",
    custom_language_pref: "Español",

    // Invoice
    invoice_name: "",
    invoice_email: "",
    invoice_phone: "",
    invoice_dni: "",
    invoice_address: "",
    invoice_zip: "",

    // Payment Summary
    deposit_amount: 0, // Paga y señal
    payment_card: 0,
    payment_bizum: 0,
    payment_cash: 0,
    discount_amount: 0,
    price_per_person: 20, // Base price, should come from room
  });

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const data = await rooms.list();
        if (Array.isArray(data)) {
          setRoomOptions(
            data.map((r: any) => ({ value: r.id, label: r.name }))
          );
          if (!isEdit && data.length > 0) {
            setFormData((prev) => ({ ...prev, room_id: data[0].id }));
          }
        }
      } catch (err) {
        console.error("Error loading rooms", err);
      }
    };
    fetchRooms();
  }, [isEdit]);

  useEffect(() => {
    if (initialData) {
      // Map initialData to formData
      // This needs careful mapping depending on API response structure
      setFormData((prev) => ({
        ...prev,
        ...initialData,
        // Ensure dates are formatted correctly for inputs
        start_date: initialData.start_time
          ? new Date(initialData.start_time).toISOString().split("T")[0]
          : prev.start_date,
        start_time: initialData.start_time
          ? new Date(initialData.start_time).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })
          : prev.start_time,
      }));
    }
  }, [initialData]);

  // Calculations
  const totalPaid =
    Number(formData.deposit_amount) +
    Number(formData.payment_card) +
    Number(formData.payment_bizum) +
    Number(formData.payment_cash);
  const subtotal =
    Number(formData.num_people) * Number(formData.price_per_person);
  const totalPrice = subtotal + Number(formData.discount_amount); // Discount can be negative or positive (increment)
  const remainingBalance = totalPrice - totalPaid;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Combine date and time
      const startDateTime = new Date(
        `${formData.start_date}T${formData.start_time}`
      );
      // Default duration 1.5h
      const endDateTime = new Date(startDateTime.getTime() + 90 * 60000);

      const payload = {
        ...formData,
        start_time: startDateTime.toISOString(),
        end_time: endDateTime.toISOString(),
        total_price: totalPrice,
        remaining_balance: remainingBalance,
        // Map other fields as needed by backend
        guest: {
          full_name: formData.full_name,
          email: formData.email,
          phone: formData.phone,
          identification_number: formData.identification_number,
        },
      };

      if (isEdit) {
        // await bookings.update(initialData.id, payload);
        // TODO: Implement bookings.update(initialData.id, payload)
      } else {
        // await bookings.create(payload);
        // TODO: Implement bookings.create(payload)
      }

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      router.push("/bookings"); // Redirect to bookings list or calendar
    } catch (err: any) {
      setError(err.response?.data?.detail || "Error al guardar la reserva");
    } finally {
      setLoading(false);
    }
  };

  const GeneralTab = (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Select
          label="Juego"
          options={roomOptions}
          value={formData.room_id}
          onChange={(e) =>
            setFormData({ ...formData, room_id: e.target.value })
          }
        />
        <Select
          label="Nivel"
          options={[
            { value: "Normal", label: "Normal" },
            { value: "Tensión", label: "Tensión (Recomendado)" },
            { value: "Terror", label: "Terror" },
          ]}
          value={formData.game_level}
          onChange={(e) =>
            setFormData({ ...formData, game_level: e.target.value })
          }
        />
        <Select
          label="Número jugadores"
          options={Array.from({ length: 10 }, (_, i) => ({
            value: String(i + 2),
            label: String(i + 2),
          }))}
          value={String(formData.num_people)}
          onChange={(e) =>
            setFormData({ ...formData, num_people: Number(e.target.value) })
          }
        />
        <Select
          label="Estado"
          options={[
            { value: "confirmed", label: "Confirmada" },
            { value: "pending", label: "Pendiente" },
            { value: "cancelled", label: "Cancelada" },
          ]}
          value={formData.booking_status}
          onChange={(e) =>
            setFormData({ ...formData, booking_status: e.target.value })
          }
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Input
          label="Fecha creación"
          value={new Date(formData.created_at).toLocaleString()}
          disabled
          className="bg-[var(--color-light)]"
        />
        <Input
          label="Fecha reserva"
          type="date"
          value={formData.start_date}
          onChange={(e) =>
            setFormData({ ...formData, start_date: e.target.value })
          }
        />
        <div className="flex gap-2 items-end">
          <div className="flex-1">
            <Input
              label="Hora reserva"
              type="time"
              value={formData.start_time}
              onChange={(e) =>
                setFormData({ ...formData, start_time: e.target.value })
              }
            />
          </div>
          <button className="mb-6 p-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors">
            <Plus size={20} />
          </button>
        </div>
      </div>

      <Select
        label="Idioma seleccionado para el juego por el cliente"
        options={[
          { value: "Español", label: "Español" },
          { value: "Inglés", label: "Inglés" },
          { value: "Catalán", label: "Catalán" },
        ]}
        value={formData.game_language}
        onChange={(e) =>
          setFormData({ ...formData, game_language: e.target.value })
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Input
          label="Nombre"
          value={formData.full_name}
          onChange={(e) =>
            setFormData({ ...formData, full_name: e.target.value })
          }
        />
        <Input
          label="Correo Electrónico"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        />
        <Input
          label="DNI/NIF"
          value={formData.identification_number}
          onChange={(e) =>
            setFormData({ ...formData, identification_number: e.target.value })
          }
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Teléfono"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
        />
        <Input
          label="RGPD"
          value={formData.gdpr_link}
          disabled
          placeholder="Enlace a firma RGPD"
          className="bg-[var(--color-light)]"
        />
      </div>

      <div>
        <label className="block mb-2 font-semibold text-[var(--color-foreground)]">
          Comentarios
        </label>
        <textarea
          className="w-full px-3 py-2 border-2 border-[var(--color-beige)] rounded-lg focus:border-primary focus:outline-none transition-colors min-h-[80px]"
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
        />
      </div>

      <div>
        <label className="block mb-2 font-semibold text-[var(--color-foreground)]">
          Comentarios internos
        </label>
        <textarea
          className="w-full px-3 py-2 border-2 border-[var(--color-beige)] rounded-lg focus:border-primary focus:outline-none transition-colors min-h-[80px]"
          value={formData.internal_notes}
          onChange={(e) =>
            setFormData({ ...formData, internal_notes: e.target.value })
          }
        />
      </div>

      <Select
        label="Idioma del calendario / email de la reserva"
        options={[
          { value: "Castellano", label: "Castellano" },
          { value: "Inglés", label: "Inglés" },
        ]}
        value={formData.calendar_language}
        onChange={(e) =>
          setFormData({ ...formData, calendar_language: e.target.value })
        }
      />
    </div>
  );

  const PaymentTab = (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Select
          label="Forma pago"
          options={[
            { value: "Redsys", label: "Redsys" },
            { value: "Stripe", label: "Stripe" },
            { value: "Efectivo", label: "Efectivo" },
            { value: "Transferencia", label: "Transferencia" },
          ]}
          value={formData.payment_method}
          onChange={(e) =>
            setFormData({ ...formData, payment_method: e.target.value })
          }
        />
        <Input
          label="# Transacción"
          value={formData.transaction_id}
          onChange={(e) =>
            setFormData({ ...formData, transaction_id: e.target.value })
          }
          disabled
          className="bg-[var(--color-light)]"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Código bono"
            value={formData.voucher_code}
            onChange={(e) =>
              setFormData({ ...formData, voucher_code: e.target.value })
            }
          />
          <Input
            label="Importe bono"
            type="number"
            value={formData.voucher_amount}
            onChange={(e) =>
              setFormData({
                ...formData,
                voucher_amount: Number(e.target.value),
              })
            }
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Código promo"
            value={formData.promo_code}
            onChange={(e) =>
              setFormData({ ...formData, promo_code: e.target.value })
            }
          />
          <Input
            label="Importe promo"
            type="number"
            value={formData.promo_amount}
            disabled
            className="bg-[var(--color-light)]"
          />
        </div>
      </div>

      {/* Tabla de Pagos Mock */}
      <div className="border border-[var(--color-beige)] rounded-lg overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-[var(--color-light)] text-[var(--color-foreground)] font-semibold">
            <tr>
              <th className="p-3">ID</th>
              <th className="p-3">Origen pago</th>
              <th className="p-3">Método</th>
              <th className="p-3">Importe</th>
              <th className="p-3">Fecha</th>
              <th className="p-3">Resultado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-beige">
            <tr>
              <td className="p-3 text-secondary" colSpan={6}>
                No hay pagos registrados
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );

  const CustomFieldsTab = (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Select
          label="¿Cuántos escape room habéis jugado?"
          options={[
            { value: "Menos de 5", label: "Menos de 5" },
            { value: "5-10", label: "5-10" },
            { value: "10-50", label: "10-50" },
            { value: "Más de 50", label: "Más de 50" },
          ]}
          value={formData.custom_escapes_played}
          onChange={(e) =>
            setFormData({ ...formData, custom_escapes_played: e.target.value })
          }
        />
        <Select
          label="¿Has jugado algún juego de Resident Riddle?"
          options={[
            { value: "No", label: "No" },
            { value: "Sí", label: "Sí" },
          ]}
          value={formData.custom_played_resident}
          onChange={(e) =>
            setFormData({ ...formData, custom_played_resident: e.target.value })
          }
        />
        <Select
          label="¿Cómo nos habéis conocido?"
          options={[
            { value: "Google", label: "Google" },
            { value: "Redes Sociales", label: "Redes Sociales" },
            { value: "Amigos", label: "Amigos" },
          ]}
          value={formData.custom_source}
          onChange={(e) =>
            setFormData({ ...formData, custom_source: e.target.value })
          }
        />
        <Select
          label="¿En que idioma quieres jugar?"
          options={[
            { value: "Español", label: "Español" },
            { value: "Inglés", label: "Inglés" },
          ]}
          value={formData.custom_language_pref}
          onChange={(e) =>
            setFormData({ ...formData, custom_language_pref: e.target.value })
          }
        />
      </div>
    </div>
  );

  const InvoiceTab = (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="Nombre"
          value={formData.invoice_name}
          onChange={(e) =>
            setFormData({ ...formData, invoice_name: e.target.value })
          }
        />
        <Input
          label="Correo Electrónico"
          value={formData.invoice_email}
          onChange={(e) =>
            setFormData({ ...formData, invoice_email: e.target.value })
          }
        />
        <Input
          label="Teléfono"
          value={formData.invoice_phone}
          onChange={(e) =>
            setFormData({ ...formData, invoice_phone: e.target.value })
          }
        />
        <Input
          label="DNI/NIF"
          value={formData.invoice_dni}
          onChange={(e) =>
            setFormData({ ...formData, invoice_dni: e.target.value })
          }
        />
        <Input
          label="Dirección de facturación"
          value={formData.invoice_address}
          onChange={(e) =>
            setFormData({ ...formData, invoice_address: e.target.value })
          }
        />
        <Input
          label="Código postal"
          value={formData.invoice_zip}
          onChange={(e) =>
            setFormData({ ...formData, invoice_zip: e.target.value })
          }
        />
      </div>
    </div>
  );

  const ChangelogTab = (
    <div className="space-y-6">
      <div className="bg-[var(--color-light)] p-4 rounded-lg border border-[var(--color-beige)]">
        <p className="text-sm text-secondary mb-2">Creado por usuario</p>
        <div className="font-medium text-[var(--color-foreground)]">system</div>
      </div>
      <div className="space-y-2">
        <div className="text-sm text-secondary">
          Email Nueva Reserva enviado a {formData.email || "..."}{" "}
          {new Date().toLocaleString()}
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <button
            onClick={() => router.back()}
            className="flex items-center text-secondary hover:text-[var(--color-foreground)] mb-2"
          >
            <ArrowLeft size={20} className="mr-2" />
            Volver
          </button>
          <h1 className="text-2xl font-bold text-[var(--color-foreground)]">
            {isEdit
              ? `Reserva ${initialData?.id?.slice(0, 8) || ""}`
              : "Nueva Reserva"}
          </h1>
        </div>
        <div className="flex gap-2">
          <button className="p-2 bg-primary text-white rounded hover:bg-primary/90">
            <Phone size={20} />
          </button>
          <button className="p-2 bg-secondary text-white rounded hover:bg-secondary/90">
            <MessageCircle size={20} />
          </button>
          <button className="p-2 bg-dark text-white rounded hover:bg-dark/90">
            <Camera size={20} />
          </button>
          <button className="p-2 bg-accent text-[var(--color-foreground)] rounded hover:bg-accent/90">
            <PenTool size={20} />
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Main Content */}
        <div className="flex-1 bg-[var(--color-background)] rounded-xl shadow-sm border border-[var(--color-beige)] p-6">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <Tabs
              tabs={[
                { id: "general", label: "General", content: GeneralTab },
                { id: "payment", label: "Pago", content: PaymentTab },
                {
                  id: "custom",
                  label: "Campos personalizados",
                  content: CustomFieldsTab,
                },
                { id: "invoice", label: "Factura", content: InvoiceTab },
                {
                  id: "changelog",
                  label: "Registro de cambios",
                  content: ChangelogTab,
                },
              ]}
            />

            <div className="mt-6 flex justify-end">
              <Button type="submit" disabled={loading}>
                {loading ? (
                  "Guardando..."
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" /> Guardar Reserva
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>

        {/* Sidebar: Resumen de pago */}
        <div className="w-full lg:w-96 space-y-6">
          <div className="bg-[var(--color-background)] rounded-xl shadow-sm border border-[var(--color-beige)] overflow-hidden">
            <div className="bg-primary text-white p-3 font-semibold">
              Resumen de pago
            </div>
            <div className="p-6 space-y-4">
              <Input
                label="Paga y señal"
                type="number"
                value={formData.deposit_amount}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    deposit_amount: Number(e.target.value),
                  })
                }
              />
              <Input
                label="Tarjeta"
                type="number"
                value={formData.payment_card}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    payment_card: Number(e.target.value),
                  })
                }
              />
              <Input
                label="Bizum"
                type="number"
                value={formData.payment_bizum}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    payment_bizum: Number(e.target.value),
                  })
                }
              />
              <Input
                label="Efectivo"
                type="number"
                value={formData.payment_cash}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    payment_cash: Number(e.target.value),
                  })
                }
              />

              <div className="pt-4 border-t border-[var(--color-beige)] space-y-3">
                <div className="flex justify-between items-center bg-[var(--color-light)] p-2 rounded">
                  <span className="text-sm font-medium text-[var(--color-foreground)]">
                    Importe pagado
                  </span>
                  <span className="font-bold text-[var(--color-foreground)]">{totalPaid} €</span>
                </div>
                <div className="flex justify-between items-center bg-[var(--color-light)] p-2 rounded">
                  <span className="text-sm font-medium text-[var(--color-foreground)]">
                    Importe pendiente
                  </span>
                  <span className="font-bold text-[var(--color-foreground)]">
                    {remainingBalance} €
                  </span>
                </div>
              </div>

              <div className="pt-4">
                <label className="block mb-2 font-semibold text-[var(--color-foreground)] text-sm">
                  Descuento/Incremento de precio
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    className="flex-1 px-3 py-2 border-2 border-[var(--color-beige)] rounded-lg focus:border-primary focus:outline-none"
                    value={formData.discount_amount}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        discount_amount: Number(e.target.value),
                      })
                    }
                  />
                  <button className="p-2 bg-primary text-white rounded-lg hover:bg-primary/90">
                    <Plus size={20} />
                  </button>
                </div>
              </div>

              <div className="flex justify-between items-center bg-beige p-3 rounded font-bold text-lg text-[var(--color-foreground)]">
                <span>Importe total</span>
                <span>{totalPrice} €</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
