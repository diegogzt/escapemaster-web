# Escapemaster gestor

The modern, responsive frontend for the Escapemaster hospitality ecosystem.

[![Next.js](https://img.shields.io/badge/Next.js-16.0-black)](https://nextjs.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-blue)](https://tailwindcss.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org)

## Overview

Escapemaster gestor is the primary interface for hotel staff and escape room 
owners. It provides a customizable dashboard, booking management, and 
configuration settings, all wrapped in a dynamic theming system.

## Architecture and stack

The application is built on Next.js 16 using the app router architecture.

### Core stack

The frontend utilizes modern web technologies to ensure a responsive and fast
user experience.

- **Framework:** Next.js 16 (React 19)
- **Styling:** Tailwind CSS v4 and CSS variables for theming
- **State Management:** Zustand (global store) and React Context (theme/auth)
- **Data Fetching:** Axios
- **Drag and Drop:** `@dnd-kit` (dashboard customization)
- **Charts:** `recharts`
- **Icons:** `lucide-react`

## Project structure

The directory structure separates application routes from reusable UI components
and global state.

```text
manager/gestor/
├── src/
│   ├── app/              # Next.js app router pages
│   │   ├── (auth)/       # Login and register routes
│   │   ├── (dashboard)/  # Protected application routes
│   │   └── layout.tsx    # Root layout
│   ├── components/
│   │   ├── ui/           # Reusable UI atoms (Button, Card, Input)
│   │   ├── domain/       # Feature-specific components (Dashboard, Bookings)
│   │   └── layout/       # Sidebar, header, shell
│   ├── context/          # React Context providers (Theme, Auth)
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Utilities (axios instance, cn helper)
│   ├── services/         # API service layer
│   ├── store/            # Zustand stores
│   └── types/            # TypeScript definitions
├── e2e/                  # Playwright end-to-end tests
└── public/               # Static assets
```

## Recent milestones (December 2025)

The project recently achieved several major UI and architectural improvements.

- **Full rebranding:** Migrated all components and branding to Escapemaster.
- **HR management:** Launched `/hr-management`, `/time-tracking`, and `/roles`.
- **Mobile overhaul:** Optimized all dashboard views and calendar for mobile.
- **Next.js middleware migration:** Refactored `middleware.ts` to `proxy.ts`.
- **Global theming engine:** Implemented a robust theme context supporting
  multiple color palettes with local storage persistence.
- **Widget-based dashboard:** Refactored the dashboard to use a modular widget
  system with drag-and-drop capabilities.

## Development phases and roadmap

The application development follows a phased approach to deliver core features
and expand capabilities.

### Phase 1: UI foundation (completed)

The initial phase established the core visual layout and interactive dashboard
elements.

- [x] Next.js 16 and Tailwind v4 setup.
- [x] Global theming system (8+ presets).
- [x] Responsive app shell (sidebar, header).
- [x] Dashboard widget system.
- [x] Drag and drop layout engine.

### Phase 2: Integration (in progress)

The current phase connects the frontend components to backend APIs and persistent
storage.

- [ ] **API connection:** Replace mock data in widgets with real API calls.
- [ ] **Persistence:** Save user preferences to the backend.
- [ ] **Settings:** Implement forms for organization and location settings.
- [ ] **Bookings:** Build the interactive calendar and booking list views.

### Phase 3: Advanced features (planned)

Future updates will focus on real-time capabilities and performance optimization.

- [ ] **Real-time:** Implement WebSockets for live booking updates.
- [ ] **Offline mode:** Basic PWA capabilities.
- [ ] **Performance:** Route pre-fetching and image optimization.

## Testing

We use a dual-testing strategy to ensure reliability across individual components
and full user journeys.

### Unit and integration tests (Vitest)

Fast, component-level tests verify isolated functionality using Vitest and React
Testing Library.

```bash
# Run unit tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### End-to-end tests (Playwright)

Full browser automation tests simulate critical user flows across the entire
application.

```bash
# Run E2E tests
npm run test:e2e

# Open Playwright UI mode
npm run test:e2e:ui
```

## Setup and installation

Follow these instructions to configure and run the frontend development server
locally.

1. Clone the repository:

   ```bash
   git clone https://github.com/diegogzt/manager-gestor.git
   cd manager-gestor
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Configure the environment variables. Create `.env.local` and add your local
   API URL.

   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8000
   ```

4. Start the development server:

   ```bash
   npm run dev
   ```

## Documentation

See the `Escapemaster Docs` repository for full system documentation.
