---
trigger: always_on
---

# Coding Conventions

## Styling Guidelines

### MUI System

- **Primary Method**: Use MUI's `sx` prop for component-level styling
- **Colors**:
  - Active elements: `primary.main` (#027d6f)
  - Inactive/neutral elements: `text.secondary`
- **Forbidden**: Do NOT use Tailwind CSS unless explicitly requested

### Theme Integration

- Use `ThemeContext` for global UI themes (dark mode, compact view)
- Respect user theme preferences across all components

## Component Patterns

### Icons

- **Source**: Use `@mui/icons-material` exclusively
- **Navigation Icons**: All icon logic (active/inactive) is in `Layout.tsx`
  - Inactive icons must use `text.secondary` with `0.7` opacity

### Contexts

- **InventoryContext**: For stock and category data
- **ThemeContext**: For global UI themes
- **UserContext**: For user profile and authentication
- **AlertContext**: For global notifications and alerts
- **Error Handling**: Use `useErrorHandler` hook for centralized error reporting to Sentry and MUI alerts
- **Performance Monitoring**: Use `usePerformance` hook for creating custom Sentry spans to measure operation timing

### Navigation

- Defined centrally in `App.tsx` and `Layout.tsx`
- Use React Router for page navigation
- Use `ProtectedRoute` component for session-guarded routes
- Maintain consistent navigation patterns

## Business Logic

### Low Stock Threshold Hierarchy

Follow this precedence order:

1. **Item-level threshold** (highest priority)
2. **Category-level threshold**
3. **Global threshold** from user settings (lowest priority)

Implementation locations:

- Item thresholds: `InventoryDialog`
- Category thresholds: `inventory_categories` table
- Global thresholds: `user_settings` table

## Database Best Practices

### Row Level Security (RLS)

- **Avoid permissive policies**: Split `INSERT`, `UPDATE`, `DELETE` if checks differ
- **Performance**: Use `(select auth.uid())` wrapper instead of calling `auth.uid()` directly
- **Idempotency**: Always include `DROP POLICY IF EXISTS` before creating policies in migration scripts

### Query Optimization

- Index frequently queried columns
- Use proper join strategies
- Leverage Supabase's real-time subscriptions efficiently

## Code Organization

### File Structure

- Keep components focused and single-responsibility
- Use feature-based folder organization
- Separate business logic from presentation components

### Naming Conventions

- Components: PascalCase
- Functions/variables: camelCase
- Constants: UPPER_SNAKE_CASE
- Files: Match component name or use kebab-case for utilities

## TypeScript Best Practices

- **Strict Typing**: NEVER use the `any` type. Use `unknown`, proper interfaces, or generics instead.
- **Centralized Types**: ALWAYS place global types and interfaces in the `src/types/` directory to ensure consistency and reusability across the codebase.
- **Type Exhaustiveness**: Ensure all switches/conditionals cover all possible types.

## Testing Guidelines

### Material UI (MUI) Testing

- **Requirement**: Use real MUI components in tests to ensure high fidelity and accessibility tree verification.
- **Render Utility**: ALWAYS import `render`, `screen`, `fireEvent`, and `waitFor` from `@test/test-utils` (which provides the necessary `ThemeProvider`).
- **Forbidden**: Do NOT mock `@mui/material` or its sub-components globally or locally in test files.
- **Queries**: Prioritize querying by ARIA roles (`getByRole`), labels (`getByLabelText`), or text (`getByText`) to simulate real user interactions.

### Centralized Mocks

- **Requirement**: ALWAYS use the centralized mock utilities in `src/test/mocks/` for non-UI logic:
  - Contexts (`createMockUserContext`, `createMockInventoryContext`, etc.)
  - i18n (`createMockTranslation`)
  - Supabase/Database clients
  - External browser APIs (Storage, Router)
- **Forbidden**: Do NOT create manual, inline mocks for these services unless absolutely necessary for a specific edge case.
- **Data Factories**: Use factories (`createMockInventoryItem`, `createMockCategory`, etc.) for generating test data instead of plain object literals.