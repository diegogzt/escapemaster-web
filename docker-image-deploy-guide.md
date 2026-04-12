# Guía: Cambiar de Git-based a Docker Image en Dokploy

Esta guía explica cómo configurar Dokploy para usar **Docker Image** en lugar de Git-based deployment, usando tus propias credenciales de GHCR.

## Contexto

El método Git-based tiene problemas de caché que causan que se ejecute código antiguo incluso después de hacer push. El método **Docker Image** permite hacer push manual de la imagen y actualizar el servicio directamente.

## Requisitos

- GHCR (GitHub Container Registry) ya configurado
- Tus credenciales de GitHub (PAT token con permisos `write:packages`)
- Acceso a Dokploy como administrador

---

## Paso 1: Login a GHCR

En tu máquina local, login a GitHub Container Registry:

```bash
echo "YOUR_GITHUB_PAT_TOKEN" | docker login ghcr.io -u dgtovar --password-stdin
```

> **Nota**: El username es `dgtovar` (tu usuario GitHub). El password es el PAT token generado desde GitHub → Settings → Developer settings → Personal access tokens.

---

## Paso 2: Build y Push de la Imagen

### Para v1 (producción)

```bash
# Tag con timestamp único para evitar caché
TAG=v1.$(date +%Y%m%d%H%M%S)

# Build
docker build -f Dockerfile.v1 \
  -t ghcr.io/dgtovar/my-manager-api-rroybx:$TAG \
  .

# Push
docker push ghcr.io/dgtovar/my-manager-api-rroybx:$TAG
```

### Para v2 (pre-producción)

```bash
TAG=v2.$(date +%Y%m%d%H%M%S)

docker build -f Dockerfile.v2 \
  -t ghcr.io/dgtovar/my-manager-api-rroybx:$TAG \
  .

docker push ghcr.io/dgtovar/my-manager-api-rroybx:$TAG
```

---

## Paso 3: Configurar Dokploy - Docker Image

### Opción A: Nuevo Proyecto

1. En Dokploy, crear nuevo proyecto
2. Seleccionar **Docker Image** como método de deploy
3. Configurar:
   - **Image**: `ghcr.io/dgtovar/my-manager-api-rroybx:v1.TIMESTAMP`
   - **Registry**: `ghcr.io`
   - **Username**: `dgtovar`
   - **Password**: Tu PAT token
   - **Port**: `9001` (para v1) o `9002` (para v2)
   - **Network**: `dokploy-network` o la network de tu servicio

### Opción B: Cambiar Proyecto Existente

1. Ir al proyecto existente en Dokploy
2. Buscar **Deployment Type** o **Method**
3. Cambiar de **Git-based** a **Docker Image**
4. Guardar

### Opción C: Usar docker service update Directamente

Si prefieres no cambiar la configuración de Dokploy, puedes actualizar el servicio Swarm directamente:

```bash
# Actualizar imagen del servicio v1
docker service update \
  --image ghcr.io/dgtovar/my-manager-api-rroybx:v1.TIMESTAMP \
  my-manager-api-rroybx

# Verificar estado
docker service ps my-manager-api-rroybx
```

---

## Paso 4: Verificar el Deploy

```bash
# Ver estado del servicio
docker service ps my-manager-api-rroybx

# Ver logs
docker service logs my-manager-api-rroybx --tail 20

# Probar health endpoint
curl http://localhost:9001/api/v1/health

# Ver puertos escuchando
ss -tlnp | grep 9001
```

---

## Troubleshooting

### "Image not found" o "access denied"

1. Verificar que el login a GHCR fue exitoso:
   ```bash
   docker login ghcr.io
   ```

2. Verificar que la imagen existe:
   ```bash
   docker manifest inspect ghcr.io/dgtovar/my-manager-api-rroybx:v1.TIMESTAMP
   ```

### Dokploy sigue usando imagen antigua

1. **Usar tag único** - Cada deploy debe tener un tag diferente
2. **Limpiar caché de Dokploy**:
   ```bash
   # SSH al servidor de Dokploy
   docker images | grep my-manager-api
   docker rmi $(docker images | grep my-manager-api | awk '{print $3}')
   ```

3. **O usar docker service update** directamente (Paso 3, Opción C)

### El contenedor no inicia (PoolTimedOut)

Verificar DATABASE_URL:
```bash
docker service inspect my-manager-api-rroybx --format '{{json .Spec.TaskTemplate.ContainerSpec.Env}}' | grep DATABASE_URL
```

Si está mal, actualizar:
```bash
docker service update --env-add DATABASE_URL=postgresql://root:Ameri5202@manager-manager-vpfsmr:5432/postgres my-manager-api-rroybx
```

### Puerto no publicado

```bash
docker service update --publish-add 9001:9001 my-manager-api-rroybx
```

---

## Comandos Útiles

```bash
# Listar todos los servicios
docker service ls

# Ver estado de un servicio
docker service ps my-manager-api-rroybx

# Ver logs
docker service logs my-manager-api-rroybx --tail 50

# Actualizar imagen
docker service update --image ghcr.io/dgtovar/my-manager-api-rroybx:v1.NUEVO_TAG my-manager-api-rroybx

# Actualizar variable de entorno
docker service update --env-add NUEVA_VAR=valor SERVICE_NAME

# Ver configuración completa del servicio
docker service inspect my-manager-api-rroybx
```

---

## Notas Importantes

1. **Tags únicos siempre**: Nunca reutilices `v1`, `v2`, `latest`. Usa timestamps o git hash.

2. **Credenciales GHCR**: El PAT token necesita permiso `write:packages` para hacer push.

3. **Puerto correcto**: v1 usa 9001, v2 usa 9002.

4. **Network**: Los servicios deben estar en `dokploy-network` para comunicarse con la base de datos.

5. **DATABASE_URL**: Debe usar el nombre del servicio Swarm de PostgreSQL (`manager-manager-vpfsmr`), no IP externa.

---

## Frontend Deployment (escapemaster-web)

### Build y Push

```bash
# Producción (main → API v1)
./scripts/deploy-frontend.sh https://my.escapemaster.es/api/v1

# Desarrollo (dev → API v2)
./scripts/deploy-frontend.sh https://my.escapemaster.es/api/v2
```

El script `scripts/deploy-frontend.sh`:
1. Construye la imagen con `--build-arg` para `NEXT_PUBLIC_API_URL` y `NEXT_PUBLIC_APP_URL`
2. Etiqueta con timestamp: `ghcr.io/diegogzt/escapemaster-frontend:YYYYMMDDHHMMSS`
3. Hace push a GHCR
4. Actualiza el servicio `manager-frontend-erhb6r` en Swarm

### Verificar Deploy

```bash
# Ver estado del servicio
docker service ps manager-frontend-erhb6r

# Ver logs
docker service logs manager-frontend-erhb6r --tail 20

# Probar endpoint
curl -s -o /dev/null -w "%{http_code}" https://my.escapemaster.es/
# Debe devolver 307 (redirect a /dashboard) o 200

# Verificar URL de API en el frontend
curl -s https://my.escapemaster.es/ | grep -o "api.escapemaster.es\|my.escapemaster.es" | head -1
```

### Cambiar tipo de deployment en Dokploy (Opcional)

Si prefieres usar el tipo **Docker Image** en Dokploy en lugar de Git-based:

1. Ir al proyecto `manager-frontend-erhb6r` en Dokploy
2. Cambiar **Deployment Type** → **Docker Image**
3. Configurar:
   - **Image**: `ghcr.io/diegogzt/escapemaster-frontend:TAG` (usar el tag del último deploy)
   - **Registry**: `ghcr.io`
   - **Username**: `dgtovar` (tu usuario GitHub)
   - **Password**: GHCR PAT token
   - **Port**: `3000`
   - **Network**: `dokploy-network`
4. Guardar

Cada vez que hagas deploy, actualiza el tag en Dokploy UI o usa el script que actualiza directamente via `docker service update`.

### Solución de problemas

**El contenedor no levanta:**
```bash
docker service logs manager-frontend-erhb6r --tail 50
```

**Verificar que la imagen es la correcta:**
```bash
docker service inspect manager-frontend-erhb6r --format '{{.Spec.TaskTemplate.ContainerSpec.Image}}'
```

**Forzar re-deploy sin cambiar imagen:**
```bash
docker service update --force manager-frontend-erhb6r
```
