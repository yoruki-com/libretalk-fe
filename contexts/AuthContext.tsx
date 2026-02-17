import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { useAuth0, Auth0Provider } from "react-native-auth0";
import * as AppleAuthentication from "expo-apple-authentication";
import { Platform } from "react-native";
import axios from "axios";
import {
  setTokenGetter,
  clearTokenGetter,
} from "@/services/api/client";
import { resetCurrentUserCache } from "@/hooks/useCurrentUser";

const AUTH0_DOMAIN = process.env.EXPO_PUBLIC_AUTH0_DOMAIN!;
const AUTH0_CLIENT_ID = process.env.EXPO_PUBLIC_AUTH0_CLIENT_ID!;
const CUSTOM_SCHEME = "libretalk";

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
  signInWithApple: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: () => Promise<void>;
  signOut: () => Promise<void>;
  getToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function AuthContextProvider({ children }: { children: ReactNode }) {
  const {
    authorize,
    clearSession,
    getCredentials,
    hasValidCredentials,
    user: auth0User,
    isLoading: auth0Loading,
  } = useAuth0();

  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check for existing session on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        const hasCredentials = await hasValidCredentials();
        if (hasCredentials) {
          const credentials = await getCredentials();
          if (credentials?.accessToken) {
            setAccessToken(credentials.accessToken);
            setIsAuthenticated(true);

            // Fetch user info to populate avatar, name, etc.
            try {
              const response = await axios.get(
                `https://${AUTH0_DOMAIN}/userinfo`,
                { headers: { Authorization: `Bearer ${credentials.accessToken}` } }
              );
              const userInfo = response.data;
              setUser({
                id: userInfo.sub,
                email: userInfo.email,
                name: userInfo.name,
                avatar: userInfo.picture,
              });
            } catch (err) {
              console.error("Error fetching user info:", err);
            }
          }
        }
      } catch (error) {
        console.error("Error checking session:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (!auth0Loading) {
      checkSession();
    }
  }, [auth0Loading, hasValidCredentials, getCredentials]);

  // Update user when auth0User changes
  useEffect(() => {
    if (auth0User) {
      setUser({
        id: auth0User.sub ?? "",
        email: auth0User.email ?? undefined,
        name: auth0User.name ?? undefined,
        avatar: auth0User.picture ?? undefined,
      });
      setIsAuthenticated(true);
    }
  }, [auth0User]);

  const getToken = useCallback(async (): Promise<string | null> => {
    try {
      const credentials = await getCredentials();
      if (credentials?.accessToken) {
        setAccessToken(credentials.accessToken);
        return credentials.accessToken;
      }
      return null;
    } catch (error) {
      console.error("[AuthContext] Error getting token:", error);
      return null;
    }
  }, [getCredentials, isAuthenticated]);

  // Register token getter with API client
  useEffect(() => {
    setTokenGetter(getToken);
    return () => clearTokenGetter();
  }, [getToken]);

  // Native Apple Sign-In with Token Exchange
  const signInWithApple = useCallback(async () => {
    if (Platform.OS !== "ios") {
      // Fallback to Universal Login on Android
      await authorize(
        { connection: "apple", scope: "openid profile email offline_access" },
        { customScheme: CUSTOM_SCHEME }
      );
      const credentials = await getCredentials();
      if (credentials?.accessToken) {
        setAccessToken(credentials.accessToken);
        setIsAuthenticated(true);
      }
      return;
    }

    try {
      const appleCredential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      if (!appleCredential.identityToken) {
        throw new Error("No identity token received from Apple");
      }

      // Token exchange with Auth0
      let tokens;
      try {
        const response = await axios.post(`https://${AUTH0_DOMAIN}/oauth/token`, {
          grant_type: "urn:ietf:params:oauth:grant-type:token-exchange",
          client_id: AUTH0_CLIENT_ID,
          subject_token: appleCredential.identityToken,
          subject_token_type:
            "http://auth0.com/oauth/token-type/apple-authz-code",
          scope: "openid profile email offline_access",
        });
        tokens = response.data;
      } catch (tokenExchangeError) {
        console.error(
          "Token exchange error:",
          axios.isAxiosError(tokenExchangeError)
            ? tokenExchangeError.response?.data
            : tokenExchangeError
        );
        // Fallback to Universal Login if token exchange fails
        await authorize(
          { connection: "apple", scope: "openid profile email offline_access" },
          { customScheme: CUSTOM_SCHEME }
        );
        const credentials = await getCredentials();
        if (credentials?.accessToken) {
          setAccessToken(credentials.accessToken);
          setIsAuthenticated(true);
        }
        return;
      }

      setAccessToken(tokens.access_token);
      setIsAuthenticated(true);

      // Fetch user info
      const userInfoResponse = await axios.get(
        `https://${AUTH0_DOMAIN}/userinfo`,
        {
          headers: { Authorization: `Bearer ${tokens.access_token}` },
        }
      );
      const userInfo = userInfoResponse.data;

      const fullName = appleCredential.fullName
        ? `${appleCredential.fullName.givenName ?? ""} ${appleCredential.fullName.familyName ?? ""}`.trim()
        : undefined;

      setUser({
        id: userInfo.sub,
        email: userInfo.email,
        name: fullName || userInfo.name,
        avatar: userInfo.picture,
      });
    } catch (error: unknown) {
      const err = error as { code?: string };
      if (err.code === "ERR_REQUEST_CANCELED") {
        console.log("Apple Sign-In cancelled by user");
        return;
      }
      console.error("Apple Sign-In error:", error);
      throw error;
    }
  }, [authorize, getCredentials]);

  // Google Sign-In via Universal Login
  const signInWithGoogle = useCallback(async () => {
    try {
      await authorize(
        {
          connection: "google-oauth2",
          scope: "openid profile email offline_access",
        },
        { customScheme: CUSTOM_SCHEME }
      );

      const credentials = await getCredentials();
      if (credentials?.accessToken) {
        setAccessToken(credentials.accessToken);
        setIsAuthenticated(true);
      }
    } catch (error: unknown) {
      const err = error as { message?: string };
      if (err.message?.includes("user_cancelled")) {
        console.log("Google Sign-In cancelled by user");
        return;
      }
      console.error("Google Sign-In error:", error);
      throw error;
    }
  }, [authorize, getCredentials]);

  // Email Sign-In via Universal Login
  const signInWithEmail = useCallback(async () => {
    try {
      await authorize(
        { scope: "openid profile email offline_access" },
        { customScheme: CUSTOM_SCHEME }
      );

      const credentials = await getCredentials();
      if (credentials?.accessToken) {
        setAccessToken(credentials.accessToken);
        setIsAuthenticated(true);
      }
    } catch (error: unknown) {
      const err = error as { message?: string };
      if (err.message?.includes("user_cancelled")) {
        console.log("Sign-In cancelled by user");
        return;
      }
      console.error("Sign-In error:", error);
      throw error;
    }
  }, [authorize, getCredentials]);

  const signOut = useCallback(async () => {
    try {
      await clearSession({}, { customScheme: CUSTOM_SCHEME });
      setUser(null);
      setAccessToken(null);
      setIsAuthenticated(false);
      resetCurrentUserCache();
    } catch (error) {
      console.error("Sign out error:", error);
      // Reset state even if clearSession fails
      setUser(null);
      setAccessToken(null);
      setIsAuthenticated(false);
      resetCurrentUserCache();
    }
  }, [clearSession]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading: isLoading || auth0Loading,
        accessToken,
        signInWithApple,
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
    <Auth0Provider domain={AUTH0_DOMAIN} clientId={AUTH0_CLIENT_ID}>
      <AuthContextProvider>{children}</AuthContextProvider>
    </Auth0Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
