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

### Navigation

- Defined centrally in `Layout.tsx`
- Use React Router for page navigation
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