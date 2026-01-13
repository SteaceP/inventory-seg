# Project Context & Rules

## 1. Project Overview

**Name**: Inventory Management System (La Société Emmanuel-Grégoire)
**Purpose**: A standalone inventory management application for La Société Emmanuel-Grégoire, tracking stock, appliances, and repairs with real-time sync.

**Tech Stack**:

- **Frontend**: React 19 (Vite), TypeScript, Material UI (MUI), Framer Motion.
- **Backend**: Supabase (PostgreSQL, Auth, Realtime, Storage).
- **Styling**: MUI System (`sx` prop), CSS Modules/Vanilla CSS.
- **Linting**: ESLint (type-aware), Prettier, React-specific plugins (`eslint-plugin-react-x`, `eslint-plugin-react-dom`).

## 2. Database Schema

Derived from `schema.sql` and migrations.

### Core Tables

- **`public.inventory`**: Tracks items in stock.
  - Fields: `id`, `name`, `category`, `sku`, `stock`, `inventory_categories`, `image_url`, `low_stock_threshold` (item-level).
  - RLS: Authenticated update, User view.
- **`public.inventory_categories`**: Thresholds per category.
  - Fields: `name` (PK), `low_stock_threshold`.
- **`public.user_settings`**: User profile and app preferences.
  - Fields: `user_id`, `display_name`, `dark_mode`, `compact_view`, `role`, `avatar_url`.
- **`public.inventory_activity`**: Audit log for inventory changes.

### Appliance Tracker

- **`public.appliances`**: Household appliances management.
- **`public.repairs`**: Maintenance history and costs.

## 3. Feature History & Recent Changes

### Session A (Refining Inventory Layout)

- **Change**: Adjusted inventory list layout and removed price display.

### Session B (Optimize Supabase RLS)

- **Change**: Performance optimization for RLS using `(select auth.uid())`.

### Session C (Hierarchical Low Stock Thresholds)

- **Change**: Implemented a 3-tier threshold system.
- **Detail**: Precedence: **Item Threshold** > **Category Threshold** > **Global Threshold (User Setting)**. Added `inventory_categories` table and UI controls in `InventoryDialog` and `InventoryCategorizedGrid`.

## 4. Current Conventions

- **Icons**: Use MUI Icons (`@mui/icons-material`).
- **Theming**: `ThemeContext` controls Dark Mode and Compact View.
- **Localization**: Supports English, French, and Arabic.
- **Navigation**: Defined in `Layout.tsx`.
- **Data Fetching**: Supabase client in contexts (`InventoryContext`, `UserContext`) and components.
