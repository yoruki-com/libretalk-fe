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
    const code = err?.code ?? "";
    const message = err?.message ?? "";

    return (
      code === "oidc.invalid_grant" ||
      code === "oidc.invalid_target" ||
      message.includes("Grant request is invalid") ||
      message.includes("Invalid resource indicator")
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
        } else {
          console.error("[AuthContext] Error initializing session:", error);
        }
      } finally {
        setIsLoading(false);
      }
    };

    initSession();
  }, [isInitialized, isAuthenticated, getAccessToken, fetchUserInfo]);

  const getToken = useCallback(async (): Promise<string | null> => {
    try {
      const token = await getAccessToken(LOGTO_RESOURCE);
      setAccessToken(token);
      return token;
    } catch (error) {
      if (isRecoverableSessionError(error)) {
        console.warn("[AuthContext] Invalid session while getting token — clearing local session");
        await clearBrokenSession();
      } else {
        console.error("[AuthContext] Error getting token:", error);
      }
      return null;
    }
  }, [getAccessToken, clearBrokenSession, isRecoverableSessionError]);

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
      if (
        err.message?.includes("user_cancelled") ||
        err.message?.includes("cancelled") ||
        err.message?.includes("dismissed")
      ) {
        console.log("Sign-In cancelled by user");
        return;
      }
      console.error("Sign-In error:", error);
      throw error;
    }
  }, [performInteractiveSignIn]);

  // Google Sign-In via Logto universal login
  // Google connector configured server-side in Logto Console
  const signInWithGoogle = useCallback(async () => {
    try {
      await performInteractiveSignIn();
    } catch (error: unknown) {
      const err = error as { message?: string };
      if (
        err.message?.includes("user_cancelled") ||
        err.message?.includes("cancelled") ||
        err.message?.includes("dismissed")
      ) {
        console.log("Google Sign-In cancelled by user");
        return;
      }
      console.error("Google Sign-In error:", error);
      throw error;
    }
  }, [performInteractiveSignIn]);

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
    <LogtoProvider
      config={{
        endpoint: LOGTO_ENDPOINT,
        appId: LOGTO_APP_ID,
        resources: LOGTO_RESOURCE ? [LOGTO_RESOURCE] : undefined,
      }}
    >
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
