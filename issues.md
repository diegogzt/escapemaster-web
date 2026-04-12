# Issues Encountered During Deployment

This document tracks all problems encountered during the escapemaster-web deployment setup and their solutions.

## 1. Git-based Deployment Cache Problem

**Problem**: Dokploy Git-based deployment was using cached old code even after pushing new commits. The container would run stale code despite fresh builds.

**Solution**: Switched to Docker Image deployment approach where images are built locally and pushed to GHCR, bypassing Dokploy's build cache entirely.

**Files involved**: `scripts/deploy-frontend.sh`, `Dockerfile.production`

---

## 2. Docker Build ARG Not Passed

**Problem**: During Docker build, `NEXT_PUBLIC_API_URL` was being set to the default fallback value (`https://api.escapemaster.es`) instead of the build-time argument.

**Root cause**: The `ARG` in Dockerfile wasn't properly passed during the build command, and the `ENV` default values weren't being set correctly.

**Solution**: Added default values in Dockerfile:
```dockerfile
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_APP_URL
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL:-https://my.escapemaster.es/api/v1}
ENV NEXT_PUBLIC_APP_URL=${NEXT_PUBLIC_APP_URL:-https://my.escapemaster.es}
```

Also ensured `--build-arg` flags were passed in the build command.

---

## 3. 502 Bad Gateway

**Problem**: After deploying, the frontend returned 502 Bad Gateway.

**Root cause**: Container networking issue. The container wasn't connected to the correct Docker network (`dokploy-network`) and port mapping was wrong (was 3001:3000 instead of correct internal mapping).

**Solution**: Connected container to `dokploy-network` and ensured correct port exposure. The internal port is 3000, exposed via Traefik routing.

---

## 4. Container Exited with Code 137 (OOM)

**Problem**: Container kept exiting with code 137 (Out of Memory kill).

**Root cause**: An old manual container was conflicting with Dokploy-managed container, causing resource contention.

**Solution**: Removed old manual containers with `docker rm` and `docker stop`.

---

## 5. GitHub Secret Scanning Blocking Push

**Problem**: When the deploy script contained the GHCR PAT hardcoded, GitHub's secret scanning blocked the push.

**Solution**:
- PAT is now passed via `GHCR_PAT` environment variable
- Script requires the variable to be set before running
- Login happens via `docker login ghcr.io -u dgtovar --password-stdin` using the env var

---

## 6. Image Path - diegogzt vs dgtovar

**Problem**: Initial script used `ghcr.io/diegogzt/escapemaster-frontend` but backend uses `ghcr.io/dgtovar/escapemaster-api`.

**Solution**: Updated script to use `ghcr.io/dgtovar/escapemaster-frontend` to match the user's GHCR namespace.

---

## 7. Timestamp Tags - Hard to Track

**Problem**: Using timestamp-based tags (`YYYYMMDDHHMMSS`) made it difficult to know which image corresponds to which deployment.

**Solution**: Implemented semantic versioning system:
- Version stored in `VERSION` file (gitignored)
- Each deploy increments minor version (0.1 → 0.2 → 0.3...)
- Tags are `v0.1`, `v0.2`, `v0.3`...

---

## 8. Register Endpoint - 400 DB Error

**Problem**: Register endpoint returned 400 with `organizations_owner_id_fkey` foreign key violation.

**Root cause**: Backend database issue where user creation fails due to missing/invalid organization reference.

**Status**: Backend bug, not a frontend issue. Requires backend fix.

---

## 9. Missing Register URL

**Problem**: Register URL needed to be `register.escapemaster.es`.

**Solution**: Traefik routing configuration needed to point `register.escapemaster.es` to the frontend service. (Configuration pending in Traefik/dokploy)

---

## 10. Test User Cleanup

**Problem**: Test user `test@test.com` was created during testing and remains in database.

**Solution**: Needs manual deletion or admin credentials to clean up.

---

## Summary

| Issue | Status |
|-------|--------|
| Git-based cache | Fixed - using Docker Image approach |
| ARG not passed | Fixed - added defaults in Dockerfile |
| 502 Bad Gateway | Fixed - networking configuration |
| OOM kill | Fixed - removed conflicting containers |
| Secret scanning | Fixed - PAT via env variable |
| Image path | Fixed - using dgtovar namespace |
| Timestamp tags | Fixed - semantic versioning |
| Register 400 | Pending backend fix |
| Register URL | Pending Traefik config |
| Test user cleanup | Pending manual cleanup |
