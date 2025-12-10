# 📡 API Overview - EscapeBook API

Bienvenido a la documentación de la API de EscapeBook. Esta API permite gestionar organizaciones de escape rooms, salas, reservas, pagos y más.

## 🔗 Base URL

- **Desarrollo:** `http://localhost:8000`
- **Producción:** `https://tu-dominio.com`

## 🔐 Autenticación

La mayoría de los endpoints requieren autenticación mediante JSON Web Tokens (JWT).

1. **Registrar** un nuevo usuario vía `/auth/register`
2. **Login** vía `/auth/login` para obtener un `access_token`
3. Incluir el token en el header `Authorization` de tus peticiones:

```http
Authorization: Bearer <your_access_token>
```

## 📚 Secciones de Documentación

| Sección                                       | Descripción                        | Endpoints |
| --------------------------------------------- | ---------------------------------- | --------- |
| [Authentication](AUTHENTICATION.md)           | Registro, Login, Perfil de Usuario | 6         |
| [Organizations & TPVs](ORGANIZATIONS.md)      | Gestión de Organizaciones y TPVs   | 10        |
| [Users & Roles](USERS_AND_ROLES.md)           | Gestión de Empleados y Permisos    | 13        |
| [Rooms & Bookings](ROOMS_AND_BOOKINGS.md)     | Salas, Horarios y Reservas         | 18        |
| [Payments & Coupons](PAYMENTS_AND_COUPONS.md) | Pagos y Cupones de Descuento       | 10        |
| [Dashboard](DASHBOARD.md)                     | Analytics y Estadísticas           | 3         |

**Total: 70+ endpoints**

## 📊 Resumen de Endpoints

```
/auth           → 6 endpoints  (autenticación)
/organizations  → 5 endpoints  (organizaciones)
/users          → 6 endpoints  (empleados)
/rooms          → 7 endpoints  (salas)
/bookings       → 11 endpoints (reservas)
/payments       → 4 endpoints  (pagos)
/coupons        → 6 endpoints  (cupones)
/roles          → 7 endpoints  (roles)
/dashboard      → 3 endpoints  (estadísticas)
/tpvs           → 5 endpoints  (terminales)
/admin          → 10 endpoints (administración)
```

## ⚠️ Manejo de Errores

La API utiliza códigos de estado HTTP estándar:

| Código | Estado                | Descripción                       |
| ------ | --------------------- | --------------------------------- |
| `200`  | OK                    | Petición exitosa                  |
| `201`  | Created               | Recurso creado correctamente      |
| `204`  | No Content            | Petición exitosa, sin contenido   |
| `400`  | Bad Request           | Datos de petición inválidos       |
| `401`  | Unauthorized          | Autenticación requerida o fallida |
| `403`  | Forbidden             | Permisos insuficientes            |
| `404`  | Not Found             | Recurso no encontrado             |
| `422`  | Unprocessable Entity  | Error de validación               |
| `500`  | Internal Server Error | Error del servidor                |

### Formato de Error

```json
{
  "detail": "Mensaje descriptivo del error",
  "error_code": "ERROR_CODE"
}
```

## 🏗️ Arquitectura Multi-Tenant

Todos los datos están aislados por `organization_id`. Cada request automáticamente filtra datos de la organización del usuario autenticado.

```
Organization A          Organization B
├── users              ├── users
├── rooms              ├── rooms
├── bookings           ├── bookings
├── payments           ├── payments
└── coupons            └── coupons
```

## 🔄 Paginación

Los endpoints de listado soportan paginación:

```
GET /bookings?skip=0&limit=20
```

**Parámetros:**

- `skip`: Número de registros a saltar (default: 0)
- `limit`: Número máximo de registros a devolver (default: 20, max: 100)

**Respuesta:**

```json
{
  "items": [...],
  "total": 150,
  "skip": 0,
  "limit": 20
}
```

---

**Última actualización:** 4 de diciembre de 2025
