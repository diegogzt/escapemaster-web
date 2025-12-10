# 💰 Payments & Coupons API

Endpoints para gestionar pagos y cupones de descuento.

## Payments (Pagos)

### Listar Pagos

`GET /payments`

**Query Parameters:**

- `skip`, `limit`: Paginación
- `status`: pending, completed, refunded, failed
- `date_from`, `date_to`: Rango de fechas
- `booking_id`: Filtrar por reserva

**Response (200 OK):**

```json
{
  "items": [
    {
      "id": "payment-uuid",
      "booking_id": "booking-uuid",
      "amount": 100.0,
      "payment_method": "card",
      "status": "completed",
      "reference": "PAY-123456",
      "created_at": "2025-12-04T12:00:00Z"
    }
  ],
  "total": 50
}
```

---

### Crear Pago

`POST /payments`

**Request Body:**

```json
{
  "booking_id": "booking-uuid",
  "amount": 100.0,
  "payment_method": "card",
  "reference": "PAY-123456"
}
```

**Métodos de pago válidos:**

- `card`: Tarjeta de crédito/débito
- `cash`: Efectivo
- `bizum`: Bizum
- `transfer`: Transferencia bancaria
- `stripe`: Stripe online

**Response (201 Created):**

```json
{
  "id": "payment-uuid",
  "booking_id": "booking-uuid",
  "amount": 100.0,
  "payment_method": "card",
  "status": "completed",
  "reference": "PAY-123456",
  "created_at": "2025-12-04T12:00:00Z"
}
```

---

### Obtener Pago

`GET /payments/{payment_id}`

**Response (200 OK):** Objeto pago completo con detalles de reserva.

---

### Reembolsar Pago

`POST /payments/{payment_id}/refund`

**Request Body:**

```json
{
  "amount": 50.0,
  "reason": "Cancelación por parte del cliente"
}
```

**Response (200 OK):**

```json
{
  "id": "payment-uuid",
  "original_amount": 100.0,
  "refunded_amount": 50.0,
  "status": "partially_refunded",
  "refund_reason": "Cancelación por parte del cliente",
  "refunded_at": "2025-12-05T10:00:00Z"
}
```

---

## 🎫 Coupons (Cupones)

### Listar Cupones

`GET /coupons`

**Query Parameters:**

- `skip`, `limit`: Paginación
- `is_active`: Solo cupones activos
- `code`: Buscar por código

**Response (200 OK):**

```json
{
  "items": [
    {
      "id": "coupon-uuid",
      "code": "VERANO2025",
      "discount_type": "percentage",
      "discount_value": 20,
      "valid_from": "2025-06-01",
      "valid_until": "2025-08-31",
      "max_uses": 100,
      "current_uses": 45,
      "min_amount": 50.0,
      "is_active": true
    }
  ],
  "total": 10
}
```

---

### Crear Cupón

`POST /coupons`

**Request Body:**

```json
{
  "code": "VERANO2025",
  "discount_type": "percentage",
  "discount_value": 20,
  "valid_from": "2025-06-01",
  "valid_until": "2025-08-31",
  "max_uses": 100,
  "min_amount": 50.0,
  "description": "Descuento de verano"
}
```

**Tipos de descuento:**

- `percentage`: Porcentaje (ej: 20 = 20% de descuento)
- `fixed`: Cantidad fija (ej: 10 = 10€ de descuento)

**Response (201 Created):** Objeto cupón creado.

---

### Obtener Cupón

`GET /coupons/{coupon_id}`

**Response (200 OK):** Objeto cupón completo.

---

### Actualizar Cupón

`PUT /coupons/{coupon_id}`

**Request Body:** Campos a actualizar.

**Response (200 OK):** Objeto cupón actualizado.

---

### Eliminar Cupón

`DELETE /coupons/{coupon_id}`

**Response (204 No Content)**

---

### Validar Cupón

`POST /coupons/validate`

Valida un cupón y calcula el descuento aplicable.

**Request Body:**

```json
{
  "code": "VERANO2025",
  "total_amount": 100.0
}
```

**Response (200 OK):**

```json
{
  "valid": true,
  "coupon": {
    "id": "coupon-uuid",
    "code": "VERANO2025",
    "discount_type": "percentage",
    "discount_value": 20
  },
  "original_amount": 100.0,
  "discount_amount": 20.0,
  "final_amount": 80.0,
  "message": "Cupón aplicado correctamente"
}
```

**Posibles errores:**

```json
{
  "valid": false,
  "error": "COUPON_EXPIRED",
  "message": "El cupón ha expirado"
}
```

**Códigos de error:**

- `COUPON_NOT_FOUND`: Cupón no existe
- `COUPON_EXPIRED`: Cupón expirado
- `COUPON_NOT_ACTIVE`: Cupón desactivado
- `COUPON_MAX_USES`: Límite de usos alcanzado
- `COUPON_MIN_AMOUNT`: No cumple monto mínimo
- `COUPON_NOT_VALID_YET`: Cupón aún no válido

---

## 📊 Resumen de Estados

### Estados de Pago

| Estado               | Descripción                           |
| -------------------- | ------------------------------------- |
| `pending`            | Pago iniciado, pendiente de confirmar |
| `completed`          | Pago completado correctamente         |
| `failed`             | Pago fallido                          |
| `refunded`           | Pago reembolsado completamente        |
| `partially_refunded` | Pago reembolsado parcialmente         |

### Estados de Cupón

| Campo          | Descripción               |
| -------------- | ------------------------- |
| `is_active`    | Si el cupón está activo   |
| `valid_from`   | Fecha desde que es válido |
| `valid_until`  | Fecha hasta que es válido |
| `max_uses`     | Máximo de usos permitidos |
| `current_uses` | Usos actuales             |

---

## 🔐 Permisos Requeridos

| Endpoint         | Permiso            |
| ---------------- | ------------------ |
| Listar pagos     | `payments:view`    |
| Crear pago       | `payments:process` |
| Reembolsar       | `payments:refund`  |
| Listar cupones   | `coupons:view`     |
| Crear cupón      | `coupons:create`   |
| Actualizar cupón | `coupons:update`   |
| Eliminar cupón   | `coupons:delete`   |
| Validar cupón    | `coupons:validate` |

---

**Última actualización:** 4 de diciembre de 2025
