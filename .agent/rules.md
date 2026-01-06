# Project Rules & Conventions

## Tech Stack
-   **Frontend**: React (Vite), TypeScript.
-   **UI Framework**: Material UI (MUI).
-   **Backend**: Supabase.
-   **Grid Component**: Enforce MUI v7 syntax (`<Grid size={{ xs: 12 }}>`) and forbid legacy syntax (`<Grid xs={12}>`).

## Terminal & Shell
-   **Shell**: Always use WSL with zsh for any terminal commands.

## Localization
-   **Region**: Canada.
-   **Currency**: CAD ($).
-   **Date Format**: YYYY-MM-DD or readable Canadian format (e.g., "January 1, 2026").

## Styling
-   **Method**: Use MUI's `sx` prop for component-level styling.
-   **Colors**: Use `primary.main` (#027d6f) for active elements. Use `text.secondary` for inactive/neutral elements.
-   **Forbidden**: Do NOT use Tailwind CSS unless explicitly requested.

## Components & Patterns
-   **Icons**: Use `@mui/icons-material`.
-   **Navigation**: All icons (active/inactive) logic is in `Layout.tsx`. Inactive icons must be `text.secondary` with `0.7` opacity.
-   **State**: Simple React `useState` / `useEffect` is preferred for local data.
-   **Context**: Use `ThemeContext` for global UI themes (dark mode, compact view).

## Database & RLS
-   **Policies**: Avoid "permissive" policies. Split `INSERT`, `UPDATE`, `DELETE` if checks differ.
-   **Performance**: Avoid calling `auth.uid()` directly in policies if it causes re-evaluation. Use `(select auth.uid())` wrapper where appropriate.
-   **Idempotency**: Always includes `DROP POLICY IF EXISTS` before creating policies in scripts.
