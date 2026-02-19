import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  type ReactNode,
} from "react";
import { LogtoProvider, Prompt, useLogto } from "@logto/rn";
import {
  setTokenGetter,
  clearTokenGetter,
} from "@/services/api/client";
import { resetCurrentUserCache } from "@/hooks/useCurrentUser";

const LOGTO_ENDPOINT = process.env.EXPO_PUBLIC_LOGTO_ENDPOINT!;
const LOGTO_APP_ID = process.env.EXPO_PUBLIC_LOGTO_APP_ID!;
const LOGTO_RESOURCE = process.env.EXPO_PUBLIC_LOGTO_RESOURCE;
const REDIRECT_URI = "libretalk://callback";

// Stable config object — created once at module level to avoid
// re-creating LogtoClient on every AuthProvider render.
const LOGTO_CONFIG = {
  endpoint: LOGTO_ENDPOINT,
  appId: LOGTO_APP_ID,
  resources: LOGTO_RESOURCE ? [LOGTO_RESOURCE] : undefined,
};

export interface User {
  id: string;
  email?: string;
  name?: string;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  accessToken: string | null;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: () => Promise<void>;
  signOut: () => Promise<void>;
  getToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function AuthContextProvider({ children }: { children: ReactNode }) {
  const {
    client,
    signIn,
    signOut: logtoSignOut,
    getAccessToken,
    isAuthenticated,
    isInitialized,
    fetchUserInfo,
  } = useLogto();

  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const isRecoveringSessionRef = useRef(false);

  const isRecoverableSessionError = useCallback((error: unknown) => {
    const err = error as { code?: string; message?: string };
    const code = (err?.code ?? "").toLowerCase();
    const message = (err?.message ?? "").toLowerCase();

    return (
      code === "oidc.invalid_grant" ||
      code === "oidc.invalid_target" ||
      message.includes("grant request is invalid") ||
      message.includes("invalid resource indicator")
    );
  }, []);

  const isNotAuthenticatedError = useCallback((error: unknown) => {
    const err = error as { code?: string; message?: string };
    const code = (err?.code ?? "").toLowerCase();
    const message = (err?.message ?? "").toLowerCase();
    const serialized = String(error).toLowerCase();

    return (
      code.includes("not_authenticated") ||
      code.includes("notauthenticated") ||
      message.includes("not authenticated") ||
      serialized.includes("not authenticated")
    );
  }, []);

  const clearBrokenSession = useCallback(async () => {
    if (isRecoveringSessionRef.current) return;
    isRecoveringSessionRef.current = true;

    try {
      // Clear local tokens without opening browser sign-out flow.
      await client.clearAllTokens();
    } catch {
      // Ignore clear failures and keep resetting local state.
    } finally {
      setUser(null);
      setAccessToken(null);
      resetCurrentUserCache();
      isRecoveringSessionRef.current = false;
    }
  }, [client]);

  // Check for existing session on mount / when auth state changes
  useEffect(() => {
    if (!isInitialized) return;

    const initSession = async () => {
      try {
        if (isAuthenticated) {
          const token = await getAccessToken(LOGTO_RESOURCE);
          setAccessToken(token);

          const userInfo = await fetchUserInfo();
          setUser({
            id: userInfo.sub,
            email: userInfo.email ?? undefined,
            name: userInfo.name ?? undefined,
            avatar: userInfo.picture ?? undefined,
          });
        }
      } catch (error: unknown) {
        if (isRecoverableSessionError(error)) {
          console.warn("[AuthContext] Invalid session/resource — clearing local session");
          await clearBrokenSession();
        } else if (isNotAuthenticatedError(error)) {
          // Session appears authenticated from cached ID token but access token refresh failed.
          console.warn("[AuthContext] Session not authenticated — clearing local session");
          await clearBrokenSession();
        } else {
          console.error("[AuthContext] Error initializing session:", error);
        }
      } finally {
        setIsLoading(false);
      }
    };

    initSession();
  }, [
    isInitialized,
    isAuthenticated,
    getAccessToken,
    fetchUserInfo,
    isRecoverableSessionError,
    isNotAuthenticatedError,
    clearBrokenSession,
  ]);

  const getToken = useCallback(async (): Promise<string | null> => {
    if (!isInitialized || !isAuthenticated) {
      return null;
    }

    try {
      const token = await getAccessToken(LOGTO_RESOURCE);
      setAccessToken(token);
      return token;
    } catch (error) {
      if (isRecoverableSessionError(error)) {
        console.warn("[AuthContext] Invalid session while getting token — clearing local session");
        await clearBrokenSession();
      } else if (isNotAuthenticatedError(error)) {
        // Expected during startup/logout races: caller can proceed without auth header.
        return null;
      } else {
        console.error("[AuthContext] Error getting token:", error);
      }
      return null;
    }
  }, [
    isInitialized,
    isAuthenticated,
    getAccessToken,
    clearBrokenSession,
    isRecoverableSessionError,
    isNotAuthenticatedError,
  ]);

  // Register token getter with API client
  useEffect(() => {
    setTokenGetter(getToken);
    return () => clearTokenGetter();
  }, [getToken]);

  // Email Sign-In via Logto universal login (browser redirect)
  const performInteractiveSignIn = useCallback(async () => {
    await signIn({
      redirectUri: REDIRECT_URI,
      // Force credential entry to avoid sticky SSO sessions reusing last account.
      prompt: Prompt.Login,
    });
  }, [signIn]);

  // Email Sign-In via Logto universal login (browser redirect)
  const signInWithEmail = useCallback(async () => {
    try {
      await performInteractiveSignIn();
    } catch (error: unknown) {
      const err = error as { message?: string };
      const message = err.message ?? String(error);
      if (
        message.includes("user_cancelled") ||
        message.includes("cancelled") ||
        message.includes("dismissed")
      ) {
        console.log("Sign-In cancelled by user");
        return;
      }
      // Avoid redbox in development for expected auth flow failures.
      console.warn("Sign-In error:", message);
      await clearBrokenSession();
      throw error;
    }
  }, [performInteractiveSignIn, clearBrokenSession]);

  // Google Sign-In via Logto universal login
  // Google connector configured server-side in Logto Console
  const signInWithGoogle = useCallback(async () => {
    try {
      await performInteractiveSignIn();
    } catch (error: unknown) {
      const err = error as { message?: string };
      const message = err.message ?? String(error);
      if (
        message.includes("user_cancelled") ||
        message.includes("cancelled") ||
        message.includes("dismissed")
      ) {
        console.log("Google Sign-In cancelled by user");
        return;
      }

      // Logto SDK may throw SyntaxError (JSON Parse) for non-JSON provider responses.
      // Treat it as an auth failure and keep UI responsive.
      console.warn("Google Sign-In error:", message);
      await clearBrokenSession();
      throw error;
    }
  }, [performInteractiveSignIn, clearBrokenSession]);

  const signOut = useCallback(async () => {
    try {
      await logtoSignOut(REDIRECT_URI);
    } catch (error) {
      console.error("Sign out error:", error);
    } finally {
      // Ensure SDK persistent storage is cleared even when sign-out request fails.
      await client.clearAllTokens().catch(() => {});
      // Always reset local state and cache, even on error
      setUser(null);
      setAccessToken(null);
      resetCurrentUserCache();
    }
  }, [logtoSignOut, client]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading: !isInitialized || isLoading,
        accessToken,
        signInWithGoogle,
        signInWithEmail,
        signOut,
        getToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function AuthProvider({ children }: { children: ReactNode }) {
  return (
    <LogtoProvider config={LOGTO_CONFIG}>
      <AuthContextProvider>{children}</AuthContextProvider>
    </LogtoProvider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
