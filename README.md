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
   Create a `.env` file in the root directory and add your Supabase credentials:

   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. Database Migrations:
   Apply the migrations in the `supabase/migrations` folder to your Supabase project.

5. Run Locally:

   ```bash
   npm run dev
   ```

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
