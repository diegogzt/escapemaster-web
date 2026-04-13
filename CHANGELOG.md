# Changelog - EscapeMaster Manager

## [0.3.0] - 2026-04-13

### Added
- **ERD Onboarding Integration**: New users now see ERD migration step during onboarding wizard. After creating organization, user is prompted to migrate data from Escape Room Director.
- **ERD Onboarding Wizard Component**: `src/components/onboarding/ERDOnboardingWizard.tsx` with 4-step flow (credentials → selection → confirmation → progress).
- **ERD Onboarding Service**: `src/services/erdOnboarding.ts` with authenticate, preview, execute methods plus dependency resolution.
- **529 Error Retry Logic**: API service now retries on overloaded error (529) with exponential backoff.

### Changed
- **Improved Organization Creation Flow**: Removed artificial 500ms delay after `orgs.create()`. Now properly awaits `auth.me()` response.
- **Semantic Version Tags**: Docker images now use `v0.X` format instead of timestamps.

### Docker Images
- `ghcr.io/dgtovar/escapemaster-frontend:v0.3` - Production (API v1)
- `ghcr.io/dgtovar/escapemaster-frontend:v0.3-dev` - Preproduction (API v2)

---

## [0.2.0] - 2026-04-12

### Added
- **Docker Image Deployment**: Switched from Git-based to Docker Image deployment via GHCR to bypass Dokploy caching issues.
- **Deploy Script**: `scripts/deploy-frontend.sh` with semantic versioning and GHCR_PAT env var authentication.
- **Documentation**: `docker-image-deploy-guide.md`, `guideDocker.md`, `issues.md`.

### Changed
- **Dockerfile Paths**: Images now use `ghcr.io/dgtovar/escapemaster-frontend` namespace.
- **API URL Baked at Build**: NEXT_PUBLIC_API_URL passed via `--build-arg` during Docker build.

---

## [0.1.0] - 2026-03-10

### Initial Stable Release
- Stable version of the EscapeMaster Manager ecosystem.
- Dashboard with 6-column grid system.
- Improved widget resizing and drag-and-drop performance.
- Fixed reset layout functionality.
- Multi-repo management for `api` and `gestor`.
- Two-column comparison against ERDirector.
