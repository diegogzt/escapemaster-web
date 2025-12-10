# 🔧 Admin API

Endpoints para administración global del sistema. Requiere permisos de administrador.

## Autenticación Admin

### Login Admin

`POST /admin/login`

Login especial para administradores del sistema.

**Request Body:**

```json
{
  "email": "admin@escapebook.com",
  "password": "AdminPassword123!"
}
```

**Response (200 OK):**

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "bearer",
  "is_admin": true
}
```

---

## Estadísticas Globales

### Obtener Estadísticas

`GET /admin/stats`

Obtiene estadísticas globales de todas las organizaciones.

**Response (200 OK):**

```json
{
  "total_organizations": 25,
  "total_users": 150,
  "total_rooms": 75,
  "total_bookings": 1500,
  "active_organizations": 23,
  "bookings_today": 45,
  "revenue_today": 1125.0
}
```

---

## Gestión de Organizaciones

### Listar Organizaciones

`GET /admin/organizations`

**Query Parameters:**

- `skip`, `limit`: Paginación
- `is_active`: Filtrar por estado

**Response (200 OK):**

```json
[
  {
    "id": "org-uuid",
    "name": "Escape Room XYZ",
    "slug": "escape-room-xyz",
    "is_active": true,
    "users_count": 5,
    "rooms_count": 3,
    "created_at": "2025-01-15T10:00:00Z"
  }
]
```

---

### Obtener Usuarios de Organización

`GET /admin/organizations/{org_id}/users`

**Response (200 OK):**

```json
[
  {
    "id": "user-uuid",
    "email": "user@example.com",
    "full_name": "Juan García",
    "role": "Admin",
    "is_active": true
  }
]
```

---

### Crear Organización (Admin)

`POST /admin/organizations`

Crea una organización con usuario propietario.

**Request Body:**

```json
{
  "name": "Nueva Organización",
  "slug": "nueva-organizacion",
  "owner_email": "owner@example.com",
  "owner_name": "Propietario",
  "owner_password": "Password123!"
}
```

**Response (201 Created):**

```json
{
  "organization": {
    "id": "org-uuid",
    "name": "Nueva Organización",
    "slug": "nueva-organizacion"
  },
  "owner": {
    "id": "user-uuid",
    "email": "owner@example.com"
  }
}
```

---

### Crear Usuario en Organización

`POST /admin/organizations/{org_id}/users`

**Request Body:**

```json
{
  "email": "nuevo@example.com",
  "full_name": "Nuevo Usuario",
  "password": "TempPassword123!",
  "role_id": "role-uuid"
}
```

**Response (201 Created):** Objeto usuario creado.

---

## Gestión de Permisos

### Listar Todos los Permisos

`GET /admin/permissions`

Lista todos los permisos del sistema (33 total).

**Response (200 OK):**

```json
[
  {
    "id": "perm-uuid",
    "name": "view_bookings",
    "description": "Ver reservas",
    "category": "bookings"
  },
  {
    "id": "perm-uuid-2",
    "name": "create_bookings",
    "description": "Crear reservas",
    "category": "bookings"
  }
]
```

---

### Obtener Roles de Organización

`GET /admin/organizations/{org_id}/roles`

**Response (200 OK):**

```json
[
  {
    "id": "role-uuid",
    "name": "Administrador",
    "is_custom": false,
    "permissions_count": 33
  },
  {
    "id": "role-uuid-2",
    "name": "Recepcionista",
    "is_custom": true,
    "permissions_count": 8
  }
]
```

---

### Obtener Permisos de Rol

`GET /admin/roles/{role_id}/permissions`

**Response (200 OK):**

```json
{
  "role": {
    "id": "role-uuid",
    "name": "Recepcionista"
  },
  "permissions": [
    { "id": "perm-1", "name": "view_bookings" },
    { "id": "perm-2", "name": "create_bookings" }
  ]
}
```

---

### Asignar Permiso a Rol

`POST /admin/roles/{role_id}/permissions`

**Request Body:**

```json
{
  "permission_id": "perm-uuid"
}
```

**Response (201 Created):**

```json
{
  "message": "Permiso asignado correctamente",
  "role_id": "role-uuid",
  "permission_id": "perm-uuid"
}
```

---

### Quitar Permiso de Rol

`DELETE /admin/roles/{role_id}/permissions/{permission_id}`

**Response (200 OK):**

```json
{
  "message": "Permiso eliminado correctamente"
}
```

---

## 🔐 Seguridad

Todos los endpoints de admin requieren:

1. Token JWT válido
2. Usuario con flag `is_admin: true`
3. O permisos específicos de administración

```http
Authorization: Bearer <admin_token>
```

---

## 📋 Categorías de Permisos

| Categoría    | Permisos                                            |
| ------------ | --------------------------------------------------- |
| **bookings** | view, create, update, delete, cancel, manage_status |
| **users**    | view, create, update, delete, manage_roles          |
| **rooms**    | view, create, update, delete, manage_schedules      |
| **coupons**  | view, create, update, delete, validate              |
| **payments** | view, process, refund                               |
| **stats**    | view, export                                        |
| **settings** | view, update, manage_integrations                   |
| **roles**    | view, create, update, delete                        |

---

**Última actualización:** 4 de diciembre de 2025
