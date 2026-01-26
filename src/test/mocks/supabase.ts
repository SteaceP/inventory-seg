import { vi, type Mock } from "vitest";

/**
 * Centralized Supabase client mocking utilities
 */

export interface MockSupabaseResponse<T> {
  data: T | null;
  error: { message: string } | null;
}

export const createMockSupabaseClient = () => {
  // Auth mocks
  const mockGetUser = vi.fn();
  const mockGetSession = vi.fn();
  const mockSignIn = vi.fn();
  const mockSignOut = vi.fn();
  const mockSignUp = vi.fn();

  // Storage mocks
  const mockUpload = vi.fn();
  const mockGetPublicUrl = vi.fn();
  const mockRemove = vi.fn();

  // Realtime channel mocks
  const mockOn = vi.fn().mockReturnThis();
  const mockSubscribe = vi.fn().mockReturnThis();
  const mockUnsubscribe = vi.fn();
  const mockTrack = vi.fn();
  const mockSend = vi.fn();
  const mockPresenceState = vi.fn().mockReturnValue({});

  const mockChannel = vi.fn(() => ({
    on: mockOn,
    subscribe: mockSubscribe,
    unsubscribe: mockUnsubscribe,
    track: mockTrack,
    send: mockSend,
    presenceState: mockPresenceState,
  }));

  const mockRemoveChannel = vi.fn();

  // Query builder mocks
  const mockEq = vi.fn();
  const mockNeq = vi.fn();
  const mockGt = vi.fn();
  const mockLt = vi.fn();
  const mockIn = vi.fn();
  const mockOrder = vi.fn();
  const mockLimit = vi.fn();
  const mockSingle = vi.fn();
  const mockMaybeSingle = vi.fn();

  // Chainable query methods
  const createChainableMock = (
    finalResolver: Mock = vi.fn().mockResolvedValue({ data: [], error: null })
  ) => {
    const chain = {
      eq: vi.fn().mockReturnValue(chain),
      neq: vi.fn().mockReturnValue(chain),
      gt: vi.fn().mockReturnValue(chain),
      lt: vi.fn().mockReturnValue(chain),
      in: vi.fn().mockReturnValue(chain),
      order: vi.fn().mockReturnValue(chain),
      limit: vi.fn().mockReturnValue(chain),
      single: vi.fn(() => finalResolver()),
      maybeSingle: vi.fn(() => finalResolver()),
      then: (resolve: (value: unknown) => unknown) =>
        finalResolver().then(resolve),
    };
    return chain;
  };

  const mockSelect = vi.fn(() => createChainableMock());
  const mockInsert = vi.fn(() => ({
    select: vi.fn(() => ({
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
    })),
  }));
  const mockUpdate = vi.fn(() => createChainableMock());
  const mockDelete = vi.fn(() => createChainableMock());
  const mockUpsert = vi.fn(() => createChainableMock());

  const mockFrom = vi.fn(() => ({
    select: mockSelect,
    insert: mockInsert,
    update: mockUpdate,
    delete: mockDelete,
    upsert: mockUpsert,
  }));

  const client = {
    auth: {
      getUser: mockGetUser,
      getSession: mockGetSession,
      signInWithPassword: mockSignIn,
      signOut: mockSignOut,
      signUp: mockSignUp,
    },
    storage: {
      from: vi.fn(() => ({
        upload: mockUpload,
        getPublicUrl: mockGetPublicUrl,
        remove: mockRemove,
      })),
    },
    from: mockFrom,
    channel: mockChannel,
    removeChannel: mockRemoveChannel,
  };

  // Helper to set default responses
  const setAuthUser = (user: { id: string; email: string } | null) => {
    mockGetUser.mockResolvedValue({
      data: { user },
      error: null,
    });
  };

  const setAuthSession = (session: { access_token: string } | null) => {
    mockGetSession.mockResolvedValue({
      data: { session },
      error: null,
    });
  };

  const setStorageUploadSuccess = (path = "test-path") => {
    mockUpload.mockResolvedValue({ error: null, data: { path } });
    mockGetPublicUrl.mockReturnValue({
      data: {
        publicUrl: `https://test.supabase.co/storage/v1/object/public/${path}`,
      },
    });
  };

  return {
    client,
    mocks: {
      // Auth
      getUser: mockGetUser,
      getSession: mockGetSession,
      signIn: mockSignIn,
      signOut: mockSignOut,
      signUp: mockSignUp,
      // Storage
      upload: mockUpload,
      getPublicUrl: mockGetPublicUrl,
      remove: mockRemove,
      // Realtime
      channel: mockChannel,
      removeChannel: mockRemoveChannel,
      on: mockOn,
      subscribe: mockSubscribe,
      unsubscribe: mockUnsubscribe,
      track: mockTrack,
      send: mockSend,
      presenceState: mockPresenceState,
      // Query builder
      from: mockFrom,
      select: mockSelect,
      insert: mockInsert,
      update: mockUpdate,
      delete: mockDelete,
      upsert: mockUpsert,
      eq: mockEq,
      order: mockOrder,
      single: mockSingle,
    },
    helpers: {
      setAuthUser,
      setAuthSession,
      setStorageUploadSuccess,
    },
  };
};

export const mockSupabaseClient = createMockSupabaseClient();

/**
 * Pre-configured vi.mock for supabaseClient module
 */
export const setupSupabaseMock = (
  customClient?: ReturnType<typeof createMockSupabaseClient>
) => {
  const client = customClient ?? mockSupabaseClient;

  vi.mock("../../supabaseClient", () => ({
    supabase: client.client,
  }));

  return client;
};
