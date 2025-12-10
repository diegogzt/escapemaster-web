# 🚪 Rooms & Bookings API

Endpoints para gestionar salas de escape y reservas.

## Rooms (Salas)

### Listar Salas

`GET /rooms`

**Query Parameters:**

- `skip`: Registros a saltar (default: 0)
- `limit`: Límite de registros (default: 20)
- `is_active`: Filtrar por estado activo

**Response (200 OK):**

```json
{
  "items": [
    {
      "id": "room-uuid",
      "name": "La Cripta Misteriosa",
      "description": "Resuelve los enigmas ancestrales...",
      "difficulty": "medium",
      "max_players": 6,
      "min_players": 2,
      "duration_minutes": 60,
      "price": 25.0,
      "theme": "terror",
      "is_active": true
    }
  ],
  "total": 5
}
```

---

### Crear Sala

`POST /rooms`

**Request Body:**

```json
{
  "name": "La Cripta Misteriosa",
  "description": "Resuelve los enigmas ancestrales...",
  "difficulty": "medium",
  "max_players": 6,
  "min_players": 2,
  "duration_minutes": 60,
  "price": 25.0,
  "theme": "terror",
  "is_active": true
}
```

**Response (201 Created):** Objeto sala creada.

---

### Obtener Sala

`GET /rooms/{room_id}`

**Response (200 OK):** Objeto sala con horarios.

---

### Actualizar Sala

`PUT /rooms/{room_id}`

**Request Body:** Campos a actualizar.

**Response (200 OK):** Objeto sala actualizada.

---

### Eliminar Sala

`DELETE /rooms/{room_id}`

**Response (204 No Content)**

---

### Ver Disponibilidad

`GET /rooms/{room_id}/availability`

**Query Parameters:**

- `date`: Fecha a consultar (YYYY-MM-DD)

**Response (200 OK):**

```json
{
  "date": "2025-12-15",
  "room_id": "room-uuid",
  "room_name": "La Cripta Misteriosa",
  "available_slots": [
    {
      "start_time": "10:00",
      "end_time": "11:00",
      "available": true
    },
    {
      "start_time": "11:30",
      "end_time": "12:30",
      "available": false,
      "booking_id": "booking-uuid"
    },
    {
      "start_time": "14:00",
      "end_time": "15:00",
      "available": true
    }
  ]
}
```

---

### Configurar Horario

`POST /rooms/{room_id}/schedules`

**Request Body:**

```json
{
  "day_of_week": 1,
  "start_time": "10:00",
  "end_time": "22:00",
  "is_active": true
}
```

**Días de la semana:** 0=Domingo, 1=Lunes, ..., 6=Sábado

**Response (201 Created):**

```json
{
  "id": "schedule-uuid",
  "room_id": "room-uuid",
  "day_of_week": 1,
  "start_time": "10:00:00",
  "end_time": "22:00:00",
  "is_active": true
}
```

---

## 📅 Bookings (Reservas)

### Listar Reservas

`GET /bookings`

**Query Parameters:**

- `skip`, `limit`: Paginación
- `status`: pending, confirmed, completed, cancelled
- `date_from`, `date_to`: Rango de fechas
- `room_id`: Filtrar por sala

**Response (200 OK):**

```json
{
  "items": [
    {
      "id": "booking-uuid",
      "room": {
        "id": "room-uuid",
        "name": "La Cripta Misteriosa"
      },
      "customer_name": "Juan Pérez",
      "customer_email": "juan@example.com",
      "customer_phone": "+34612345678",
      "booking_date": "2025-12-15",
      "start_time": "18:00",
      "end_time": "19:00",
      "num_players": 4,
      "status": "confirmed",
      "total_amount": 100.0,
      "paid_amount": 50.0,
      "assigned_to": null
    }
  ],
  "total": 25
}
```

---

### Crear Reserva

`POST /bookings`

**Request Body:**

```json
{
  "room_id": "room-uuid",
  "customer_name": "Juan Pérez",
  "customer_email": "juan@example.com",
  "customer_phone": "+34612345678",
  "booking_date": "2025-12-15",
  "start_time": "18:00",
  "num_players": 4,
  "notes": "Celebración de cumpleaños",
  "coupon_code": "DESCUENTO10"
}
```

**Response (201 Created):** Objeto reserva creada.

---

### Obtener Reserva

`GET /bookings/{booking_id}`

**Response (200 OK):** Objeto reserva completo con detalles de sala y pagos.

---

### Actualizar Reserva

`PUT /bookings/{booking_id}`

**Request Body:** Campos a actualizar.

**Response (200 OK):** Objeto reserva actualizada.

---

### Cancelar Reserva

`DELETE /bookings/{booking_id}`

**Response (204 No Content)**

---

### Cambiar Estado

`PUT /bookings/{booking_id}/status`

**Request Body:**

```json
{
  "status": "confirmed"
}
```

**Estados válidos:**

- `pending`: Pendiente de confirmación
- `confirmed`: Confirmada
- `in_progress`: En curso
- `completed`: Completada
- `cancelled`: Cancelada
- `no_show`: No se presentó

**Response (200 OK):** Objeto reserva con estado actualizado.

---

### Procesar Pago

`POST /bookings/{booking_id}/payment`

**Request Body:**

```json
{
  "amount": 50.0,
  "payment_method": "card",
  "reference": "PAY-123456"
}
```

**Response (200 OK):** Objeto reserva con pago registrado.

---

### Asignar a Empleado

`POST /bookings/{booking_id}/assign`

**Request Body:**

```json
{
  "user_id": "employee-uuid"
}
```

**Response (200 OK):** Objeto reserva con empleado asignado.

---

### Reclamar Reserva

`POST /bookings/{booking_id}/claim`

El empleado actual se asigna a sí mismo la reserva.

**Response (200 OK):** Objeto reserva reclamada.

---

### Confirmar Reserva

`POST /bookings/{booking_id}/confirm`

**Response (200 OK):** Objeto reserva confirmada.

---

### Generar Factura

`GET /bookings/{booking_id}/invoice`

**Response (200 OK):**

```json
{
  "invoice_number": "INV-2025-001234",
  "booking_id": "booking-uuid",
  "organization": {
    "name": "Escape Room XYZ",
    "address": "Calle Principal 123"
  },
  "customer": {
    "name": "Juan Pérez",
    "email": "juan@example.com"
  },
  "items": [
    {
      "description": "La Cripta Misteriosa - 4 jugadores",
      "quantity": 1,
      "unit_price": 100.0,
      "total": 100.0
    }
  ],
  "subtotal": 100.0,
  "discount": 10.0,
  "tax": 18.9,
  "total": 108.9,
  "created_at": "2025-12-15T18:00:00Z"
}
```

---

## 🔐 Permisos Requeridos

| Endpoint            | Permiso                      |
| ------------------- | ---------------------------- |
| Listar salas        | `rooms:view`                 |
| CRUD salas          | `rooms:create/update/delete` |
| Configurar horarios | `rooms:manage_schedules`     |
| Listar reservas     | `bookings:view`              |
| Crear reserva       | `bookings:create`            |
| Actualizar reserva  | `bookings:update`            |
| Cancelar reserva    | `bookings:cancel`            |
| Cambiar estado      | `bookings:manage_status`     |

---

**Última actualización:** 4 de diciembre de 2025
