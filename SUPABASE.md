# Supabase Local Development Guide

This project uses the Supabase CLI to manage local development, database migrations, and TypeScript type generation.

## Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) or Docker Engine must be installed and running.

## Initial Setup

Before starting for the first time, you need to link your local environment to the remote Supabase project:

```bash
supabase link --project-ref <your-project-id>
```

> [!NOTE]
> You can find your Project ID in the [Supabase Dashboard](https://supabase.com/dashboard) under **Settings > General**.

## Common Commands

| Command | Script | Description |
| :--- | :--- | :--- |
| `npm run supabase:start` | `supabase start` | Starts all local Supabase services via Docker. |
| `npm run supabase:stop` | `supabase stop` | Stops all local Supabase services. |
| `npm run supabase:gen-types` | `supabase gen types...` | Generates TypeScript types for your database schema. |
| `supabase db diff` | - | Generates a new migration file based on local changes. |
| `supabase db reset` | - | Resets the local database to the current migration state. |

## Workflow: Updating types

After making changes to your database schema (e.g., via migrations), you should regenerate the TypeScript types:

1. Ensure Supabase is running: `npm run supabase:start`
2. Run type generation: `npm run supabase:gen-types`
3. The types will be updated in `src/types/database.types.ts`.
