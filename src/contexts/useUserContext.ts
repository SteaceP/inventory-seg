import { use } from "react";
import { UserContext } from "./user-context";

export const useUserContext = () => {
  const context = use(UserContext);
  if (context === undefined) {
    throw new Error("useUserContext must be used within a UserProvider");
  }
  return context;
};
