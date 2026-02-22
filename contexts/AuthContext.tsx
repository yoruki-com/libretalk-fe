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
import * as WebBrowser from "expo-web-browser";
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
  performSignIn: () => Promise<void>;
  performSignUp: () => Promise<void>;
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
  const logtoSignOutRef = useRef(logtoSignOut);
  const clientRef = useRef(client);

  useEffect(() => {
    getAccessTokenRef.current = getAccessToken;
    isAuthenticatedRef.current = isAuthenticated;
    isInitializedRef.current = isInitialized;
    logtoSignOutRef.current = logtoSignOut;
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
              `[AuthContext] getAccessToken attempt ${attempt}/${maxAttempts} failed, retrying in ${delay}ms…`,
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
      setIsLoading(true);

      try {
        if (isAuthenticated) {
          const c = clientRef.current;
          const token = await tryGetAccessToken();

          // Decode ID token claims locally (no network call) to get
          // email/name. This is instant — unlike fetchUserInfo() which
          // hits the Logto userinfo endpoint and can block loading.
          const claims = await c.getIdTokenClaims();
          setAuthClaims({
            email: claims.email ?? undefined,
            name: claims.name ?? undefined,
          });
          setUser({
            id: claims.sub,
            email: claims.email ?? undefined,
            name: claims.name ?? undefined,
            avatar: claims.picture ?? undefined,
          });

          setAccessToken(token);
        }
      } catch (error: unknown) {
        console.warn("[AuthContext] initSession error:", error);
        // Any failure to obtain an access token means the session is unusable.
        // Force SDK sign-out so isAuthenticated resets to false and the user
        // is redirected back to the login screen instead of stuck loading.
        try {
          await logtoSignOutRef.current(REDIRECT_URI);
        } catch {
          // Ignore sign-out failures
        }
        setUser(null);
        setAccessToken(null);
        clearAuthClaims();
        resetCurrentUserCache();
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
          await clearBrokenSession();
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

  // ── Sign-In / Sign-Up ──────────────────────────────────

  const performInteractiveSignIn = useCallback(
    async (firstScreen?: "sign_in" | "register") => {
      // NOTE: Do NOT pass `prompt: Prompt.Login` — Logto explicitly skips
      // refresh-token issuance for `prompt=login`. The SDK default
      // (`Prompt.Consent`) correctly requests consent + offline_access.
      await signIn({ redirectUri: REDIRECT_URI, firstScreen });
    },
    [signIn],
  );

  const handleAuthFlow = useCallback(
    async (firstScreen?: "sign_in" | "register") => {
      try {
        await performInteractiveSignIn(firstScreen);
      } catch (error: unknown) {
        const err = error as { message?: string };
        const message = err.message ?? String(error);
        if (
          message.includes("user_cancelled") ||
          message.includes("cancelled") ||
          message.includes("dismissed")
        ) {
          return;
        }
        console.warn("Auth flow error:", message);
        await clearBrokenSession();
        throw error;
      }
    },
    [performInteractiveSignIn, clearBrokenSession],
  );

  const performSignIn = useCallback(
    () => handleAuthFlow("sign_in"),
    [handleAuthFlow],
  );

  const performSignUp = useCallback(
    () => handleAuthFlow("register"),
    [handleAuthFlow],
  );

  // ── Sign-Out ────────────────────────────────────────────

  const signOut = useCallback(async () => {
    const c = clientRef.current;

    // Capture ID token before SDK clears it — needed for end-session hint
    let idTokenHint: string | null = null;
    try {
      idTokenHint = await c.getIdToken();
    } catch { /* ignore */ }

    // SDK signOut: revokes refresh token + clears local storage.
    // NOTE: The RN SDK's navigate handler is a no-op for sign-out,
    // so the Logto server session is NOT ended by this call alone.
    try {
      await logtoSignOut(REDIRECT_URI);
    } catch (error) {
      console.error("Sign out error:", error);
    }

    // End the Logto server session by opening the end-session endpoint
    // in a brief browser popup. Without this, the next signIn would
    // auto-authenticate without showing the login page.
    try {
      const { endSessionEndpoint } = await c.getOidcConfig();
      if (endSessionEndpoint) {
        const params = new URLSearchParams({
          client_id: LOGTO_APP_ID,
          post_logout_redirect_uri: REDIRECT_URI,
        });
        if (idTokenHint) params.set("id_token_hint", idTokenHint);

        await WebBrowser.openAuthSessionAsync(
          `${endSessionEndpoint}?${params.toString()}`,
          REDIRECT_URI,
          { preferEphemeralSession: true },
        );
      }
    } catch {
      // Ignore browser errors — local cleanup is already done
    }

    // Final local cleanup
    await c.clearAllTokens().catch(() => {});
    setUser(null);
    setAccessToken(null);
    clearAuthClaims();
    resetCurrentUserCache();
  }, [logtoSignOut]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        hasAccessToken: hasValidAccessToken,
        // Also loading when authenticated but token not yet fetched
        // (closes the one-frame gap between isAuthenticated=true and
        // initSession starting, which caused premature navigation).
        isLoading: !isInitialized || isLoading || (isAuthenticated && !accessToken),
        accessToken,
        performSignIn,
        performSignUp,
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
