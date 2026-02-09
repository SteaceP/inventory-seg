---
trigger: always_on
---

# Git Conventions

## Commit Messages

This project follows the **Conventional Commits** specification.

> [!IMPORTANT]
> **CRITICAL COMMIT RULES**:
> 1. **NO TERMINATING DOT**: Never end the subject with a period/dot.
> 2. **LOWERCASE SUBJECT**: The subject must start with a lowercase letter and must NOT be sentence-case or PascalCase.
> 3. **MAX 125 CHARS**: Stay under the length limit.

### Format
`<type>(<scope>): <subject>`

- **Types**: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`.
- **Scope**: Optional, provides additional contextual information (e.g., `deps`, `worker`, `ui`).
- **Subject**:
  - Use imperative, present tense ("add" not "added", "change" not "changed").
  - **MANDATORY**: Start with a lowercase letter.
  - **MANDATORY**: MUST NOT end with a period, dot, or any punctuation `.`.
  - **Max Length**: 125 characters for the header (standard is 100, but bumped for this project in `commitlint.config.js`).

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
