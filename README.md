# Modern Inventory Management System

A standalone inventory management application built with a modern tech stack, designed for efficiency, clarity, and real-time synchronization. This project is designed to be easily configurable and forkable via environment variables.

## ✨ Features

- **📊 Dashboard**: Overview of total items, top categories, and low stock alerts.
- **📦 Inventory Tracking**:
  - Categorized grid view with collapsible sections.
  - Low stock thresholds at item, category, and global levels (**Hierarchy: Item > Category > Global**).
  - SKU/Barcode generation and scanning support.
  - Image support for visual tracking.
  - **Location Management**: Hierarchical stock organization (Warehouse → Shelf → Bin).
- **🔧 Appliance Tracking**:
  - Manage household appliances (Brand, Model, Serial Number).
  - Repair history tracking with costs and service provider information.
- **📊 Reports & Analytics**:
  - Monthly and annual stock usage reports.
  - PDF/Print export for physical audits.
- **⚡ Real-time Updates**: Instant synchronization across devices via Supabase Realtime.
- **🌍 Multilingual Support**: Full support for English and French.
- **🎨 Customization**:
  - Dark and light modes.
  - Compact view for high-density information.
  - User profile customization (Display Name, Avatar).
- **🤖 AI-Driven Automated Reordering**:
  - Daily stock analysis via Cloudflare AI (Llama 3).
  - Intelligent grouping by supplier (BOD, Stationery, etc.).
  - Proactive push notifications for optimal order volumes.

## 🛠️ Technology Stack

- **Frontend**: [React 19](https://react.dev/), [Vite](https://vitejs.dev/), [TypeScript](https://www.typescriptlang.org/)
- **UI & Component Library**: [Material UI (MUI)](https://mui.com/), [Framer Motion](https://www.framer.com/motion/)
- **Backend & Database**: [Supabase](https://supabase.com/) (PostgreSQL, Auth, Storage, Realtime), [Cloudflare Workers AI](https://developers.cloudflare.com/workers-ai/)
- **State Management**: React Context API
- **Internationalization**: Custom i18n implementation
- **Testing**: [Vitest](https://vitest.dev/) (unit), [Playwright](https://playwright.dev/) (e2e), [React Testing Library](https://testing-library.com/react)

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v24 or later recommended)
- [pnpm](https://pnpm.io/)
- A [Supabase](https://supabase.com/) account and project.

### Installation Instructions

1. Clone the repo:

   ```bash
   git clone https://github.com/your-username/inventory-system.git
   cd inventory-system
   ```

2. **Prepare Configuration Files**:
   Generate `package.json` and `wrangler.toml` from templates using environment variables:

   ```bash
   node scripts/prepare-configs.js
   ```

3. **Install dependencies**:

   ```bash
   pnpm install
   ```

4. **Configure environment variables**:
   Create a `.env.local` file in the root directory (ignored by git):

   ```bash
   cp .env.example .env.local
   ```

   Then, edit `.env.local` with your credentials (both public `VITE_` vars and private worker secrets):

   ```env
   # Supabase
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key_here
   SUPABASE_SECRET_KEY=your_supabase_secret_key_here

   # Push Notifications
   VITE_VAPID_PUBLIC_KEY=your_vapid_public_key_here
   VAPID_PRIVATE_KEY=your_private_key_here
   ```

   **NEVER** use `VITE_SUPABASE_SECRET_KEY` in client-side code!

4. Database Migrations:
   Apply the migrations found in the `supabase/migrations` folder to your Supabase project.

5. Run locally:

   ```bash
   pnpm run dev
   ```

## 🚀 Deployment

### Cloudflare Workers with Assets

This application is deployed as a single Cloudflare Worker using the **Workers with Assets** feature (no separate Cloudflare Pages project required).

1. **Configure Environment Variables**:
   Set your production variables in the Cloudflare Dashboard (Settings -> Variables) or in `wrangler.toml` (not recommended for secrets).

2. **Deploy via Wrangler**:

   ```bash
   pnpm run deploy
   ```

   This command runs `pnpm run build` and then `wrangler deploy` to publish both the worker logic and the static assets.

3. **Set Worker Secrets**:

   ```bash
   pnpm dlx wrangler secret put SUPABASE_SECRET_KEY
   pnpm dlx wrangler secret put VAPID_PRIVATE_KEY
   pnpm dlx wrangler secret put BREVO_API_KEY
   ```

- Deploy with `pnpm run deploy`
- Your assets are automatically handled in the `dist/client` directory as configured in `wrangler.toml`.

### 🔐 Configuration & Secret Management

This project is fully genericized. All environment-specific values are injected at build-time or runtime via environment variables and secrets.

#### 1. GitHub Environment (Build-time & CI/CD)
Configure these in **Settings > Secrets and variables > Actions**. These are required for generating configuration files and building the application.

| Type | Name | Purpose |
| :--- | :--- | :--- |
| **Secret** | `CLOUDFLARE_API_TOKEN` | Deployment token for Cloudflare. |
| **Secret** | `CLOUDFLARE_ACCOUNT_ID` | Your Cloudflare account ID. |
| **Secret** | `SENTRY_AUTH_TOKEN` | Required for uploading source maps. |
| **Secret** | `HYPERDRIVE_ID` | Production Hyperdrive ID (Binding). |
| **Secret** | `D1_DATABASE_ID` | Production D1 Database UUID (Binding). |
| **Secret** | `D1_DATABASE_NAME` | Production D1 Database Name. |
| **Variable** | `APP_URL` | Production URL (e.g., `https://inv.example.com`). |
| **Variable** | `ALLOWED_ORIGIN`| Additional CORS origins (separates by comma). |
| **Variable** | `BREVO_SENDER_EMAIL` | Email address shown as sender. |
| **Variable** | `GH_USERNAME` | GitHub username for repository links. |
| **Variable** | `REPO_NAME` | Repository name (e.g., `inventory-seg`). |
| **Variable** | `PACKAGE_NAME` | Application name in `package.json`. |
| **Variable** | `WORKER_NAME` | Name of the deployed Cloudflare Worker. |
| **Variable** | `COMPANY_NAME` | Company name shown in UI and footers. |
| **Variable** | `ADMIN_EMAIL` | Admin contact for notifications. |
| **Variable** | `VITE_APP_NAME` | Public application title. |
| **Variable** | `VITE_COMPANY_NAME` | Public company name. |
| **Variable** | `VITE_COMPANY_URL` | Public company website URL. |
| **Variable** | `VITE_SUPABASE_URL` | **Crucial**: Public URL of your Supabase project. |
| **Variable** | `VITE_SUPABASE_PUBLISHABLE_KEY`| Public anon key for Supabase. |
| **Variable** | `VITE_VAPID_PUBLIC_KEY` | Public key for browser push notifications. |
| **Variable** | `VITE_SENTRY_DSN` | Sentry DSN for error reporting. |
| **Variable** | `VITE_TURNSTILE_SITE_KEY` | (Optional) Cloudflare Turnstile key. |

#### 2. Cloudflare Runtime (Production Secrets)
These must be set directly on the Cloudflare Worker dashboard (**Settings > Variables**) or via CLI. These are **never** committed and are not part of the build templates.

| Secret Name | Purpose |
| :--- | :--- |
| `SUPABASE_SECRET_KEY` | Secret key for backend database access (bypasses RLS). |
| `BREVO_API_KEY` | API key for sending notifications. |
| `VAPID_PRIVATE_KEY` | Private key for push notification signing. |
| `SENTRY_DSN` | Sentry DSN for the worker logic. |

To set a secret via CLI:
```bash
pnpm dlx wrangler secret put SUPABASE_SECRET_KEY
```

#### 3. Local Development (`.env.local`)
-   **`.env.local`**: Consolidated file for all local variables. This includes `VITE_` variables for the frontend and worker secrets (e.g., `SUPABASE_SECRET_KEY`) for local `pnpm run dev`.

> [!TIP]
> Use `.env.example` as a template for your `.env.local`.

#### 4. Local CI Testing (`act`)
You can simulate the GitHub Actions environment locally using [act](https://github.com/nektos/act). We use a consolidated `.act.env` file (ignored by git) for both secrets and variables.

For multi-OS installation guides and detailed usage, see [07-local-testing.md](.agent/rules/07-local-testing.md).

### Pre-deployment Security Checklist

- ✅ All secrets are in `.env.local` (never `.env`)
- ✅ `.env.local` is in `.gitignore`
- ✅ Using `VITE_SUPABASE_PUBLISHABLE_KEY` in the client (not the secret key)
- ✅ Cloudflare Worker secrets set via CLI
- ✅ CSP headers configured
- ✅ Supabase RLS policies enabled on all tables
- ✅ Test authentication flows
- ✅ Verify push notifications work
- ✅ Check PWA offline functionality

## 🔒 Security

This application follows security best practices:

- **Row Level Security (RLS)**: All database tables have RLS policies enabled
- **Authentication**: Supabase Auth with secure session handling
- **Input Validation**: Server-side validation on all API endpoints
- **CSP Headers**: Content Security Policy to prevent XSS attacks
- **Secret Management**: Environment variables are never committed to version control
- **SQL Injection Prevention**: Parameterized queries via Supabase client
- **HTTPS Only**: PWA requires HTTPS for service workers

For security issues, see [`SECURITY.md`](./SECURITY.md).

## 📜 Database Schema

Core tables include:

- `inventory`: Tracks stock items and thresholds.
- `inventory_categories`: Manages category-specific thresholds.
- `inventory_activity`: Audit log for all changes.
- `appliances` & `repairs`: Manages household hardware and maintenance history.
- `user_settings`: User preferences and profile data.

## 🤝 Contributing

This project is licensed under the **AGPL-3.0-only** license. See the [`LICENSE`](./LICENSE) file for more details.
