# Flowy Web

> The modern frontend for the Flowy hospitality ecosystem.

## 🚀 Features

- **Global Theming**: Dynamic theme switching with 8+ presets (Twilight, Tropical, Vista, etc.).
- **Dashboard Widgets**: Modular widget system including Revenue, Calendar, Occupancy, and more.
- **Authentication**: Secure login/register flows integrated with Supabase.
- **Responsive Design**: Mobile-first approach using Tailwind CSS.

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS + CSS Variables
- **Icons**: Lucide React
- **State Management**: React Context (Theme, Auth)
- **Testing**: Playwright

## 🎨 Theming System

The application uses a CSS variable-based theming system. Themes are defined in `src/context/ThemeContext.tsx` and applied via `data-theme` attribute on the root element.

## 📦 Getting Started

```bash
npm run dev
```
