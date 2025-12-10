# 🏢 Organizations & TPV API

Endpoints para gestionar organizaciones (tenants) y terminales de punto de venta.

## Organizations

### Crear Organización

`POST /organizations`

Crea una nueva organización. El usuario que la crea se convierte en propietario.

**Request Body:**

```json
{
  "name": "Escape Room XYZ",
  "slug": "escape-room-xyz",
  "description": "El mejor escape room de la ciudad"
}
```

**Response (201 Created):**

```json
{
  "id": "org-uuid",
  "name": "Escape Room XYZ",
  "slug": "escape-room-xyz",
  "description": "El mejor escape room de la ciudad",
  "invitation_code": "ABC123XYZ",
  "is_active": true,
  "created_at": "2025-12-04T12:00:00Z"
}
```

---

### Obtener Organización

`GET /organizations/{organization_id}`

**Response (200 OK):**

```json
{
  "id": "org-uuid",
  "name": "Escape Room XYZ",
  "slug": "escape-room-xyz",
  "description": "El mejor escape room de la ciudad",
  "is_active": true,
  "created_at": "2025-12-04T12:00:00Z",
  "users_count": 5,
  "rooms_count": 3
}
```

---

### Actualizar Organización

`PUT /organizations/{organization_id}`

**Request Body:**

```json
{
  "name": "Nuevo Nombre",
  "description": "Nueva descripción"
}
```

**Response (200 OK):** Objeto de organización actualizado.

---

### Unirse a Organización

`POST /organizations/join`

Unirse a una organización existente usando un código de invitación.

**Request Body:**

```json
{
  "invitation_code": "ABC123XYZ"
}
```

**Response (200 OK):**

```json
{
  "id": "org-uuid",
  "name": "Escape Room XYZ",
  "message": "Te has unido a la organización correctamente"
}
```

---

### Generar Código de Invitación

`POST /organizations/{organization_id}/invite`

Genera un nuevo código de invitación para la organización.

**Response (200 OK):**

```json
{
  "invitation_code": "NUEVO123CODE",
  "expires_at": null
}
```

---

## 💳 TPV (Terminales de Punto de Venta)

Gestión de TPVs para una organización.

### Crear TPV

`POST /organizations/{org_id}/tpvs/`

**Request Body:**

```json
{
  "name": "TPV Principal",
  "is_active": true,
  "income_destination": "ES12345678901234567890",
  "supported_methods": ["card", "bizum", "cash"],
  "configuration": {
    "terminal_id": "TERM001",
    "merchant_code": "MERCH123"
  }
}
```

**Response (201 Created):**

```json
{
  "id": "tpv-uuid",
  "organization_id": "org-uuid",
  "name": "TPV Principal",
  "is_active": true,
  "income_destination": "ES12345678901234567890",
  "supported_methods": ["card", "bizum", "cash"],
  "configuration": {
    "terminal_id": "TERM001",
    "merchant_code": "MERCH123"
  },
  "created_at": "2025-12-04T10:00:00Z",
  "updated_at": "2025-12-04T10:00:00Z"
}
```

---

### Listar TPVs

`GET /organizations/{org_id}/tpvs/`

**Query Parameters:**

- `skip`: Registros a saltar (default: 0)
- `limit`: Límite de registros (default: 100)

**Response (200 OK):**

```json
[
  {
    "id": "tpv-uuid",
    "name": "TPV Principal",
    "is_active": true,
    "supported_methods": ["card", "bizum", "cash"]
  }
]
```

---

### Obtener TPV

`GET /organizations/{org_id}/tpvs/{tpv_id}`

**Response (200 OK):** Objeto TPV completo.

---

### Actualizar TPV

`PUT /organizations/{org_id}/tpvs/{tpv_id}`

**Request Body:**

```json
{
  "name": "Nombre Actualizado",
  "is_active": false
}
```

**Response (200 OK):** Objeto TPV actualizado.

---

### Eliminar TPV

`DELETE /organizations/{org_id}/tpvs/{tpv_id}`

**Response (204 No Content)**

---

## 🔐 Permisos Requeridos

| Endpoint                | Permiso                           |
| ----------------------- | --------------------------------- |
| Crear organización      | - (cualquier usuario autenticado) |
| Ver organización        | Miembro de la organización        |
| Actualizar organización | `settings:update`                 |
| Generar invitación      | `settings:update`                 |
| CRUD TPVs               | `settings:manage_integrations`    |

---

**Última actualización:** 4 de diciembre de 2025
