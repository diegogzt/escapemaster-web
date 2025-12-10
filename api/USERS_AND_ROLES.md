# 👥 Users & Roles API

Endpoints para gestionar usuarios (empleados) y el sistema de roles y permisos (RBAC).

## Users (Empleados)

### Listar Usuarios

`GET /users`

Lista los empleados/miembros de la organización.

**Query Parameters:**

- `skip`: Registros a saltar (default: 0)
- `limit`: Límite de registros (default: 20)
- `role_id`: Filtrar por rol
- `search`: Buscar por nombre o email
- `is_active`: Filtrar por estado activo

**Response (200 OK):**

```json
{
  "items": [
    {
      "id": "user-uuid",
      "email": "empleado@example.com",
      "full_name": "Juan García",
      "role": {
        "id": "role-uuid",
        "name": "Recepcionista"
      },
      "is_active": true,
      "created_at": "2025-12-04T12:00:00Z"
    }
  ],
  "total": 10
}
```

---

### Crear Usuario

`POST /users`

Crea un nuevo empleado en la organización.

**Request Body:**

```json
{
  "email": "nuevo@example.com",
  "full_name": "Nuevo Empleado",
  "role_id": "role-uuid",
  "password": "ContraseñaTemporal123!"
}
```

**Response (201 Created):**

```json
{
  "id": "user-uuid",
  "email": "nuevo@example.com",
  "full_name": "Nuevo Empleado",
  "role_id": "role-uuid",
  "organization_id": "org-uuid",
  "is_active": true,
  "created_at": "2025-12-04T12:00:00Z"
}
```

---

### Obtener Usuario

`GET /users/{user_id}`

**Response (200 OK):** Objeto usuario completo.

---

### Actualizar Usuario

`PUT /users/{user_id}`

**Request Body:**

```json
{
  "full_name": "Nombre Actualizado",
  "role_id": "nuevo-role-uuid",
  "is_active": true
}
```

**Response (200 OK):** Objeto usuario actualizado.

---

### Cambiar Contraseña

`PUT /users/{user_id}/password`

**Request Body:**

```json
{
  "current_password": "ContraseñaAnterior123!",
  "new_password": "NuevaContraseña123!"
}
```

**Response (200 OK):**

```json
{
  "message": "Contraseña actualizada correctamente"
}
```

---

### Eliminar Usuario (Desactivar)

`DELETE /users/{user_id}`

Desactiva el usuario (soft delete).

**Response (204 No Content)**

---

## 🛡️ Roles

### Listar Roles

`GET /roles`

Lista los roles disponibles en la organización.

**Response (200 OK):**

```json
{
  "items": [
    {
      "id": "role-uuid",
      "name": "Administrador",
      "description": "Acceso total al sistema",
      "is_custom": false,
      "permissions": ["manage_users", "manage_rooms", "manage_bookings"]
    },
    {
      "id": "role-uuid-2",
      "name": "Recepcionista",
      "description": "Gestión de reservas y clientes",
      "is_custom": true,
      "permissions": ["view_bookings", "create_bookings", "update_bookings"]
    }
  ],
  "total": 5
}
```

---

### Crear Rol

`POST /roles`

Crea un rol personalizado.

**Request Body:**

```json
{
  "name": "Game Master",
  "description": "Operador de sala",
  "permission_ids": ["perm-uuid-1", "perm-uuid-2", "perm-uuid-3"]
}
```

**Response (201 Created):**

```json
{
  "id": "role-uuid",
  "name": "Game Master",
  "description": "Operador de sala",
  "is_custom": true,
  "permissions": [
    { "id": "perm-uuid-1", "name": "view_bookings" },
    { "id": "perm-uuid-2", "name": "update_bookings" },
    { "id": "perm-uuid-3", "name": "view_rooms" }
  ]
}
```

---

### Listar Permisos

`GET /roles/permissions`

Lista todos los permisos disponibles en el sistema.

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
    "name": "manage_users",
    "description": "Gestionar usuarios",
    "category": "users"
  }
]
```

---

### Obtener Rol

`GET /roles/{role_id}`

**Response (200 OK):** Objeto rol completo con permisos.

---

### Actualizar Rol

`PUT /roles/{role_id}`

Solo se pueden actualizar roles personalizados (`is_custom: true`).

**Request Body:**

```json
{
  "name": "Game Master Senior",
  "description": "Operador de sala con más permisos",
  "permission_ids": ["perm-1", "perm-2", "perm-3", "perm-4"]
}
```

**Response (200 OK):** Objeto rol actualizado.

---

### Eliminar Rol

`DELETE /roles/{role_id}`

Solo se pueden eliminar roles personalizados que no tengan usuarios asignados.

**Response (204 No Content)**

---

### Asignar Rol a Usuario

`POST /roles/assign`

**Request Body:**

```json
{
  "user_id": "user-uuid",
  "role_id": "role-uuid"
}
```

**Response (200 OK):**

```json
{
  "message": "Rol asignado correctamente",
  "user_id": "user-uuid",
  "role_id": "role-uuid"
}
```

---

## 📋 Sistema de Permisos

### Categorías de Permisos (33 total)

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

### Roles por Defecto

| Rol              | Descripción                       | Editable |
| ---------------- | --------------------------------- | -------- |
| **Owner**        | Propietario con acceso total      | No       |
| **Admin**        | Administrador del sistema         | No       |
| **Manager**      | Gestión de operaciones            | No       |
| **Employee**     | Empleado básico                   | No       |
| _Personalizados_ | Roles creados por la organización | Sí       |

---

## 🔐 Permisos Requeridos

| Endpoint           | Permiso              |
| ------------------ | -------------------- |
| Listar usuarios    | `users:view`         |
| Crear usuario      | `users:create`       |
| Actualizar usuario | `users:update`       |
| Eliminar usuario   | `users:delete`       |
| Gestionar roles    | `users:manage_roles` |
| CRUD de roles      | `roles:*`            |

---

**Última actualización:** 4 de diciembre de 2025
