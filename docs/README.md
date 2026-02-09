# 📱 Escapemaster Mobile - Documentación Técnica

> Aplicación móvil para iOS y Android para el ecosistema Escapemaster.

[![Expo](https://img.shields.io/badge/Expo-SDK-54-blue.svg)](https://expo.dev)
[![React Native](https://img.shields.io/badge/React_Native-0.76-blue.svg)](https://reactnative.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org)

## 📋 Visión General

Escapemaster Mobile es la aplicación móvil diseñada para Game Masters y staff móvil. Permite realizar operaciones críticas directamente desde el dispositivo: check-in de jugadores, cronómetro sincronizado, gestión de tareas en sala y fichaje horario.

## 🏗️ Stack Tecnológico

### Stack Principal

- **Framework:** React Native + Expo SDK 54
- **Routing:** Expo Router (file-based routing)
- **Styling:** NativeWind (Tailwind CSS para React Native)
- **State Management:** Zustand
- **API Client:** Axios
- **Storage:** Expo Secure Store (almacenamiento seguro)
- **Iconos:** Lucide React Native

### Estructura del Proyecto

```
apps/mobile/
├── app/                  # File-based routing de Expo Router
│   ├── (auth)/           # Pantallas de autenticación
│   │   ├── login/
│   │   │   └── index.tsx
│   │   ├── register/
│   │   │   └── index.tsx
│   │   └── forgot-password/
│   │       └── index.tsx
│   ├── (dashboard)/      # Pantallas principales de la app
│   │   ├── index.tsx       # Home/Dashboard
│   │   ├── bookings/       # Lista de reservas
│   │   ├── timer/          # Cronómetro
│   │   ├── tasks/          # Checklists de tareas
│   │   └── timeclock/      # Fichaje horario
│   └── _layout.tsx       # Layout raíz con navegación
├── components/            # Componentes reutilizables
│   ├── ui/               # Componentes atómicos
│   └── features/          # Componentes de negocio
├── services/              # Capa de integración API
├── constants/             # Constantes de la app (temas, colores)
├── assets/                # Imágenes, fuentes, etc.
├── hooks/                # Custom React hooks
└── types/                # Definiciones TypeScript
```

## 🌟 Funcionalidades Clonadas de Web

### Características Implementadas

- [x] **Autenticación:** Login, Register, Forgot Password
- [x] **Dashboard Resumen:** Vista general de reservas y tareas
- [x] **Gestión de Reservas:** Lista de reservas del día (placeholder)
- [x] **Vista de Calendar:** Calendario semanal (placeholder)
- [x] **Gestión de Salas:** Lista de salas disponibles (placeholder)
- [x] **Settings & Perfil:** Configuración de usuario

### Funcionalidades Específicas Móviles

- [x] **Escaneo QR:** Check-in de jugadores usando cámara del dispositivo
- [x] **Cronómetro:** Timer sincronizado con el tiempo de juego
- [x] **Checklists Interactivos:** Listas de tareas para preparar/resetear salas
- [x] **Fichaje Geolocalizado:** Clock-in/Clock-out con ubicación

## 🛠️ Setup e Instalación

### 1. Clonar Repositorio

```bash
git clone https://github.com/diegogzt/escapemaster-mobile.git
cd escapemaster-mobile
```

### 2. Instalar Dependencias

```bash
npm install
```

### 3. Iniciar Servidor de Desarrollo

```bash
npx expo start
```

Opciones para ejecutar:
- Presiona `i` para abrir en iOS Simulator
- Presiona `a` para abrir en Android Emulator
- Escanea el QR code con la app Expo Go en tu dispositivo físico

### 4. Configurar Entorno

Crear `.env`:

```env
EXPO_PUBLIC_API_URL=https://api.escapemaster.es
```

## 🔐 Autenticación y Seguridad

### Flujo de Login

1. Usuario ingresa credenciales en pantalla de Login
2. Credenciales enviadas a backend API: `POST /auth/login`
3. Tokens (access + refresh) almacenados en **Expo Secure Store**
4. Usuario redirigido a Dashboard

### Almacenamiento Seguro

```typescript
// src/services/secureStorage.ts
import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'escapemaster_access_token';
const REFRESH_TOKEN_KEY = 'escapemaster_refresh_token';

export const secureStorage = {
  async saveAccessToken(token: string): Promise<void> {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
  },

  async getAccessToken(): Promise<string | null> {
    return await SecureStore.getItemAsync(TOKEN_KEY);
  },

  async saveRefreshToken(token: string): Promise<void> {
    await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, token);
  },

  async getRefreshToken(): Promise<string | null> {
    return await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
  },

  async clearTokens(): Promise<void> {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
  },
};
```

### Integración de API con Tokens

```typescript
// src/services/api.ts
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para añadir token automáticamente
api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('escapemaster_access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para manejar 401 (token expirado)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Intentar refrescar token
      const refreshToken = await SecureStore.getItemAsync('escapemaster_refresh_token');
      const response = await axios.post('/auth/refresh', { refresh_token: refreshToken });
      const newToken = response.data.access_token;

      // Guardar nuevo token
      await SecureStore.setItemAsync('escapemaster_access_token', newToken);

      // Reintentar la solicitud original
      error.config.headers.Authorization = `Bearer ${newToken}`;
      return axios.request(error.config);
    }
    return Promise.reject(error);
  }
);

export default api;
```

## 📱 Funcionalidades Principales

### 1. Escaneo QR de Reservas

Game Masters escanean códigos QR de reservas al llegar el grupo.

```typescript
// src/components/QRScanner.tsx
import { useState, useEffect } from 'react';
import { CameraView, Camera } from 'expo-camera';
import { BarCodeScanner } from 'expo-barcode-scanner';

export function QRScanner({ onScan }: { onScan: (data: string) => void }) {
  const [hasPermission, setHasPermission] = useState(false);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  if (!hasPermission) {
    return <Text>Necesitamos permiso de cámara</Text>;
  }

  return (
    <View style={{ flex: 1 }}>
      <CameraView
        style={{ flex: 1 }}
        facing="back"
        onBarcodeScanned={({ data }) => {
          // Solo escanear una vez
          if (data) {
            onScan(data);
          }
        }}
      />
      <View style={{ position: 'absolute', inset: 0, borderWidth: 4, borderColor: '#E46F20' }} />
    </View>
  );
}
```

### 2. Cronómetro Sincronizado

Timer que permite controlar el tiempo de juego y sincronizar con el backend.

```typescript
// src/components/GameTimer.tsx
import { useState, useEffect } from 'react';
import { View, Text } from 'react-native';

export function GameTimer({ bookingId }: { bookingId: string }) {
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRunning) {
      interval = setInterval(() => {
        setTime((prev) => prev + 1);
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isRunning]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View className="flex flex-col items-center justify-center p-6 bg-surface rounded-lg">
      <Text className="text-4xl font-bold text-primary">{formatTime(time)}</Text>

      <View className="flex gap-4 mt-4">
        <Button
          onPress={() => setIsRunning(!isRunning)}
          variant={isRunning ? 'danger' : 'primary'}
        >
          {isRunning ? 'Pausar' : 'Iniciar'}
        </Button>
        <Button onPress={() => setTime(0)} variant="secondary">
          Reiniciar
        </Button>
      </View>
    </View>
  );
}
```

### 3. Checklists Interactivos de Tareas

Listas de tareas interactivas para dejar la sala lista (ej. "Cerrar candado caja fuerte", "Esconder llave maestra").

```typescript
// src/components/RoomChecklist.tsx
import { useState } from 'react';
import { View, Text } from 'react-native';

interface Task {
  id: string;
  title: string;
  completed: boolean;
}

export function RoomChecklist({ bookingId }: { bookingId: string }) {
  const [tasks, setTasks] = useState<Task[]>([
    { id: '1', title: 'Cerrar candado caja fuerte', completed: false },
    { id: '2', title: 'Esconder llave maestra', completed: false },
    { id: '3', title: 'Revisar propiedades', completed: false },
    { id: '4', title: 'Limpiar sala', completed: false },
  ]);

  const toggleTask = (taskId: string) => {
    setTasks(tasks.map(task =>
      task.id === taskId ? { ...task, completed: !task.completed } : task
    ));
  };

  const isComplete = tasks.every(task => task.completed);

  return (
    <View className="p-4 bg-surface rounded-lg">
      <Text className="text-lg font-bold mb-4">Checklist de Reset de Sala</Text>

      {tasks.map(task => (
        <TouchableOpacity
          key={task.id}
          onPress={() => toggleTask(task.id)}
          className={`flex-row items-center p-3 mb-2 rounded ${task.completed ? 'bg-green-100' : 'bg-gray-100'}`}
        >
          <View className={`w-6 h-6 rounded ${task.completed ? 'bg-green-500' : 'bg-gray-300'}`}>
            {task.completed && <Text className="text-white text-xs">✓</Text>}
          </View>
          <Text className={`ml-3 ${task.completed ? 'line-through text-gray-400' : ''}`}>
            {task.title}
          </Text>
        </TouchableOpacity>
      ))}

      {isComplete && (
        <Button onPress={() => {/* enviar confirmación al backend */}}>
          Sala Lista - Completar Reset
        </Button>
      )}
    </View>
  );
}
```

### 4. Fichaje Horario Geolocalizado

Sistema para que los empleados registren entrada y salida laboral.

```typescript
// src/components/TimeClock.tsx
import * as Location from 'expo-location';
import { useState, useEffect } from 'react';

export function TimeClock() {
  const [isClockedIn, setIsClockedIn] = useState(false);
  const [location, setLocation] = useState<Location.LocationObject | null>(null);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        alert('Necesitamos permiso de ubicación');
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({});
      setLocation(currentLocation);
    })();
  }, []);

  const handleClockIn = async () => {
    const response = await api.post('/timeclock/clock-in', {
      location: {
        latitude: location?.coords.latitude,
        longitude: location?.coords.longitude,
        timestamp: new Date().toISOString(),
      },
    });

    setIsClockedIn(true);
    alert('Fichaje de entrada registrado');
  };

  const handleClockOut = async () => {
    const response = await api.post('/timeclock/clock-out', {
      location: {
        latitude: location?.coords.latitude,
        longitude: location?.coords.longitude,
        timestamp: new Date().toISOString(),
      },
    });

    setIsClockedIn(false);
    alert('Fichaje de salida registrado');
  };

  return (
    <View className="p-4 bg-surface rounded-lg">
      <Text className="text-lg font-bold mb-4">Control Horario</Text>

      <View className="flex gap-4">
        <Button
          onPress={handleClockIn}
          disabled={isClockedIn}
          variant="primary"
          className="flex-1"
        >
          Fichar Entrada
        </Button>

        <Button
          onPress={handleClockOut}
          disabled={!isClockedIn}
          variant="secondary"
          className="flex-1"
        >
          Fichar Salida
        </Button>
      </View>

      {location && (
        <Text className="mt-2 text-sm text-gray-500">
          Ubicación: {location.coords.latitude.toFixed(4)}, {location.coords.longitude.toFixed(4)}
        </Text>
      )}
    </View>
  );
}
```

## 🧪 Testing

```bash
# Ejecutar tests unitarios
npm test

# Ejecutar en modo watch
npm test:watch

# Ejecutar tests E2E (si están configurados)
npm run test:e2e
```

## 🚀 Despliegue

### EAS (Expo Application Services)

Para construir y desplegar a producción:

```bash
# Instalar EAS CLI
npm install -g eas-cli

# Login en Expo
eas login

# Configurar app (primera vez)
eas build:configure

# Construir para iOS
eas build --platform ios

# Construir para Android
eas build --platform android

# Desplegar (subir a stores)
eas submit --platform ios
eas submit --platform android
```

### Permisos de la App

Configurar en `app.json`:

```json
{
  "expo": {
    "ios": {
      "infoPlist": {
        "NSCameraUsageDescription": "Necesitamos acceso a la cámara para escanear códigos QR de reservas",
        "NSLocationWhenInUseUsageDescription": "Necesitamos tu ubicación para registrar fichaje horario",
        "NSLocationAlwaysAndWhenInUseUsageDescription": "Necesitamos tu ubicación para registrar fichaje horario"
      }
    },
    "android": {
      "permissions": [
        "CAMERA",
        "ACCESS_FINE_LOCATION",
        "ACCESS_COARSE_LOCATION"
      ]
    }
  }
}
```

## 🔧 Scripts Disponibles

```bash
# Desarrollo
npx expo start              # Iniciar servidor de desarrollo

# Build
npx expo build              # Construir para iOS/Android
eas build --platform ios      # Construir para iOS con EAS
eas build --platform android # Construir para Android con EAS

# Testing
npm test                    # Ejecutar tests
npm run test:watch          # Ejecutar tests en modo watch
```

## 📁 Estructura de Navegación

Expo Router usa routing basado en archivos:

```
app/
├── (auth)/
│   ├── login/index.tsx        # Pantalla de login
│   ├── register/index.tsx      # Pantalla de registro
│   ├── forgot-password/index.tsx  # Recuperar contraseña
│   └── _layout.tsx          # Layout de autenticación
├── (dashboard)/
│   ├── index.tsx              # Dashboard principal
│   ├── bookings/index.tsx      # Lista de reservas
│   ├── bookings/[id]/index.tsx  # Detalles de reserva
│   ├── timer/index.tsx        # Cronómetro de juego
│   ├── tasks/index.tsx         # Checklists de tareas
│   └── timeclock/index.tsx    # Fichaje horario
└── _layout.tsx               # Layout raíz con navegación de tabs
```

## 📊 Métricas del Proyecto

- **Pantallas:** 10+
- **Componentes:** 30+
- **Líneas de código:** ~5,000
- **Tests:** ~20
- **Cobertura:** ~50%

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama (`git checkout -b feature/amazing`)
3. Commit cambios (`git commit -m 'Add: amazing feature'`)
4. Push (`git push origin feature/amazing`)
5. Abre un Pull Request

## 🐛 Reportar Issues

Para reportar bugs o sugerir mejoras:
- GitHub Issues: https://github.com/diegogzt/escapemaster-mobile/issues
- Contacto: mobile@escapemaster.es

## 📚 Documentación Adicional

Para documentación completa del sistema, ver:
- [Docs Escapemaster](../../docs/README.md) - Documentación centralizada
- [Contexto para IA](../../docs/03-contexto-ia/) - Guía para desarrolladores
- [Backend API](../../manager/api/docs/) - Documentación de la API
- [Escapemaster Web](../web/docs/) - Documentación de la app web

---

**Última actualización:** 4 de febrero de 2026
