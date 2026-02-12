import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";
import { usersApi } from "@/services/api/users";
import type { UserMe } from "@/services/api/types";
import { useAuth } from "./AuthContext";

interface CurrentUserContextType {
  profile: UserMe | null;
  isLoading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

const CurrentUserContext = createContext<CurrentUserContextType | undefined>(
  undefined
);

export function CurrentUserProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [profile, setProfile] = useState<UserMe | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await usersApi.getMe();
      setProfile(response.data);
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("Failed to fetch profile")
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      refresh();
    } else {
      setProfile(null);
    }
  }, [isAuthenticated, refresh]);

  return (
    <CurrentUserContext.Provider value={{ profile, isLoading, error, refresh }}>
      {children}
    </CurrentUserContext.Provider>
  );
}

export function useCurrentUserContext(): CurrentUserContextType {
  const context = useContext(CurrentUserContext);
  if (context === undefined) {
    throw new Error(
      "useCurrentUserContext must be used within a CurrentUserProvider"
    );
  }
  return context;
}
