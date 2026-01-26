# Centralized Test Mocks - Usage Examples

This document shows how to use the centralized test mocks in your test files.

## Basic Import

```typescript
import { createMockInventoryItem, createMockCategory, mockUserContext } from '../../test/mocks';
```

## Example 1: Using Test Data Factories

**Before:** (Repetitive setup in every test)

```typescript
const mockItem = {
  id: "1",
  name: "Test Item",
  category: "General",
  sku: "SKU-1",
  stock: 10,
  unit_cost: 0,
  image_url: "",
  low_stock_threshold: null,
  notes: "",
  location: null,
  created_at: new Date().toISOString(),
};
```

**After:** (Using factory)

```typescript
const mockItem = createMockInventoryItem({
  name: "Test Item",
  stock: 10,
});
```

## Example 2: Using Context Mocks

**Before:** (Manual mock setup)

```typescript
const mockShowError = vi.fn();
vi.mock("../../contexts/AlertContext", () => ({
  useAlert: () => ({ showError: mockShowError }),
}));
```

**After:** (Using centralized mock)

```typescript
import { createMockAlertContext } from '../../test/mocks';

const mockAlert = createMockAlertContext();

vi.mock("../../contexts/AlertContext", () => ({
  useAlert: () => mockAlert,
}));

// Can verify calls later
expect(mockAlert.showError).toHaveBeenCalled();
```

## Example 3: Using Supabase Mock

**Before:** (Complex chainable mocks, 30+ lines)

```typescript
const mockSelect = vi.fn().mockReturnValue({
  eq: vi.fn().mockResolvedValue({ data: [], error: null }),
});
const mockFrom = vi.fn(() => ({ select: mockSelect }));
// ... many more lines
```

**After:** (Centralized, configurable)

```typescript
import { createMockSupabaseClient } from '../../test/mocks';

const supabaseMock = createMockSupabaseClient();

// Set responses
supabaseMock.helpers.setAuthUser({ id: "user-1", email: "test@test.com" });
supabaseMock.helpers.setAuthSession({ access_token: "token" });

vi.mock("../../supabaseClient", () => ({
  supabase: supabaseMock.client,
}));
```

## Benefits

✅ **Shorter test files**: 20-40% reduction in code  
✅ **Consistent mocks**: Same structure everywhere  
✅ **Easy to update**: Change once, applies everywhere  
✅ **Type-safe**: Full TypeScript support  
✅ **Less duplication**: Thousands of lines eliminated
