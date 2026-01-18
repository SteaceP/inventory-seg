---
trigger: always_on
---

# Project Overview

## Project Information

**Name**: Inventory Management System  
**Client**: La Société Emmanuel-Grégoire  
**Purpose**: A standalone inventory management application for tracking stock, appliances, and repairs with real-time synchronization.

## Database Schema

### Core Tables

#### `public.inventory`
Tracks items in stock.

**Key Fields**:
- `id` (UUID) - Primary key
- `name` (TEXT) - Item name
- `category` (TEXT) - Foreign key to `inventory_categories`
- `sku` (TEXT) - Stock keeping unit
- `stock` (INTEGER) - Current stock quantity (auto-calculated from locations)
- `unit_cost` (DECIMAL) - Cost per unit
- `image_url` (TEXT) - Product image URL (Supabase Storage)
- `low_stock_threshold` (INTEGER) - Item-level threshold (optional)
- `user_id` (UUID) - Owner of the inventory item

**RLS**: Authenticated users can update, all users can view

#### `public.inventory_categories`
Manages category-level low stock thresholds.

**Key Fields**:
- `name` (TEXT) - Primary key
- `low_stock_threshold` (INTEGER) - Category-level threshold

#### `public.inventory_stock_locations`
Tracks stock across multiple physical locations.

**Key Fields**:
- `id` (UUID) - Primary key
- `inventory_id` (UUID) - Foreign key to inventory
- `location_id` (UUID) - Foreign key to stock_locations_master
- `quantity` (INTEGER) - Stock at this location

#### `public.stock_locations_master`
Master list of all physical storage locations with hierarchical structure.

**Key Fields**:
- `id` (UUID) - Primary key
- `name` (TEXT) - Location name
- `parent_id` (UUID) - Foreign key to parent location (for hierarchy)
- `location_type` (TEXT) - Type: warehouse, shelf, bin, etc.
- `user_id` (UUID) - Owner of the location

#### `public.user_settings`
User profile and application preferences.

**Key Fields**:
- `user_id` (UUID) - Primary key, foreign key to auth.users
- `display_name` (TEXT)
- `dark_mode` (BOOLEAN)
- `compact_view` (BOOLEAN)
- `language` (TEXT) - en, fr, or ar
- `role` (TEXT)
- `avatar_url` (TEXT)
- `global_low_stock_threshold` (INTEGER) - Fallback threshold

#### `public.inventory_activity`
Audit log for all inventory changes.

**Key Fields**:
- `id` (UUID) - Primary key
- `inventory_id` (UUID) - Related inventory item
- `action` (TEXT) - Type of action (created, updated, deleted, etc.)
- `old_values` (JSONB) - Previous values
- `new_values` (JSONB) - New values
- `user_id` (UUID) - User who made the change
- `created_at` (TIMESTAMP)

### Appliance Management

#### `public.appliances`
Tracks household appliances.

**Key Fields**:
- `id` (UUID) - Primary key
- `name` (TEXT)
- `brand` (TEXT)
- `model` (TEXT)
- `purchase_date` (DATE)
- `warranty_expiry` (DATE)
- `status` (TEXT) - working, needs_repair, retired

#### `public.repairs`
Maintenance history and repair costs.

**Key Fields**:
- `id` (UUID) - Primary key
- `appliance_id` (UUID) - Foreign key to appliances
- `repair_date` (DATE)
- `description` (TEXT)
- `cost` (DECIMAL)
- `technician` (TEXT)

### Push Notifications

#### `public.push_subscriptions`
Stores web push notification subscriptions.

**Key Fields**:
- `id` (UUID) - Primary key
- `user_id` (UUID) - Foreign key to auth.users
- `subscription` (JSONB) - Push subscription object
- `device_info` (TEXT)
- `created_at` (TIMESTAMP)

## Application Pages

- **Dashboard** (`/`) - Overview with stats, low stock alerts, and recent activity
- **Inventory** (`/inventory`) - Categorized grid view with filters and search
- **Appliances** (`/appliances`) - Household appliance tracking with repair history
- **Stock Locations** (`/stock-locations`) - Master location management with hierarchy
- **Inventory Activity** (`/inventory-activity`) - Audit log of all inventory changes
- **Reports** (`/reports`) - Monthly/yearly reports with export capabilities
- **Settings** (`/settings`) - User profile, preferences, and notification settings
- **Login** (`/login`) - Authentication page

## Feature History

### Recent Major Features

#### Multi-Location Stock Tracking
- Implemented `inventory_stock_locations` table with master locations
- Added hierarchical location system (Warehouse → Shelf → Bin)
- UI for managing stock across locations in `StockLocations` page
- Total stock maintained via database triggers

#### Barcode & SKU Management
- Barcode generation using `react-barcode`
- QR code scanning with `html5-qrcode`
- Printable barcode labels via `BarcodePrinter` component

#### Hierarchical Low Stock Thresholds
- 3-tier threshold system: Item → Category → Global
- Added `inventory_categories` table
- Updated `InventoryDialog` and grid components

#### Real-time Notifications
- Supabase Realtime listeners for `inventory_activity` and `appliances`
- Push notifications via Cloudflare Worker with Web Push API
- Email alerts via Brevo API
- In-app notification snackbars for changes by other users

#### Reporting & Analytics
- Monthly and annual stock usage reports
- PDF export and print functionality
- Visual charts and statistics

#### Progressive Web App (PWA)
- Installable web app with manifest
- Service worker for offline functionality
- Cached assets and API responses

#### Performance Optimizations
- RLS optimization using `(select auth.uid())`
- Efficient indexing strategy
- Service worker caching strategy

#### Security Hardening
- Supabase JWT verification in Cloudflare Worker
- Strict CORS and CSP headers configured in `public/_headers`
- Rate limiting on worker endpoints
- Input validation and sanitization (HTML sanitization in worker)

## Current Deployment

- **Frontend**: Cloudflare Pages
- **Backend**: Supabase (hosted)
- **Worker**: Cloudflare Workers
- **Domains**: 
  - Production: `https://inv.coderage.pro`
  - Staging: `https://inventory-seg.pages.dev`