<p align="center">
  <b>English</b> | 
  <a href="README.fr.md">Français</a> | 
  <a href="README.ar.md">العربية</a>
</p>

# SEG Inventory

An inventory management application for La Société Emmanuel-Grégoire, entirely independent of the main intranet/extranet, built with a modern tech stack, designed for efficiency, clarity, and real-time synchronization.

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
- **🌍 Multilingual Support**: Full support for English, French, and Arabic.
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

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v24 or later recommended)
- [pnpm](https://pnpm.io/)
- A [Supabase](https://supabase.com/) account and project.

### Installation Instructions

1. Clone the repo:

   ```bash
   git clone https://github.com/steace/inventory-seg.git
   cd inventory-seg
   ```

2. Install dependencies:

   ```bash
   pnpm install
   ```

3. Configure environment variables:

   **Important**: Never commit real secrets to version control!

   Create a `.env.local` file in the root directory (ignored by git):

   ```bash
   cp .env.example .env.local
   ```

   Then, edit `.env.local` with your own Supabase credentials:

   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key_here
   VITE_VAPID_PUBLIC_KEY=your_vapid_public_key_here
   VITE_VAPID_PRIVATE_KEY=your_vapid_private_key_here
   ```

   **NEVER** use `VITE_SUPABASE_SECRET_KEY` in client-side code!

4. Database Migrations:
   Apply the migrations found in the `supabase/migrations` folder to your Supabase project.

5. Run locally:

   ```bash
   pnpm run dev
   ```

## 🚀 Deployment

### Cloudflare Pages + Workers

This application is designed to be deployed on Cloudflare Pages with a Cloudflare Worker for the backend API.

1. **Build the application:**

   ```bash
   pnpm run build
   ```

2. **Set Cloudflare Worker secrets** (NEVER commit these to version control):

   ```bash
   pnpm dlx wrangler secret put SUPABASE_SECRET_KEY
   pnpm dlx wrangler secret put VAPID_PRIVATE_KEY
   pnpm dlx wrangler secret put BREVO_API_KEY
   ```

3. **Deploy the Worker:**

   ```bash
   pnpm dlx wrangler deploy
   ```

4. **Deploy to Cloudflare Pages:**
   - Connect your GitHub repo to Cloudflare Pages
   - Set build command: `pnpm run build`
   - Set output directory: `dist`
   - Add environment variables (VITE_* variables only)

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

This is a personal project, but suggestions and improvements are welcome! Feel free to open an issue or submit a pull request.

## 📄 License

This project is private and intended for personal use. See the [`LICENSE`](./LICENSE) file for more details.
