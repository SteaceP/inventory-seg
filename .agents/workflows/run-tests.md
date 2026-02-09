---
description: How to run tests with Vitest
---

# Running Tests

This project uses Vitest for testing both frontend (React) and worker (Cloudflare) code.

## Quick Start

### Run All Tests

```bash
// turbo
pnpm run test:all
```

### Watch Mode (Frontend)

```bash
pnpm test
```


## Frontend Tests

Frontend tests cover React components, hooks, contexts, and utilities.

### Run Frontend Tests Once

```bash
// turbo
pnpm run test:run
```

### Run Frontend Tests in Watch Mode

```bash
pnpm test
```

### Run with Coverage

```bash
pnpm run test:coverage
```

Coverage reports are generated in the `coverage/` directory.

## Worker Tests

Worker tests run in a Cloudflare Workers environment using `@cloudflare/vitest-pool-workers`.

### Run Worker Tests Once

```bash
// turbo
pnpm run test:worker:run
```

### Run Worker Tests in Watch Mode

```bash
pnpm run test:worker
```


## Test File Patterns

- **Frontend**: `src/**/*.{test,spec}.{ts,tsx}` (excluding `src/worker/`)
- **Worker**: `src/worker/**/*.{test,spec}.{ts,tsx}`

## Writing Tests

### File Naming

- Component tests: `ComponentName.test.tsx`
- Hook tests: `useHookName.test.tsx`
- Utility tests: `utilityName.test.ts`
- Worker tests: `workerFile.test.ts`

### Example Test Structure

```typescript
import { describe, it, expect } from 'vitest';

describe('MyFunction', () => {
  it('should do something', () => {
    const result = myFunction('input');
    expect(result).toBe('expected');
  });
});
```

### React Component Testing

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import MyComponent from './MyComponent';

describe('MyComponent', () => {
  it('should render correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });
});
```

### Hook Testing

```tsx
import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useMyHook } from './useMyHook';

describe('useMyHook', () => {
  it('should return correct value', () => {
    const { result } = renderHook(() => useMyHook());
    expect(result.current).toBe('expected');
  });
});
```

## Mocking

### Mock External Modules

```typescript
import { vi } from 'vitest';

vi.mock('../utils/errorReporting', () => ({
  reportError: vi.fn(),
}));
```

### Mock Supabase

```typescript
vi.mock('../supabaseClient', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(),
      insert: vi.fn(),
      update: vi.fn(),
    })),
  },
}));
```

## CI/CD Integration

Tests should run before deployment:

```bash
pnpm run test:all && pnpm run build
```

The `test:all` script runs both frontend and worker tests sequentially.

## Troubleshooting

### Tests Run Slower Than Expected

- Use `test:run` instead of watch mode for CI
- Ensure coverage is only generated when needed

### Worker Tests Fail

- Ensure `wrangler.jsonc` exists
- Check that worker bindings are correctly configured
- Verify `.dev.vars` file exists with required environment variables

### Module Resolution Issues

- Check `tsconfig.test.json` includes test files
- Verify imports use correct paths
- Ensure `vitest/globals` is in types array

## Best Practices

1. **Write Tests First** - Use TDD when possible
2. **Test Behavior, Not Implementation** - Focus on user-facing behavior
3. **Keep Tests Focused** - One assertion per test ideally
4. **Use Descriptive Names** - Test names should explain what they verify
5. **Mock External Dependencies** - Keep tests fast and isolated
6. **Maintain Test Coverage** - Aim for 80%+ coverage on critical paths
