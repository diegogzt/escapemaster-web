# 📊 Dashboard API

Endpoints para obtener estadísticas y analytics de la organización.

## Endpoints

### Estadísticas Generales

`GET /dashboard/stats`

Obtiene estadísticas de alto nivel de la organización.

**Query Parameters:**

- `period`: `today`, `week`, `month`, `year` (default: `month`)

**Response (200 OK):**

```json
{
  "period": "month",
  "total_bookings": 150,
  "confirmed_bookings": 125,
  "cancelled_bookings": 15,
  "pending_bookings": 10,
  "total_revenue": 3750.0,
  "pending_revenue": 250.0,
  "avg_players_per_booking": 4.2,
  "occupancy_rate": 0.75,
  "top_rooms": [
    {
      "room_id": "room-uuid",
      "room_name": "La Cripta Misteriosa",
      "bookings_count": 45,
      "revenue": 1125.0
    },
    {
      "room_id": "room-uuid-2",
      "room_name": "El Laboratorio",
      "bookings_count": 38,
      "revenue": 950.0
    }
  ],
  "comparison": {
    "bookings_change": 12.5,
    "revenue_change": 8.3
  }
}
```

---

### Datos de Ingresos

`GET /dashboard/revenue`

Obtiene el desglose de ingresos a lo largo del tiempo.

**Query Parameters:**

- `period`: `week`, `month`, `quarter`, `year` (default: `month`)
- `group_by`: `day`, `week`, `month` (default: `day`)

**Response (200 OK):**

```json
{
  "period": "month",
  "group_by": "day",
  "total_revenue": 3750.0,
  "data": [
    {
      "date": "2025-12-01",
      "revenue": 125.0,
      "bookings_count": 5
    },
    {
      "date": "2025-12-02",
      "revenue": 200.0,
      "bookings_count": 8
    },
    {
      "date": "2025-12-03",
      "revenue": 175.0,
      "bookings_count": 7
    }
  ],
  "by_payment_method": {
    "card": 2500.0,
    "cash": 800.0,
    "bizum": 350.0,
    "transfer": 100.0
  },
  "by_room": [
    {
      "room_id": "room-uuid",
      "room_name": "La Cripta Misteriosa",
      "revenue": 1125.0
    }
  ]
}
```

---

### Gráfico de Reservas

`GET /dashboard/bookings-chart`

Obtiene datos de reservas para gráficos a lo largo del tiempo.

**Query Parameters:**

- `period`: `week`, `month`, `quarter`, `year` (default: `month`)
- `group_by`: `day`, `week`, `month` (default: `day`)

**Response (200 OK):**

```json
{
  "period": "month",
  "group_by": "day",
  "data": [
    {
      "date": "2025-12-01",
      "total": 8,
      "confirmed": 6,
      "cancelled": 1,
      "pending": 1,
      "completed": 5
    },
    {
      "date": "2025-12-02",
      "total": 12,
      "confirmed": 10,
      "cancelled": 0,
      "pending": 2,
      "completed": 8
    }
  ],
  "summary": {
    "total_bookings": 150,
    "avg_per_day": 5.0,
    "busiest_day": "Sábado",
    "busiest_hour": "18:00"
  },
  "by_status": {
    "confirmed": 125,
    "pending": 10,
    "cancelled": 15,
    "completed": 100,
    "no_show": 5
  },
  "by_room": [
    {
      "room_id": "room-uuid",
      "room_name": "La Cripta Misteriosa",
      "bookings": 45
    }
  ]
}
```

---

## 📈 Métricas Disponibles

### Estadísticas de Reservas

- Total de reservas por período
- Reservas por estado (confirmadas, pendientes, canceladas)
- Tasa de ocupación
- Promedio de jugadores por reserva
- Comparativa con período anterior

### Estadísticas de Ingresos

- Ingresos totales
- Ingresos por método de pago
- Ingresos por sala
- Tendencia de ingresos
- Ingresos pendientes de cobro

### Estadísticas de Salas

- Salas más populares
- Ocupación por sala
- Horarios más demandados

---

## 📅 Períodos Disponibles

| Período   | Descripción      |
| --------- | ---------------- |
| `today`   | Día actual       |
| `week`    | Últimos 7 días   |
| `month`   | Últimos 30 días  |
| `quarter` | Últimos 90 días  |
| `year`    | Últimos 365 días |

## 📊 Agrupaciones

| Agrupación | Descripción     |
| ---------- | --------------- |
| `day`      | Datos diarios   |
| `week`     | Datos semanales |
| `month`    | Datos mensuales |

---

## 🔐 Permisos Requeridos

| Endpoint               | Permiso        |
| ---------------------- | -------------- |
| Estadísticas generales | `stats:view`   |
| Datos de ingresos      | `stats:view`   |
| Gráfico de reservas    | `stats:view`   |
| Exportar datos         | `stats:export` |

---

## 💡 Ejemplos de Uso

### Dashboard Principal

```bash
# Obtener estadísticas del mes
curl http://localhost:8000/dashboard/stats?period=month \
  -H "Authorization: Bearer <token>"

# Obtener ingresos de la semana
curl http://localhost:8000/dashboard/revenue?period=week \
  -H "Authorization: Bearer <token>"

# Obtener datos para gráfico
curl http://localhost:8000/dashboard/bookings-chart?period=month&group_by=day \
  -H "Authorization: Bearer <token>"
```

### Con Python

```python
import requests

headers = {"Authorization": f"Bearer {token}"}

# Estadísticas
stats = requests.get(
    "http://localhost:8000/dashboard/stats",
    params={"period": "month"},
    headers=headers
).json()

print(f"Total reservas: {stats['total_bookings']}")
print(f"Ingresos: {stats['total_revenue']}€")
print(f"Tasa ocupación: {stats['occupancy_rate']*100}%")
```

---

**Última actualización:** 4 de diciembre de 2025
