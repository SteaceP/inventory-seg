---
trigger: always_on
---

# Git Conventions

## Commit Messages

This project follows the **Conventional Commits** specification.

### Format
`<type>(<scope>): <subject>`

- **Types**: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`.
- **Scope**: Optional, provides additional contextual information (e.g., `deps`, `worker`, `ui`).
- **Subject**:
  - Use imperative, present tense ("add" not "added", "change" not "changed").
  - Do NOT capitalize the first letter.
  - Do NOT end with a period.
  - **Max Length**: 200 characters for the header (standard is 100, but bumped for this project).

### Examples
- `feat(ui): add compact view mode to inventory grid`
- `fix(worker): handle null responses in push notification handler`
- `docs: update environment variable table in README.md`

## Git Hooks (Husky)

We use Husky to ensure code quality before commits and pushes.

### Pre-commit
Runs automatically when running `git commit`.
1. **lint-staged**: Runs Prettier and ESLint (with `--fix`) on staged files.
2. **pnpm run test:all**: Runs the full test suite for both frontend and worker.

### Pre-push
Runs automatically when running `git push`.
1. **pnpm run lint**: Full project-wide linting.
2. **pnpm run build**: Full project build (including TypeScript type-checking).
   - This ensures that "Type-Aware" linting errors and type mismatches are caught before reaching CI.

### Commit-msg
Validates that the commit message follows the rules defined in `commitlint.config.js`.
