/* eslint-disable react-refresh/only-export-components */
import React, {
  createContext,
  use,
  useState,
  useEffect,
  useMemo,
  useRef,
} from "react";

import { supabase } from "@/supabaseClient";

import { useErrorHandler } from "@hooks/useErrorHandler";

import type { Session } from "@supabase/supabase-js";

interface AuthContextType {
  session: Session | null;
  userId: string | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Hook to access the current authentication state and session.
 *
 * @returns {AuthContextType} The auth context value.
 * @throws {Error} if used outside of AuthProvider.
 */
export const useAuth = () => {
  const context = use(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

/**
 * Provider component for authentication state.
 * Initializes the Supabase session and listens for auth state changes.
 */
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { handleError } = useErrorHandler();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const prevUserIdRef = useRef<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const initSession = async () => {
      try {
        const {
          data: { session: initialSession },
        } = await supabase.auth.getSession();

        if (!isMounted) return;

        if (initialSession) {
          setSession(initialSession);
          prevUserIdRef.current = initialSession.user.id;
        }
      } catch (err) {
        handleError(err, "Failed to initialize auth session");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    void initSession();

    // Safety net for loading state
    const safetyTimeout = setTimeout(() => {
      if (isMounted && loading) setLoading(false);
    }, 3000);

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      // Only update if session actually changed or we need to handle specific events
      // For now, simpler equality check or just setting it is fine as React generic bail-out applies
      if (isMounted) {
        setSession(newSession);
        // If we went from no user to user, or user changed, we might want to ensure loading is false
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
      clearTimeout(safetyTimeout);
      subscription.unsubscribe();
    };
  }, [handleError, loading]);

  const value = useMemo(
    () => ({
      session,
      userId: session?.user?.id ?? null,
      loading,
    }),
    [session, loading]
  );

  return <AuthContext value={value}>{children}</AuthContext>;
};
