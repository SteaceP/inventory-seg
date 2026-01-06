# Project Context & Rules

## 1. Project Overview
**Name**: Inventory Management System (inventory-seg)
**Purpose**: A personal inventory management application with dashboard, inventory tracking, settings, and appliance repair tracking.
**Tech Stack**:
-   **Frontend**: React (Vite), TypeScript, Material UI (MUI), Framer Motion.
-   **Backend**: Supabase (PostgreSQL, Auth, Realtime, Storage).
-   **Styling**: MUI System (`sx` prop), CSS Modules/Vanilla CSS (avoiding Tailwind unless requested).

## 2. Database Schema
Derived from `schema.sql`.

### Core Tables
-   **`public.inventory`**: Tracks items in stock.
    -   Fields: `id`, `name`, `category`, `sku`, `stock`, `image_url` (replaces price), `created_at`.
    -   RLS: `Authenticated update access` (Consolidated policy), `User view access`.
-   **`public.user_settings`**: User profile and app preferences.
    -   Fields: `user_id`, `display_name`, `dark_mode`, `compact_view`, `role` ('admin'/'user'), `avatar_url`.
    -   RLS: Split into specific `INSERT`, `UPDATE`, `DELETE` for owners, and `Authenticated can view all profiles` for SELECT.
-   **`public.inventory_activity`**: Audit log for inventory changes.
    -   Fields: `action` ('created', 'updated', 'deleted'), `changes` (JSONB), `user_id`.

### Appliance Tracker (New)
-   **`public.appliances`**: Household appliances.
    -   Fields: `name`, `type`, `brand`, `model`, `serial_number`, `purchase_date`, `warranty_expiry`, `notes`.
    -   RLS: Users can manage their own appliances.
-   **`public.repairs`**: History of repairs for appliances.
    -   Fields: `appliance_id`, `repair_date`, `description`, `cost`, `service_provider`.
    -   RLS: Users can manage repairs for appliances they own.

## 3. Feature History & Recent Changes

### Session A (Refining Inventory Layout)
-   **Change**: Adjusted inventory list layout.
-   **Detail**: Removed price display. Relocated stock information to the previous price location. Centered category chips for mobile/tablet.

### Session B (Optimize Supabase RLS)
-   **Change**: Performance optimization for RLS.
-   **Detail**: Replaced direct `auth.uid()` calls with `(select auth.uid())` to prevent re-evaluation per row.

### Current Conventions
-   **Icons**: Use MUI Icons (`@mui/icons-material`).
-   **Theming**: `ThemeContext` controls Dark Mode and Compact View. Colors are defined in `App.tsx` (Emerald Teal primary).
-   **Navigation**: Defined in `Layout.tsx` `menuItems` array.
-   **Data Fetching**: Direct calls to `supabase` client in components (e.g., `useEffect` in `Appliances.tsx`), simple state management.
