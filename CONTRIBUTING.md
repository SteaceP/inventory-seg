# Contributing to Inventory Management System

First off, thanks for taking the time to contribute! 🎉

The following is a set of guidelines for contributing to this project. These are mostly guidelines, not rules. Use your best judgment, and feel free to propose changes to this document in a pull request.

## Code of Conduct

This project and everyone participating in it is governed by the [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code. Please report unacceptable behavior to the project maintainers.

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v22 or later recommended)
- [pnpm](https://pnpm.io/)
- A [Supabase](https://supabase.com/) project

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/inventory-system.git
   cd inventory-system
   ```

2. **Install dependencies:**
   ```bash
   pnpm install
   ```

3. **Configure Environment:**
   Copy `.env.example` to `.env.local` and fill in your Supabase credentials.
   ```bash
   cp .env.example .env.local
   ```

4. **Run the development server:**
   ```bash
   pnpm run dev
   ```

## Development Workflow

1. **Create a Branch:** Always create a new branch for your work.
   ```bash
   git checkout -b feature/amazing-feature
   ```

2. **Make Changes:** Implement your feature or fix.

3. **Lint and Test:** Ensure your code passes all checks.
   ```bash
   pnpm run lint
   pnpm run test
   ```

4. **Commit:** Use descriptive commit messages following the [Conventional Commits](https://www.conventionalcommits.org/) specification.
   - `feat: add new feature`
   - `fix: resolve bug`
   - `docs: update documentation`
   - `chore: update dependencies`
   
   > [!NOTE]
   > We use `commitlint` to enforce this format. Your commit will be rejected if it doesn't match!

5. **Push:** Push your branch to GitHub.
   ```bash
   git push origin feature/amazing-feature
   ```

6. **Open a Pull Request:** Submit a PR to the `main` branch.

## Coding Conventions

### Tech Stack
- **Framework**: React 19 + Vite
- **Language**: TypeScript (Strict mode)
- **UI**: Material UI (MUI) v7
- **Data**: Supabase (Auth, DB, Realtime)

### Style Guidelines
- **MUI System**: Use the `sx` prop for component styling.
- **Icons**: Use `@mui/icons-material`.
- **Imports**: Organize imports logically (absolute paths preferred where alias is set).
- **Naming**: PascalCase for components, camelCase for functions/variables.

### TypeScript
- **No `any`**: Avoid using `any`. Use `unknown` or proper types.
- **Interfaces**: Define interfaces/types for all props and data structures.

### Testing
- Write tests for new features using Vitest and React Testing Library.
- Ensure existing tests pass before submitting.

## Pull Request Process

1. Update the `README.md` with details of changes to the interface, this includes new environment variables, exposed ports, useful file locations and container parameters.
2. Increase the version numbers in any examples files and the README.md to the new version that this Pull Request would represent. The versioning scheme we use is [SemVer](http://semver.org/).
3. You may merge the Pull Request in once you have the sign-off of two other developers, or if you do not have permission to do that, you may request the second reviewer to merge it for you.

## License

By contributing, you agree that your contributions will be licensed under its **AGPL-3.0-only** license.
