# Project Rules & Conventions

## Tech Stack

- **Frontend**: React 19 (Vite), TypeScript.
- **UI Framework**: Material UI (MUI).
- **Backend**: Supabase (PostgreSQL, Realtime, Auth, Storage).
- **Grid Component**: Enforce MUI v7 syntax (`<Grid size={{ xs: 12 }}>`) and forbid legacy syntax (`<Grid xs={12}>`).
- **Linting**: Enforce strict type-aware rules and specialized React plugins (`eslint-plugin-react-x`, `eslint-plugin-react-dom`).

## Terminal & Shell

- **Shell**: Always use WSL with zsh for any terminal commands.

## Localization

- **Region**: Canada.
- **Currency**: CAD ($).
- **Date Format**: YYYY-MM-DD or readable Canadian format (e.g., "January 1, 2026").
- **Languages**: Full support for English, French, and Arabic.

## Styling

- **Method**: Use MUI's `sx` prop for component-level styling.
- **Colors**: Use `primary.main` (#027d6f) for active elements. Use `text.secondary` for inactive/neutral elements.
- **Forbidden**: Do NOT use Tailwind CSS unless explicitly requested.

## Components & Patterns

- **Icons**: Use `@mui/icons-material`.
- **Low Stock Thresholds**: Follow hierarchical precedence: **Item > Category > Global**.
- **Navigation**: All icons (active/inactive) logic is in `Layout.tsx`. Inactive icons must be `text.secondary` with `0.7` opacity.
- **Context**: Use `InventoryContext` for stock and category data. Use `ThemeContext` for global UI themes (dark mode, compact view).

## Database & RLS

- **Policies**: Avoid "permissive" policies. Split `INSERT`, `UPDATE`, `DELETE` if checks differ.
- **Performance**: Avoid calling `auth.uid()` directly in policies. Use `(select auth.uid())` wrapper.
- **Idempotency**: Always includes `DROP POLICY IF EXISTS` before creating policies in scripts.
