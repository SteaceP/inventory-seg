# Copilot / AI Agent Instructions for inventory-seg

This file gives focused, repository-specific guidance so an AI coding agent can be productive immediately.

1) High-level architecture
- Frontend: React + TypeScript app built with Vite (entry: `src/main.tsx`, root component `src/App.tsx`).
- State & API: Uses Supabase for DB + realtime. The Supabase client is created in `src/supabaseClient.ts` and used across `src/contexts/*` (example: `InventoryProvider` in `src/contexts/InventoryContext.tsx`).
- Edge/API: Cloudflare Worker at `src/worker.ts` (packaged via `wrangler.jsonc`, `assets.directory` = `./dist`) — handles server-side email notifications (BREVO).
- Data model: SQL migrations live in `migrations/` and `schema.sql`. The app queries the `inventory` table (see `InventoryContext`).

2) Important workflows & commands
- Development: `npm run dev` (vite dev server, HMR).
- Build: `npm run build` — runs `tsc -b` then `vite build`. `dist/` is produced and used as static assets for the worker.
- Preview: `npm run preview` to preview a production build locally.
- Lint: `npm run lint`.
- Deploy Worker: Use Wrangler (not scripted here). `wrangler publish` (set envs in Wrangler/Cloudflare).

3) Environment & secrets
- Vite env keys (client): `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY`. Accessed via `import.meta.env` (see `src/supabaseClient.ts`).
- Worker env keys (server): `BREVO_API_KEY`, `BREVO_SENDER_EMAIL` — required by `src/worker.ts` and configured in Wrangler/Cloudflare.

4) Patterns & conventions to follow
- Use the provided `supabase` instance from `src/supabaseClient.ts` for DB access and realtime subscriptions. Example pattern: `.from('inventory').select('*').order('category').order('name')` and `supabase.channel(...).on('postgres_changes', ...)` (see `InventoryContext`).
- UI/state structure: Context providers live in `src/contexts/` and are consumed by pages in `src/pages/` and components in `src/components/` (e.g., `InventoryGrid`, `InventoryTable`). Prefer adding new shared logic in `src/contexts`.
- i18n: `src/i18n.ts` + `useTranslation` hook are used site-wide. Use translation keys for user-facing strings (see `InventoryContext` for `t('errors.loadInventory')`).
- Types: Keep model types in `src/types/` (example: `src/types/inventory.ts`). Update types when DB schema changes.

4.a) Coding rules (project-specific)
- Never call a `setState` updater directly inside `useEffect` as the primary effect body. If you need to load data or update state from an async operation, do that inside an inner async function and call the updater there, or return the new value and apply the update with a functional setter. Example pattern (see `src/contexts/InventoryContext.tsx`):
	- Good: call an async `fetchInventory()` inside `useEffect` and let that function call `setItems(...)` after data is received.
	- Avoid: directly invoking `setItems(...)` as the top-level statement in `useEffect` that depends on changing values — this can create render loops or stale closures.
- Never use the `any` type. Prefer precise types from `src/types/` (e.g. `InventoryItem`), `unknown` + narrowing, or generics. If a quick narrow is needed, add a TODO and update the type properly before merging. Run `npm run lint` to catch accidental `any` uses.

5) Integration notes / gotchas
- Supabase realtime: Subscriptions are created with `supabase.channel(...).on('postgres_changes', ...)`. Unsubscribe in cleanup to avoid leaks.
- Vite envs: Only variables prefixed with `VITE_` are injected into client builds. Do not attempt to access worker-only secrets from client code.
- Build ordering: `npm run build` runs `tsc -b` first — TypeScript project references matter. If touching tsconfig, ensure `tsc -b` still succeeds.
- Worker static assets: `wrangler.jsonc` points `assets.directory` to `./dist`. The worker returns `env.ASSETS.fetch(request)` for non-API routes.

6) Files to inspect for context when making changes
- `src/supabaseClient.ts` — how the client is created and env var names.
- `src/contexts/InventoryContext.tsx` — canonical DB read + realtime subscription pattern.
- `src/worker.ts` and `wrangler.jsonc` — server-side API and deployment entry.
- `migrations/`, `schema.sql` — database schema and migration history.
- `package.json` — available scripts: `dev`, `build`, `preview`, `lint`.

7) Typical small tasks examples
- Add a new inventory column: update SQL in `migrations/`, update `src/types/inventory.ts`, update any `select` calls and UI components under `src/components/inventory`.
- Add server email field: ensure worker `Env` includes the new variable and document it in `wrangler` config; never surface worker secrets to client.

8) When to ask the human
- Missing environment details (Supabase project, BREVO keys) or deployment access.
- Schema intent: any DB schema changes that might require data migrations.

If anything above is unclear or you'd like specific examples included (test commands, CI hooks, or a sample Wrangler config), tell me which area to expand.
