# Inventory Management System

An inventory management application for La Société Emmanuel-Grégoire, completely out of the main intranet/extranet, built with a modern tech stack, designed for efficiency, clarity, and real-time synchronization.

## ✨ Features

- **📊 Dashboard**: High-level overview of total items, top categories, and low stock alerts.
- **📦 Inventory Tracking**:
  - Categorized grid view with collapsible sections.
  - Item-level, Category-level, and Global low stock thresholds (**Hierarchical Logic: Item > Category > Global**).
  - SKU/Barcode generation and scanning support.
  - Image support for visual tracking.
- **🔧 Appliance Tracker**:
  - Manage household appliances (Brand, Model, Serial Number).
  - Repair history tracking with cost and service provider information.
- **⚡ Real-time Updates**: Instant synchronization across devices using Supabase Realtime.
- **🌍 Multi-language Support**: Full support for English, French amd Arabic.
- **🎨 Personalization**:
  - Dark Mode and Light Mode.
  - Compact View for high-density information display.
  - User profile customization (Display Name, Avatar).

## 🛠️ Tech Stack

- **Frontend**: [React 19](https://react.dev/), [Vite](https://vitejs.dev/), [TypeScript](https://www.typescriptlang.org/)
- **UI & Component Library**: [Material UI (MUI)](https://mui.com/), [Framer Motion](https://www.framer.com/motion/)
- **Backend & Database**: [Supabase](https://supabase.com/) (PostgreSQL, Auth, Storage, Realtime)
- **State Management**: React Context API
- **Internationalization**: Custom i18n implementation

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later recommended)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- A [Supabase](https://supabase.com/) account and project.

### Setup Instructions

1. Clone the repository:

   ```bash
   git clone https://github.com/steace/inventory-seg.git
   cd inventory-seg
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Configure Environment Variables:

   **Important**: Never commit real secrets to version control!

   Create a `.env.local` file in the root directory (this file is gitignored):

   ```bash
   cp .env.example .env.local
   ```

   Then edit `.env.local` with your actual Supabase credentials:

   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key_here
   VITE_VAPID_PUBLIC_KEY=your_vapid_public_key_here
   VITE_VAPID_PRIVATE_KEY=your_vapid_private_key_here
   ```

   **NEVER** use `VITE_SUPABASE_SECRET_KEY` in client-side code!

4. Database Migrations:
   Apply the migrations in the `supabase/migrations` folder to your Supabase project.

5. Run Locally:

   ```bash
   npm run dev
   ```

## 🚀 Deployment

### Cloudflare Pages + Workers

This app is designed to be deployed on Cloudflare Pages with a Cloudflare Worker for backend API.

1. **Build the application:**

   ```bash
   npm run build
   ```

2. **Set Cloudflare Worker secrets** (NEVER commit these to version control):

   ```bash
   npx wrangler secret put SUPABASE_SECRET_KEY
   npx wrangler secret put VAPID_PRIVATE_KEY
   npx wrangler secret put BREVO_API_KEY
   ```

3. **Deploy the Worker:**

   ```bash
   npx wrangler deploy
   ```

4. **Deploy to Cloudflare Pages:**
   - Connect your GitHub repository to Cloudflare Pages
   - Set build command: `npm run build`
   - Set output directory: `dist`
   - Add environment variables (VITE_* variables only)

### Security Checklist Before Deployment

- ✅ All secrets are in `.env.local` (never `.env`)
- ✅ `.env.local` is in `.gitignore`
- ✅ Using `VITE_SUPABASE_PUBLISHABLE_KEY` in client (not secret key)
- ✅ Cloudflare Worker secrets set via CLI
- ✅ CSP headers configured
- ✅ Supabase RLS policies enabled on all tables
- ✅ Test authentication flows
- ✅ Verify push notifications work
- ✅ Check PWA offline functionality

## 🔒 Security

This application follows security best practices:

- **Row Level Security (RLS)**: All database tables have RLS policies enabled
- **Authentication**: Supabase Auth with secure session management
- **Input Validation**: Server-side validation on all API endpoints
- **CSP Headers**: Content Security Policy to prevent XSS attacks
- **Secrets Management**: Environment variables are never committed to version control
- **SQL Injection Prevention**: Parameterized queries via Supabase client
- **HTTPS Only**: PWA requires HTTPS for service workers

For security issues, see [`SECURITY.md`](file:///home/steace/dev/inventory-seg/SECURITY.md).

## 📜 Database Schema

The core tables include:

- `inventory`: Tracks stock items and their thresholds.
- `inventory_categories`: Manages category-specific thresholds.
- `inventory_activity`: Audit log for all changes.
- `appliances` & `repairs`: Manages household hardware and maintenance history.
- `user_settings`: User preferences and profile data.

## 🤝 Contributing

This is a personal project, but suggestions and improvements are welcome! Feel free to open an issue or submit a pull request.

## 📄 License

This project is private and intended for personal use.
