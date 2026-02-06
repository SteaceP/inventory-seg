# Configuration Generation

## Overview

The repository is designed to be generic and portable. Core configuration files (`package.json`, `wrangler.jsonc`) are NOT directly committed to version control. Instead, they are generated from templates using environment variables.

## Key Files

- **Templates**: `package.template.json`, `wrangler.template.jsonc`
- **Generator**: `scripts/prepare-configs.js`
- **Environmental Input**: `.env.local`, `.dev.vars`, or system environment variables.

## Workflow

### 1. Templating System
Placeholders in templates follow the `${VAR_NAME}` syntax. The generator script replaces these with values from the environment.

- **Required Variables**: If a placeholder cannot be resolved, the generator script will fail and exit with an error. This prevents accidental deployments with missing configuration.
- **Derived Variables**: Some variables are derived automatically. For example, `APP_DOMAIN` is extracted from `APP_URL` to configure Cloudflare worker routes.

### 2. Forbidden Actions
- **DO NOT** edit `package.json` or `wrangler.jsonc` directly. Changes will be overwritten during the next build/dev cycle.
- **DO NOT** commit `package.json` or `wrangler.jsonc` to the repository. They are listed in `.gitignore` and must remain untracked.
- **DO NOT** commit `pnpm-lock.json` to the repository. It is a local artifact of the generated `package.json`.

### 3. Adding New Config Options
1. Add the `${VAR_NAME}` placeholder to the appropriate template file.
2. Ensure the variable is documented in `.env.example`.
3. Add the variable to your local `.env.local` or `.dev.vars`.
4. Run `node scripts/prepare-configs.js` or `pnpm dev` to update the generated files.

## Local Development vs. Production

- **Local (dev)**: The `wrangler.template.jsonc` includes an `env.dev` block that overrides certain variables (like `APP_URL` to `localhost`) for safety.
- **Production (deploy)**: The top-level variables in templates should represent the production state. These are populated from `.dev.vars` or production CI/CD environment variables.

## Secret Management Best Practices

To maintain security and generic portability, follow these rules:

1. **Build-time Variables (GitHub)**: Use these for data required to generate `package.json` and `wrangler.jsonc` (e.g., URLs, Repo Names, Infrastructure IDs). These are injected into the final files.
2. **Runtime Secrets (Cloudflare)**: Use these for sensitive API keys and credentials (e.g., `SUPABASE_SECRET_KEY`, `BREVO_API_KEY`). These should **NEVER** be in templates or generated files.
3. **Local Development**:
   - Use `.env.local` for client-side variables (`VITE_*`).
   - Use `.dev.vars` for server-side secrets during local `wrangler dev` execution.
4. **Validation**: The `prepare-configs.js` script enforces that all placeholders have values. If a new placeholder is added to a template, it must be provided at build time.
