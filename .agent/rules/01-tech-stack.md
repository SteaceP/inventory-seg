---
trigger: always_on
---

# Tech Stack

## Frontend Stack

- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite
- **Package Manager**: pnpm
- **UI Library**: Material UI (MUI) v7
- **Animation**: Framer Motion
- **Styling**: MUI System (`sx` prop), CSS Modules/Vanilla CSS

### Grid Component Requirements

- **Enforce MUI v7 syntax**: `<Grid size={{ xs: 12 }}>` ✅
- **Forbidden legacy syntax**: `<Grid xs={12}>` ❌

## Backend Stack

- **Database**: Supabase PostgreSQL
- **Authentication**: Supabase Auth
- **Real-time**: Supabase Realtime
- **Storage**: Supabase Storage
- **Worker**: Cloudflare Worker (for push notifications, email alerts, and static asset hosting)
- **AI**: Cloudflare Workers AI (@cf/meta/llama-3-8b-instruct)
- **Deployment**: Cloudflare Workers with Assets (NOT Cloudflare Pages)

## Code Quality

### Linting & Formatting

- **ESLint**: Type-aware configuration
- **Prettier**: Code formatting
- **React Plugins**:
  - `eslint-plugin-react-x`
  - `eslint-plugin-react-dom`
  - `eslint-plugin-react-hooks`
  - `eslint-plugin-react-refresh`

### Testing

- **Unit Testing**: Vitest with React Testing Library
- **E2E Testing**: Playwright
- **Worker Testing**: `@cloudflare/vitest-pool-workers`

## Localization

- **Region**: Canada
- **Currency**: CAD ($)
- **Date Format**: YYYY-MM-DD or readable Canadian format (e.g., "January 1, 2026")
- **Supported Languages**:
  - English (en)
  - French (fr)

## Development Tools

- **MCP Servers**:
  - **Supabase**: Use `supabase-mcp-server` for database interactions, migrations, and schema inspection.
  - **MUI**: Use `mui-mcp` server to answer any MUI questions:
    1. Call `useMuiDocs` to fetch docs for the relevant package.
    2. Call `fetchDocs` for additional docs using ONLY URLs from the returned content.
    3. Repeat until all relevant docs are fetched.
    4. Use the fetched content to answer the question.
