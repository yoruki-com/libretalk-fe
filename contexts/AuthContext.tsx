import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  type ReactNode,
} from "react";
import { LogtoProvider, useLogto } from "@logto/rn";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import {
  setTokenGetter,
  clearTokenGetter,
  setAuthClaims,
  clearAuthClaims,
} from "@/services/api/client";
import { resetCurrentUserCache } from "@/hooks/useCurrentUser";

const LOGTO_ENDPOINT = process.env.EXPO_PUBLIC_LOGTO_ENDPOINT!;
const LOGTO_APP_ID = process.env.EXPO_PUBLIC_LOGTO_APP_ID!;
const LOGTO_RESOURCE = process.env.EXPO_PUBLIC_LOGTO_RESOURCE;
const REDIRECT_URI = "libretalk://callback";
const ENABLE_AUTH_DIAGNOSTICS = false;

// Stable config object — created once at module level to avoid
// re-creating LogtoClient on every AuthProvider render.
// The SDK's `normalizeLogtoConfig` auto-adds openid, offline_access, profile.
// We must explicitly request "email" for the userinfo endpoint to return it.
const LOGTO_CONFIG = {
  endpoint: LOGTO_ENDPOINT,
  appId: LOGTO_APP_ID,
  resources: LOGTO_RESOURCE ? [LOGTO_RESOURCE] : undefined,
  scopes: ["email"],
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
  hasAccessToken: boolean;
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
  const hasValidAccessToken = isAuthenticated && !!accessToken;

  // ── Refs for latest SDK values ──────────────────────────
  // Avoids stale closures: getToken always reads the latest values.
  const getAccessTokenRef = useRef(getAccessToken);
  const isAuthenticatedRef = useRef(isAuthenticated);
  const isInitializedRef = useRef(isInitialized);
  const fetchUserInfoRef = useRef(fetchUserInfo);
  const clientRef = useRef(client);

  useEffect(() => {
    getAccessTokenRef.current = getAccessToken;
    isAuthenticatedRef.current = isAuthenticated;
    isInitializedRef.current = isInitialized;
    fetchUserInfoRef.current = fetchUserInfo;
    clientRef.current = client;
  });

  // ── Error helpers ───────────────────────────────────────

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
      await clientRef.current.clearAllTokens();
    } catch {
      // Ignore clear failures and keep resetting local state.
    } finally {
      setUser(null);
      setAccessToken(null);
      resetCurrentUserCache();
      isRecoveringSessionRef.current = false;
    }
  }, []);

  // ── Storage diagnostics (temporary) ─────────────────────
  const runStorageDiagnostics = useCallback(async () => {
    const c = clientRef.current;
    const storageKey = `logto.${LOGTO_APP_ID}.idToken`;
    console.log("[AuthContext] === STORAGE DIAGNOSTICS ===");

    // 1. Check client-level methods
    try {
      const idToken = await c.getIdToken();
      console.log("[diag] client.getIdToken():",
        idToken ? `OK (${idToken.length} chars)` : "NULL");
    } catch (e) {
      console.error("[diag] client.getIdToken() ERROR:", e);
    }

    try {
      const refreshToken = await c.getRefreshToken();
      console.log("[diag] client.getRefreshToken():",
        refreshToken ? `OK (${refreshToken.length} chars)` : "NULL");
    } catch (e) {
      console.error("[diag] client.getRefreshToken() ERROR:", e);
    }

    try {
      const isAuth = await c.isAuthenticated();
      console.log("[diag] client.isAuthenticated():", isAuth);
    } catch (e) {
      console.error("[diag] client.isAuthenticated() ERROR:", e);
    }

    // 2. Check raw storage layers
    try {
      const encrypted = await AsyncStorage.getItem(storageKey);
      console.log("[diag] AsyncStorage raw idToken:",
        encrypted ? `OK (${encrypted.length} chars)` : "NULL");
    } catch (e) {
      console.error("[diag] AsyncStorage read ERROR:", e);
    }

    try {
      const encKey = await SecureStore.getItemAsync(storageKey);
      console.log("[diag] SecureStore encryption key:",
        encKey ? `OK (${encKey.length} chars)` : "NULL");
    } catch (e) {
      console.error("[diag] SecureStore read ERROR:", e);
    }

    // 3. Try getAccessToken WITHOUT resource (uses cached token from sign-in)
    try {
      const defaultToken = await c.getAccessToken();
      console.log("[diag] getAccessToken() [no resource]:",
        defaultToken ? `OK (${defaultToken.length} chars)` : "NULL");
    } catch (e) {
      console.error("[diag] getAccessToken() [no resource] ERROR:", e);
    }

    console.log("[AuthContext] === END DIAGNOSTICS ===");
  }, []);

  // ── Session initialisation ──────────────────────────────
  useEffect(() => {
    if (!isInitialized) return;

    const tryGetAccessToken = async (
      maxAttempts = 5,
      initialDelayMs = 500,
    ): Promise<string | null> => {
      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
          return await getAccessTokenRef.current(LOGTO_RESOURCE);
        } catch (error: unknown) {
          const notAuth = isNotAuthenticatedError(error);
          // On "not_authenticated", the SDK storage may not be ready yet
          // (SecureStore + AsyncStorage race on Android). Retry with
          // exponential backoff: 500 → 1000 → 2000 → 4000 ms.
          if (notAuth && attempt < maxAttempts) {
            const delay = initialDelayMs * Math.pow(2, attempt - 1);
            console.warn(
              `[AuthContext] getAccessToken attempt ${attempt}/${maxAttempts} failed (not authenticated), retrying in ${delay}ms…`,
            );
            await new Promise((r) => setTimeout(r, delay));
            continue;
          }
          throw error;
        }
      }
      return null;
    };

    const initSession = async () => {
      // Reset loading state when re-entering after sign-in
      setIsLoading(true);

      try {
        if (isAuthenticated) {
          // ── Always-on diagnostics for token issues ──
          const c = clientRef.current;
          try {
            const idToken = await c.getIdToken();
            const refreshToken = await c.getRefreshToken();
            console.log("[AuthContext] idToken:", idToken ? `OK (${idToken.length} chars)` : "MISSING");
            console.log("[AuthContext] refreshToken:", refreshToken ? `OK (${refreshToken.length} chars)` : "MISSING");
            console.log("[AuthContext] LOGTO_RESOURCE:", LOGTO_RESOURCE ?? "NOT SET");
          } catch (diagErr) {
            console.error("[AuthContext] token diagnostics error:", diagErr);
          }

          if (ENABLE_AUTH_DIAGNOSTICS) {
            await runStorageDiagnostics();
          }

          // Try getting an access token for the API resource
          let token: string | null = null;
          try {
            token = await tryGetAccessToken();
          } catch (resourceErr) {
            // If resource-scoped token fails, test without resource to isolate the cause
            console.error("[AuthContext] getAccessToken(resource) FAILED:", resourceErr);
            try {
              const fallback = await c.getAccessToken();
              console.log("[AuthContext] getAccessToken() WITHOUT resource:",
                fallback ? `OK (${fallback.length} chars) — issue is RESOURCE config` : "also MISSING");
            } catch (fallbackErr) {
              console.error("[AuthContext] getAccessToken() WITHOUT resource also FAILED:", fallbackErr);
            }
            throw resourceErr;
          }

          console.log("[AuthContext] initSession: got token",
            token ? `(${token.length} chars)` : "(null)");

          // Fetch user info from Logto BEFORE setting the access token.
          // setAccessToken triggers useCurrentUser → getMe, so the auth
          // claims headers must already be set by then.
          const userInfo = await fetchUserInfoRef.current();
          setAuthClaims({
            email: userInfo.email ?? undefined,
            name: userInfo.name ?? undefined,
          });
          setUser({
            id: userInfo.sub,
            email: userInfo.email ?? undefined,
            name: userInfo.name ?? undefined,
            avatar: userInfo.picture ?? undefined,
          });

          // NOW set the token — this makes hasAccessToken=true and
          // triggers the rest of the app (useCurrentUser, etc.)
          setAccessToken(token);
        }
      } catch (error: unknown) {
        if (isRecoverableSessionError(error)) {
          console.warn("[AuthContext] Invalid session/resource — clearing local session");
          await clearBrokenSession();
        } else if (isNotAuthenticatedError(error)) {
          // This can be transient right after callback on Android storage.
          // Avoid clearing session here to prevent login redirect loops.
          console.warn("[AuthContext] Session not authenticated after retries");
        } else {
          // Keep this as an error only for unexpected failures.
          console.error("[AuthContext] initSession error:", error);
        }
      } finally {
        setIsLoading(false);
      }
    };

    initSession();
    // Only re-run when the actual auth state changes.
    // SDK functions are accessed via refs so they don't need to be deps.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isInitialized, isAuthenticated]);

  // ── Token getter (stable — never recreated) ─────────────
  const getToken = useCallback(async (): Promise<string | null> => {
    if (!isInitializedRef.current || !isAuthenticatedRef.current) {
      return null;
    }

    // Retry once on "not authenticated" — storage may be settling.
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const token = await getAccessTokenRef.current(LOGTO_RESOURCE);
        setAccessToken(token);
        return token;
      } catch (error) {
        if (isNotAuthenticatedError(error) && attempt < 2) {
          await new Promise((r) => setTimeout(r, 300));
          continue;
        }
        if (isRecoverableSessionError(error)) {
          console.warn("[AuthContext] getToken: session error — clearing", error);
          await clearBrokenSession();
        } else if (isNotAuthenticatedError(error)) {
          console.warn("[AuthContext] getToken: session not ready, returning null");
        } else {
          console.error("[AuthContext] getToken: unexpected error", error);
        }
        return null;
      }
    }
    return null;
  }, [isRecoverableSessionError, isNotAuthenticatedError, clearBrokenSession]);

  // Register token getter with API client — runs once (getToken is stable)
  useEffect(() => {
    setTokenGetter(getToken);
    return () => clearTokenGetter();
  }, [getToken]);

  // ── Sign-In ─────────────────────────────────────────────

  const performInteractiveSignIn = useCallback(async () => {
    // NOTE: Do NOT pass `prompt: Prompt.Login` — Logto explicitly skips
    // refresh-token issuance for `prompt=login`. The SDK default
    // (`Prompt.Consent`) correctly requests consent + offline_access.
    await signIn({ redirectUri: REDIRECT_URI });
  }, [signIn]);

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
      console.warn("Sign-In error:", message);
      await clearBrokenSession();
      throw error;
    }
  }, [performInteractiveSignIn, clearBrokenSession]);

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
      console.warn("Google Sign-In error:", message);
      await clearBrokenSession();
      throw error;
    }
  }, [performInteractiveSignIn, clearBrokenSession]);

  // ── Sign-Out ────────────────────────────────────────────

  const signOut = useCallback(async () => {
    try {
      await logtoSignOut(REDIRECT_URI);
    } catch (error) {
      console.error("Sign out error:", error);
    } finally {
      await clientRef.current.clearAllTokens().catch(() => {});
      setUser(null);
      setAccessToken(null);
      clearAuthClaims();
      resetCurrentUserCache();
    }
  }, [logtoSignOut]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        hasAccessToken: hasValidAccessToken,
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
