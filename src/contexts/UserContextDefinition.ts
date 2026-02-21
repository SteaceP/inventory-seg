import { createContext, use } from "react";

import type { UserContextType } from "@/types/user";

import type { Session } from "@supabase/supabase-js";

/**
 * Context for user settings, profile, and preferences.
 */
export const UserContext = createContext<
  (UserContextType & { session: Session | null }) | undefined
>(undefined);

/**
 * Hook to access user settings, profile, and preferences.
 *
 * @returns {UserContextType} The user context value.
 * @throws {Error} if used outside of UserProvider.
 */
export const useUserContext = () => {
  const context = use(UserContext);
  if (context === undefined) {
    throw new Error("useUserContext must be used within a UserProvider");
  }
  return context;
};
