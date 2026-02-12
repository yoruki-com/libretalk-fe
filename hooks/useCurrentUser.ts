import { useCurrentUserContext } from "@/contexts/CurrentUserContext";
import type { UserMe } from "@/services/api/types";

interface UseCurrentUserResult {
  profile: UserMe | null;
  isLoading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

export function useCurrentUser(_enabled?: boolean): UseCurrentUserResult {
  return useCurrentUserContext();
}
