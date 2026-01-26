import { vi } from "vitest";

/**
 * Centralized React Router mocking utilities
 */

export const createMockNavigate = () => vi.fn();
export const createMockLocation = (overrides?: {
  pathname?: string;
  search?: string;
  hash?: string;
  state?: unknown;
}) => ({
  pathname: overrides?.pathname ?? "/",
  search: overrides?.search ?? "",
  hash: overrides?.hash ?? "",
  state: overrides?.state ?? null,
  key: "default",
});

export const createMockParams = (params: Record<string, string> = {}) => params;

export const createMockSearchParams = (params: Record<string, string> = {}) => {
  const searchParams = new URLSearchParams(params);
  const setSearchParams = vi.fn();
  return [searchParams, setSearchParams] as const;
};

export const createMockRouterContext = () => {
  const navigate = createMockNavigate();
  const location = createMockLocation();
  const params = createMockParams();
  const [searchParams, setSearchParams] = createMockSearchParams();

  return {
    navigate,
    location,
    params,
    searchParams,
    setSearchParams,
  };
};

/**
 * Pre-configured vi.mock for react-router-dom
 * Use this in test files that need router mocking
 */
export const setupRouterMock = (customMocks?: {
  navigate?: ReturnType<typeof vi.fn>;
  location?: ReturnType<typeof createMockLocation>;
  params?: Record<string, string>;
}) => {
  const navigate = customMocks?.navigate ?? createMockNavigate();
  const location = customMocks?.location ?? createMockLocation();
  const params = customMocks?.params ?? {};

  vi.mock("react-router-dom", async () => {
    const actual = await vi.importActual("react-router-dom");
    return {
      ...actual,
      useNavigate: () => navigate,
      useLocation: () => location,
      useParams: () => params,
      useSearchParams: () => createMockSearchParams(),
      Link: ({ children, to, onClick }: { children: React.ReactNode; to: string; onClick?: () => void }) => (
        // eslint-disable-next-line jsx-a11y/anchor-is-valid
        <a href={to} onClick={onClick}>{children}</a>
      ),
    };
  });

  return { navigate, location, params };
};
