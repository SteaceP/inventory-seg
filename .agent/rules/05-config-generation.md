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

## Environment Management (4-File System)

To simplify management, we use exactly 4 environment files:

1.  **`.env.example`**: The blueprint/template. Tracked in Git.
2.  **`.env.local`**: Everything for local development (Vite + local Worker). Ignored.
3.  **`.act.env`**: Local simulation of CI/CD for GitHub Actions and `act`. Ignored.
4.  **`.prod.vars`**: Production-only infrastructure IDs and secrets. Ignored.

### Loading Priority (prepare-configs.js)
The generator script loads variables in this order (last wins):
1.  `.env.example` (Blueprint)
2.  `.env.local` (Development)
3.  `.act.env` (Only if `process.env.CI` or `process.env.ACT` is true)
4.  `.prod.vars` (Production)
5.  `process.env` (System overrides/GitHub Secrets)

### Secret Management
- **Local Dev**: Use `.env.local`.
- **Local CI Testing**: Use `.act.env`.
- **Production Infrastructure**: Use `.prod.vars` for IDs and secrets not handled by Cloudflare UI.
- **GitHub Actions**: Use Repository Secrets; they are picked up via `process.env` by the generator script.
