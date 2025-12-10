# 🔐 Authentication API

Endpoints para autenticación y gestión de sesión de usuario.

## Endpoints

### Registrar Usuario

`POST /auth/register`

Registra una nueva cuenta de usuario.

**Request Body:**

```json
{
  "email": "usuario@ejemplo.com",
  "password": "ContraseñaSegura123!",
  "full_name": "Juan García"
}
```

**Response (201 Created):**

```json
{
  "id": "uuid",
  "email": "usuario@ejemplo.com",
  "full_name": "Juan García",
  "is_active": true,
  "organization_id": null,
  "role_id": null,
  "created_at": "2025-12-04T12:00:00Z"
}
```

---

### Login

`POST /auth/login`

Autentica y devuelve tokens de acceso y refresh.

**Request Body:**

```json
{
  "email": "usuario@ejemplo.com",
  "password": "ContraseñaSegura123!"
}
```

**Response (200 OK):**

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6...",
  "token_type": "bearer"
}
```

**Errores comunes:**

- `401 Unauthorized`: Credenciales inválidas
- `400 Bad Request`: Usuario no encontrado o inactivo

---

### Refrescar Token

`POST /auth/refresh`

Obtiene un nuevo access token usando el refresh token.

**Request Body:**

```json
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6..."
}
```

**Response (200 OK):**

```json
{
  "access_token": "nuevo_access_token",
  "refresh_token": "nuevo_refresh_token",
  "token_type": "bearer"
}
```

---

### Obtener Usuario Actual

`GET /auth/me`

Obtiene la información del perfil del usuario autenticado.

**Headers:**

```http
Authorization: Bearer <token>
```

**Response (200 OK):**

```json
{
  "id": "uuid",
  "email": "usuario@ejemplo.com",
  "full_name": "Juan García",
  "organization_id": "org-uuid",
  "organization": {
    "id": "org-uuid",
    "name": "Mi Escape Room"
  },
  "role": {
    "id": "role-uuid",
    "name": "Admin",
    "permissions": ["manage_users", "manage_rooms", "manage_bookings"]
  },
  "is_active": true,
  "created_at": "2025-12-04T12:00:00Z"
}
```

---

### Cerrar Sesión

`POST /auth/logout`

Invalida la sesión actual del usuario.

**Headers:**

```http
Authorization: Bearer <token>
```

**Response (200 OK):**

```json
{
  "message": "Sesión cerrada correctamente"
}
```

---

### Solicitar Recuperación de Contraseña

`POST /auth/forgot-password`

Envía un correo electrónico con un código de verificación de 6 dígitos para restablecer la contraseña.

**Request Body:**

```json
{
  "email": "usuario@ejemplo.com"
}
```

**Response (200 OK):**

```json
{
  "message": "If the email exists, a verification code has been sent."
}
```

---

### Restablecer Contraseña

`POST /auth/reset-password`

Establece una nueva contraseña utilizando el código de verificación recibido por correo.

**Request Body:**

```json
{
  "email": "usuario@ejemplo.com",
  "code": "123456",
  "new_password": "NuevaContraseñaSegura123!"
}
```

**Response (200 OK):**

```json
{
  "message": "Password reset successfully"
}
```

---

## 🔑 Uso de Tokens

### Access Token

- **Duración:** 30 minutos (configurable)
- **Uso:** Incluir en header `Authorization: Bearer <token>`
- **Almacenamiento:** En memoria o localStorage (frontend)

### Refresh Token

- **Duración:** 30 días (configurable)
- **Uso:** Solo para obtener nuevos access tokens via `/auth/refresh`
- **Almacenamiento:** HttpOnly cookie o almacenamiento seguro

### Ejemplo de Flujo

```python
import requests

# 1. Login
response = requests.post("http://localhost:8000/auth/login", json={
    "email": "user@example.com",
    "password": "password123"
})
tokens = response.json()

# 2. Usar access token
headers = {"Authorization": f"Bearer {tokens['access_token']}"}
me = requests.get("http://localhost:8000/auth/me", headers=headers)

# 3. Refrescar token cuando expire
new_tokens = requests.post("http://localhost:8000/auth/refresh", json={
    "refresh_token": tokens['refresh_token']
})
```

---

**Última actualización:** 8 de diciembre de 2025
