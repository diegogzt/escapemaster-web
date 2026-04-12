# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build Commands

```bash
npm run dev      # Start dev server on port 3001
npm run build    # Production build
npm run start    # Start production server
npm run lint     # ESLint
npm run test     # Vitest unit/integration tests
npm run test:e2e # Playwright e2e tests
npm run test:e2e:ui # Playwright with UI mode
```

## Architecture

### Stack
- **Next.js 16** (React 19) with app router
- **Tailwind CSS v4** with CSS custom properties theming
- **Axios** for API calls with request/response interceptors
- **Zustand** for global state store
- **dnd-kit** for dashboard drag-and-drop widget system
- **Supabase SSR** for server-side Supabase clients

### Route Groups
- `src/app/(auth)/` — Public/auth routes (login, register, forgot-password, reset-password)
- `src/app/(dashboard)/` — Protected application routes (dashboard, bookings, rooms, etc.)
- Root redirect `/` → `/dashboard` (configured in next.config.ts)

### Authentication Flow
- JWT token stored in `localStorage` AND `js-cookie` (7-day expiry)
- Token read by Axios interceptor and attached as `Authorization: Bearer <token>`
- **401 responses automatically clear token and redirect to `/login`**
- `AuthContext` provides `login()`, `logout()`, `isAuthenticated`, `user`
- JWT expiration checked client-side on mount; expired tokens trigger logout
- Unauthenticated users on protected routes redirect via `AuthContext` (middleware may also handle this)

### API Service Layer
All API calls go through `src/services/api.ts` which exports named service objects:
- `auth` — login, register, me, forgotPassword, resetPassword, onboard, joinOrganization
- `bookings` — list, create, get, update, delete, updateStatus, claim, confirm, finalize, signGDPR
- `rooms` — list, create, get, update, delete, getAvailability
- `dashboard` — getStats, getSummary, getRevenue, blockHours
- `gamemaster` — getToday, checkIn, getBooking, recordResult
- `payments`, `reports`, `roles`, `users`, `coupons`, `notifications`, `reviews`, `payouts`, `billing`, `kyb`, `developer`

Base URL: `NEXT_PUBLIC_API_URL` env var (defaults to `https://api.escapemaster.es`).

### Theming System
`ThemeContext` manages themes via CSS custom properties applied to `:root` and body classes:
- Standard themes set via `theme-<name>` body class (e.g., `theme-tropical`, `theme-ocean`)
- Custom themes apply via `--color-primary`, `--color-secondary`, `--color-background`, `--color-foreground` CSS variables on `:root`
- Dark mode toggled via `dark` class on `<html>`
- Preferences sync to API via `updateUser({ preferences: { theme, isDarkMode, customThemes } })`

### Key Files
- `src/context/AuthContext.tsx` — Auth state, login/logout, token validation
- `src/context/ThemeContext.tsx` — Theme state, palette management, dark mode
- `src/services/api.ts` — Axios instance, interceptors, all API service exports
- `src/store/useDashboardStore.ts` — Zustand store for dashboard widget state
- `src/components/domain/dashboard/widget-registry.tsx` — Widget registration system

## Environment Variables

```env
NEXT_PUBLIC_API_URL=https://api.escapemaster.es
NEXT_PUBLIC_APP_URL=https://my.escapemaster.es
GOOGLE_GENERATIVE_AI_API_KEY=...
MISTRAL_API_KEY=...
```
