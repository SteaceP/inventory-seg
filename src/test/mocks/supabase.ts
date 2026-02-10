/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { vi, type Mock } from "vitest";

/**
 * Centralized Supabase client mocking utilities
 * Note: Type safety is intentionally relaxed here to create flexible mocks
 */

export const createMockSupabaseClient = () => {
  // Auth mocks
  const mockGetUser = vi.fn();
  const mockGetSession = vi.fn();
  const mockSignIn = vi.fn();
  const mockSignOut = vi.fn();

  const mockSignUp = vi.fn();
  const mockOnAuthStateChange = vi.fn().mockReturnValue({
    data: { subscription: { unsubscribe: vi.fn() } },
  });

  const mockVerify = vi.fn();
  const mockGetAuthenticatorAssuranceLevel = vi.fn();
  const mockListFactors = vi.fn();
  const mockChallenge = vi.fn();

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

  // Query builder mocks (only keeping the ones we actually return)
  const mockEq = vi.fn();
  const mockOrder = vi.fn();
  const mockLimit = vi.fn();
  const mockSingle = vi.fn();

  // Chainable query methods
  const createChainableMock = (
    finalResolver: Mock = vi.fn().mockResolvedValue({ data: [], error: null })
  ): any => {
    // Declare chain first to avoid circular reference errors
    const chain: any = {};

    // Now assign properties that reference chain
    chain.eq = vi.fn((...args) => {
      mockEq(...args);
      return chain;
    });
    chain.neq = vi.fn().mockReturnValue(chain); // Add mockNeq if needed later
    chain.gt = vi.fn().mockReturnValue(chain);
    chain.lt = vi.fn().mockReturnValue(chain);
    chain.in = vi.fn().mockReturnValue(chain);
    chain.order = vi.fn((...args) => {
      mockOrder(...args);
      return chain;
    });
    chain.limit = vi.fn((...args) => {
      mockLimit(...args);
      return chain;
    });
    chain.single = vi.fn((...args) => {
      mockSingle(...args);
      return finalResolver();
    });
    chain.maybeSingle = vi.fn(() => finalResolver());
    chain.then = (resolve: (value: unknown) => unknown) =>
      finalResolver().then(resolve);

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
  })) as unknown as Mock<(table: string) => any>;

  const client = {
    auth: {
      getUser: mockGetUser,
      getSession: mockGetSession,
      signInWithPassword: mockSignIn,
      signOut: mockSignOut,
      signUp: mockSignUp,
      onAuthStateChange: mockOnAuthStateChange,
      mfa: {
        verify: mockVerify,
        getAuthenticatorAssuranceLevel: mockGetAuthenticatorAssuranceLevel,
        listFactors: mockListFactors,
        challenge: mockChallenge,
      },
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
    realtime: {
      setAuth: vi.fn(),
      connect: vi.fn(),
      disconnect: vi.fn(),
    },
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
      signInWithPassword: mockSignIn,
      signOut: mockSignOut,
      signUp: mockSignUp,
      onAuthStateChange: mockOnAuthStateChange,
      // MFA
      getAuthenticatorAssuranceLevel: mockGetAuthenticatorAssuranceLevel,
      listFactors: mockListFactors,
      challenge: mockChallenge,
      verify: mockVerify,
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
      limit: mockLimit,
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

  // Use alias for consistency
  vi.doMock("@supabaseClient", () => ({
    supabase: client.client,
  }));

  return client;
};
