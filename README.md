# 🖥️ Escapemaster Web

> The modern, responsive frontend for the Escapemaster hospitality ecosystem.

[![Next.js](https://img.shields.io/badge/Next.js-16.0-black)](https://nextjs.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-blue)](https://tailwindcss.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org)

## 📋 Overview

Escapemaster Web is the primary interface for hotel staff and escape room owners. It provides a customizable dashboard, booking management, and configuration settings, all wrapped in a dynamic theming system.

## 🏗️ Architecture & Stack

The application is built on **Next.js 16** using the **App Router** architecture.

### Core Stack

- **Framework:** Next.js 16 (React 19)
- **Styling:** Tailwind CSS v4 + CSS Variables for Theming
- **State Management:** Zustand (Global Store) + React Context (Theme/Auth)
- **Data Fetching:** Axios
- **Drag & Drop:** `@dnd-kit` (Dashboard customization)
- **Charts:** `recharts`
- **Icons:** `lucide-react`

## 📂 Project Structure

```
escapemaster-web/
├── src/
│   ├── app/              # Next.js App Router pages
│   │   ├── (auth)/       # Login/Register routes
│   │   ├── (dashboard)/  # Protected application routes
│   │   └── layout.tsx    # Root layout
│   ├── components/
│   │   ├── ui/           # Reusable UI atoms (Button, Card, Input)
│   │   ├── domain/       # Feature-specific components (Dashboard, Bookings)
│   │   └── layout/       # Sidebar, Header, Shell
│   ├── context/          # React Context providers (Theme, Auth)
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Utilities (axios instance, cn helper)
│   ├── services/         # API service layer
│   ├── store/            # Zustand stores
│   └── types/            # TypeScript definitions
├── e2e/                  # Playwright end-to-end tests
└── public/               # Static assets
```

## 🌟 Recent Milestones (December 2025)

- **Full Rebranding:** Migrated all components and branding to **Escapemaster**.
- **HR Management:** Launched `/hr-management`, `/time-tracking`, and `/roles` sections.
- **Mobile Overhaul:** Optimized all dashboard views and calendar for mobile devices.
- **Next.js Middleware Migration:** Refactored `middleware.ts` to `proxy.ts` for better performance and compliance.
- **Global Theming Engine**: Implemented a robust theme context supporting multiple color palettes (Twilight, Tropical, Vista, etc.) with local storage persistence.
- **Widget-Based Dashboard**: Refactored the dashboard to use a modular widget system with drag-and-drop capabilities.

## 🚀 Development Phases & Roadmap

### ✅ Phase 1: UI Foundation (Completed)

- [x] Next.js 16 + Tailwind v4 setup.
- [x] Global Theming System (8+ presets).
- [x] Responsive App Shell (Sidebar, Header).
- [x] Dashboard Widget System (UI).
- [x] Drag & Drop Layout Engine.

### 🚧 Phase 2: Integration (In Progress)

- [ ] **API Connection:** Replace mock data in widgets with real API calls.
- [ ] **Persistence:** Save user preferences (theme, layout) to the backend.
- [ ] **Settings:** Implement forms for Organization and Location settings.
- [ ] **Bookings:** Build the interactive calendar and booking list views.

### 🔮 Phase 3: Advanced Features (Planned)

- [ ] **Real-time:** Implement WebSockets for live booking updates.
- [ ] **Offline Mode:** Basic PWA capabilities.
- [ ] **Performance:** Route pre-fetching and image optimization.

## 🧪 Testing

We use a dual-testing strategy to ensure reliability:

### Unit & Integration Tests (Vitest)
Fast, component-level tests using Vitest and React Testing Library.

```bash
# Run unit tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### End-to-End Tests (Playwright)
Full browser automation tests to verify critical user flows.

```bash
# Run E2E tests
npm run test:e2e

# Open Playwright UI mode
npm run test:e2e:ui
```

## 🛠️ Setup & Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/diegogzt/escapemaster-web.git
   cd escapemaster-web
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Configure Environment:**
   Create `.env.local` and add:

   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8000
   ```

4. **Start Development Server:**
   ```bash
   npm run dev
   ```

## 📖 Documentation

See the [Escapemaster Docs](../escapemaster-docs) repository for full system documentation.
