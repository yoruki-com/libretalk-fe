# Piano di Implementazione Autenticazione con Auth0

**Data creazione:** 2026-02-06
**Progetto:** libre-talk (how-are-you/fe)
**Versione Expo:** 54.0.32
**Versione React Native:** 0.81.5

---

## Sommario

- [Panoramica Auth0](#panoramica-auth0)
- [Stato Attuale](#stato-attuale)
- [Obiettivi](#obiettivi)
- [Architettura Proposta](#architettura-proposta)
- [Piano di Implementazione](#piano-di-implementazione)
- [Dettagli Tecnici](#dettagli-tecnici)
- [Checklist](#checklist)
- [Risorse](#risorse)

---

## Panoramica Auth0

### Metodi di Login Supportati

| Metodo | Tipo | Supportato | Note |
|--------|------|------------|------|
| Universal Login | Web Browser | ✅ Completo | Metodo principale, apre browser in-app |
| Apple Sign-In | Nativo | ✅ Token Exchange | Supportato ufficialmente |
| Google Sign-In | Nativo | ⚠️ Parziale | Richiede implementazione custom |
| Email/Password | Universal Login | ✅ Completo | Gestito da Auth0 |
| Password Reset | Universal Login | ✅ Completo | Gestito da Auth0 |

### Importante: Limitazioni Native Social Login

**Auth0 supporta ufficialmente solo Apple Sign-In nativo** tramite token exchange. Per Google, le opzioni sono:

1. **Universal Login (consigliato)**: Apre browser in-app, UX consistente
2. **Implementazione ibrida**: Apple nativo + Google via Universal Login
3. **Full custom**: Entrambi nativi con backend custom (più complesso)

Questo piano implementa l'**opzione 2** (ibrida) per il miglior compromesso UX/complessità.

---

## Stato Attuale

### Dipendenze da rimuovere
```json
{
  "@logto/rn": "^1.1.0",
  "expo-crypto": "^15.0.8",
  "expo-secure-store": "^15.0.8"
}
```

### Dipendenze da aggiungere
```json
{
  "react-native-auth0": "^5.0.0",
  "expo-apple-authentication": "~7.2.2"
}
```

### File da creare/modificare
- `contexts/AuthContext.tsx` - Nuovo context per Auth0
- `app/(auth)/*` - Schermate autenticazione
- `services/api/client.ts` - Aggiungere Bearer token
- `app/_layout.tsx` - Wrappare con Auth0Provider
- `app/index.tsx` - Redirect basato su auth state
- `app/(tabs)/settings.tsx` - Logout e dati utente
- `app.json` - Configurazione plugin Auth0

---

## Obiettivi

1. ✅ Login con Apple (nativo, senza browser)
2. ✅ Login con Google (via Universal Login)
3. ✅ Registrazione (via Universal Login)
4. ✅ Recupero password (via Universal Login)
5. ✅ Bearer token automatico per API calls
6. ✅ Persistenza sessione
7. ✅ Logout

---

## Architettura Proposta

### Struttura File

```
app/
├── _layout.tsx              # Root con Auth0Provider
├── index.tsx                # Redirect basato su auth
├── (auth)/                  # Gruppo auth screens
│   ├── _layout.tsx
│   ├── login.tsx            # Login principale
│   └── callback.tsx         # Gestione callback (opzionale)
├── (tabs)/                  # Route protette
│   └── settings.tsx         # Con logout
└── get-started.tsx          # Onboarding (opzionale)

contexts/
└── AuthContext.tsx          # Context Auth0 + token management

services/
└── api/
    └── client.ts            # API client con Bearer token

components/
└── ui/
    └── Button.tsx           # Esteso con varianti auth
```

### Flusso di Autenticazione

```
┌─────────────────────────────────────────────────────────────────────┐
│                            App Start                                 │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    hasValidCredentials() ?                           │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                ┌─────────────────┴─────────────────┐
                ▼                                   ▼
┌───────────────────────────┐       ┌───────────────────────────┐
│     No Credentials        │       │    Has Credentials        │
│                           │       │                           │
│  Redirect → /(auth)/login │       │  getCredentials()         │
└───────────────────────────┘       │  Set user + token         │
                │                   │  Redirect → /(tabs)       │
                ▼                   └───────────────────────────┘
┌───────────────────────────┐
│      Login Screen         │
│                           │
│  ┌─────────────────────┐  │
│  │ 🍎 Apple (Nativo)   │──┼──▶ expo-apple-authentication
│  └─────────────────────┘  │         │
│                           │         ▼
│  ┌─────────────────────┐  │    Token Exchange API
│  │ 🔵 Google (Browser) │──┼──▶ auth0.authorize()
│  └─────────────────────┘  │
│                           │
│  ┌─────────────────────┐  │
│  │ 📧 Email (Browser)  │──┼──▶ auth0.authorize()
│  └─────────────────────┘  │
└───────────────────────────┘
                │
                ▼
┌───────────────────────────┐
│   Credentials Received    │
│                           │
│  • accessToken            │
│  • refreshToken           │
│  • idToken                │
│  • user info              │
└───────────────────────────┘
                │
                ▼
┌───────────────────────────┐
│     API Client Ready      │
│                           │
│  Authorization: Bearer    │
│  ${accessToken}           │
└───────────────────────────┘
```

---

## Piano di Implementazione

### Fase 1: Setup Auth0 Dashboard

#### 1.1 Creare Application

1. Vai su [Auth0 Dashboard](https://manage.auth0.com/)
2. Applications → Create Application
3. Seleziona **Native**
4. Nome: `libre-talk`

#### 1.2 Configurare Callback URLs

```
# Allowed Callback URLs
libretalk://YOUR_AUTH0_DOMAIN/ios/com.yourcompany.libretalk/callback,
libretalk://YOUR_AUTH0_DOMAIN/android/com.yourcompany.libretalk/callback

# Allowed Logout URLs
libretalk://YOUR_AUTH0_DOMAIN/ios/com.yourcompany.libretalk/callback,
libretalk://YOUR_AUTH0_DOMAIN/android/com.yourcompany.libretalk/callback
```

#### 1.3 Configurare Social Connections

1. Authentication → Social → Google
   - Crea OAuth credentials in Google Cloud Console
   - Inserisci Client ID e Client Secret

2. Authentication → Social → Apple
   - Configura in Apple Developer Portal
   - Services ID, Team ID, Key ID

#### 1.4 Abilitare Token Exchange (per Apple nativo)

1. Settings → Advanced → Grant Types
2. Abilita `urn:ietf:params:oauth:grant-type:token-exchange`

### Fase 2: Configurazione Progetto

#### 2.1 Installare Dipendenze

```bash
# Rimuovere Logto
bun remove @logto/rn expo-crypto expo-secure-store

# Installare Auth0
bun add react-native-auth0 expo-apple-authentication
```

#### 2.2 Aggiornare app.json

```json
{
  "expo": {
    "name": "libre-talk",
    "slug": "libre-talk",
    "scheme": "libretalk",
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.yourcompany.libretalk",
      "usesAppleSignIn": true
    },
    "android": {
      "package": "com.yourcompany.libretalk"
    },
    "plugins": [
      "expo-router",
      [
        "react-native-auth0",
        {
          "domain": "${AUTH0_DOMAIN}",
          "customScheme": "libretalk"
        }
      ],
      "expo-apple-authentication"
    ]
  }
}
```

#### 2.3 Variabili d'ambiente (.env)

```env
EXPO_PUBLIC_API_BASE_URL=http://192.168.7.186:3000
EXPO_PUBLIC_AUTH0_DOMAIN=your-tenant.auth0.com
EXPO_PUBLIC_AUTH0_CLIENT_ID=your-client-id
```

### Fase 3: Implementazione AuthContext

#### File: `contexts/AuthContext.tsx`

```typescript
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

const AUTH0_DOMAIN = process.env.EXPO_PUBLIC_AUTH0_DOMAIN!;
const AUTH0_CLIENT_ID = process.env.EXPO_PUBLIC_AUTH0_CLIENT_ID!;

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

// Token getter for API client
let tokenGetter: (() => Promise<string | null>) | null = null;

export function setTokenGetter(getter: () => Promise<string | null>) {
  tokenGetter = getter;
}

export function clearTokenGetter() {
  tokenGetter = null;
}

export { tokenGetter };

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
          if (credentials) {
            setAccessToken(credentials.accessToken);
            setIsAuthenticated(true);
            setUser({
              id: auth0User?.sub ?? "",
              email: auth0User?.email ?? undefined,
              name: auth0User?.name ?? undefined,
              avatar: auth0User?.picture ?? undefined,
            });
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
  }, [auth0Loading, hasValidCredentials, getCredentials, auth0User]);

  // Update user when auth0User changes
  useEffect(() => {
    if (auth0User) {
      setUser({
        id: auth0User.sub ?? "",
        email: auth0User.email ?? undefined,
        name: auth0User.name ?? undefined,
        avatar: auth0User.picture ?? undefined,
      });
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
      console.error("Error getting token:", error);
      return null;
    }
  }, [getCredentials]);

  // Register token getter with API client
  useEffect(() => {
    setTokenGetter(getToken);
    return () => clearTokenGetter();
  }, [getToken]);

  // Native Apple Sign-In with Token Exchange
  const signInWithApple = useCallback(async () => {
    if (Platform.OS !== "ios") {
      // Fallback to Universal Login on Android
      await authorize({
        connection: "apple",
        scope: "openid profile email offline_access",
      }, { customScheme: "libretalk" });
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
      const response = await fetch(`https://${AUTH0_DOMAIN}/oauth/token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          grant_type: "urn:ietf:params:oauth:grant-type:token-exchange",
          client_id: AUTH0_CLIENT_ID,
          subject_token: appleCredential.identityToken,
          subject_token_type: "http://auth0.com/oauth/token-type/apple-authz-code",
          scope: "openid profile email offline_access",
          audience: `https://${AUTH0_DOMAIN}/api/v2/`,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error_description || "Token exchange failed");
      }

      const tokens = await response.json();
      setAccessToken(tokens.access_token);
      setIsAuthenticated(true);

      // Fetch user info
      const userInfoResponse = await fetch(`https://${AUTH0_DOMAIN}/userinfo`, {
        headers: { Authorization: `Bearer ${tokens.access_token}` },
      });
      const userInfo = await userInfoResponse.json();

      setUser({
        id: userInfo.sub,
        email: userInfo.email,
        name: appleCredential.fullName
          ? `${appleCredential.fullName.givenName ?? ""} ${appleCredential.fullName.familyName ?? ""}`.trim()
          : userInfo.name,
        avatar: userInfo.picture,
      });
    } catch (error: any) {
      if (error.code === "ERR_REQUEST_CANCELED") {
        console.log("Apple Sign-In cancelled by user");
        return;
      }
      console.error("Apple Sign-In error:", error);
      throw error;
    }
  }, [authorize]);

  // Google Sign-In via Universal Login
  const signInWithGoogle = useCallback(async () => {
    try {
      await authorize({
        connection: "google-oauth2",
        scope: "openid profile email offline_access",
      }, { customScheme: "libretalk" });

      const credentials = await getCredentials();
      if (credentials) {
        setAccessToken(credentials.accessToken);
        setIsAuthenticated(true);
      }
    } catch (error: any) {
      if (error.message?.includes("user_cancelled")) {
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
      await authorize({
        scope: "openid profile email offline_access",
      }, { customScheme: "libretalk" });

      const credentials = await getCredentials();
      if (credentials) {
        setAccessToken(credentials.accessToken);
        setIsAuthenticated(true);
      }
    } catch (error: any) {
      if (error.message?.includes("user_cancelled")) {
        console.log("Sign-In cancelled by user");
        return;
      }
      console.error("Sign-In error:", error);
      throw error;
    }
  }, [authorize, getCredentials]);

  const signOut = useCallback(async () => {
    try {
      await clearSession({ customScheme: "libretalk" });
      setUser(null);
      setAccessToken(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error("Sign out error:", error);
      throw error;
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
```

### Fase 4: API Client con Bearer Token

#### File: `services/api/client.ts`

```typescript
import { API_URL } from "./config";
import type { PaginationParams } from "./types";

class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public data?: unknown
  ) {
    super(message);
    this.name = "ApiError";
  }
}

// Token getter - set by AuthContext
let tokenGetter: (() => Promise<string | null>) | null = null;

export function setTokenGetter(getter: () => Promise<string | null>) {
  tokenGetter = getter;
}

export function clearTokenGetter() {
  tokenGetter = null;
}

async function getAuthHeaders(): Promise<Record<string, string>> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (tokenGetter) {
    try {
      const token = await tokenGetter();
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
    } catch (error) {
      console.error("Error getting auth token:", error);
    }
  }

  return headers;
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    if (response.status === 401) {
      throw new ApiError(401, "Unauthorized - Please sign in again");
    }
    const errorData = await response.json().catch(() => null);
    throw new ApiError(
      response.status,
      errorData?.message || response.statusText,
      errorData
    );
  }
  return response.json();
}

function buildQueryString(params?: PaginationParams & Record<string, unknown>): string {
  if (!params) return "";
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      searchParams.append(key, String(value));
    }
  });
  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : "";
}

export const apiClient = {
  async get<T>(endpoint: string, params?: PaginationParams & Record<string, unknown>): Promise<T> {
    const url = `${API_URL}${endpoint}${buildQueryString(params)}`;
    const headers = await getAuthHeaders();
    const response = await fetch(url, { method: "GET", headers, credentials: "include" });
    return handleResponse<T>(response);
  },

  async post<T>(endpoint: string, data?: unknown): Promise<T> {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: "POST",
      headers,
      credentials: "include",
      body: data ? JSON.stringify(data) : undefined,
    });
    return handleResponse<T>(response);
  },

  async patch<T>(endpoint: string, data: unknown): Promise<T> {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: "PATCH",
      headers,
      credentials: "include",
      body: JSON.stringify(data),
    });
    return handleResponse<T>(response);
  },

  async delete<T>(endpoint: string, data?: unknown): Promise<T> {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: "DELETE",
      headers,
      credentials: "include",
      body: data ? JSON.stringify(data) : undefined,
    });
    return handleResponse<T>(response);
  },
};

export { ApiError };
```

### Fase 5: Schermate Auth

#### File: `app/(auth)/_layout.tsx`

```typescript
import { Stack } from "expo-router";
import { useTheme } from "@/contexts/ThemeContext";

export default function AuthLayout() {
  const { theme } = useTheme();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: theme.background },
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen name="login" />
    </Stack>
  );
}
```

#### File: `app/(auth)/login.tsx`

```typescript
import { View, Text, Alert, Platform } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { SlideIndicator } from "@/components/ui/SlideIndicator";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import * as AppleAuthentication from "expo-apple-authentication";
import { AuthButton } from "@/components/ui/AuthButton";

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const { signInWithApple, signInWithGoogle, signInWithEmail } = useAuth();
  const [isLoading, setIsLoading] = useState<string | null>(null);

  const handleAppleSignIn = async () => {
    setIsLoading("apple");
    try {
      await signInWithApple();
    } catch (error) {
      Alert.alert("Errore", "Si è verificato un errore durante l'accesso con Apple.");
    } finally {
      setIsLoading(null);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading("google");
    try {
      await signInWithGoogle();
    } catch (error) {
      Alert.alert("Errore", "Si è verificato un errore durante l'accesso con Google.");
    } finally {
      setIsLoading(null);
    }
  };

  const handleEmailSignIn = async () => {
    setIsLoading("email");
    try {
      await signInWithEmail();
    } catch (error) {
      Alert.alert("Errore", "Si è verificato un errore durante l'accesso.");
    } finally {
      setIsLoading(null);
    }
  };

  return (
    <View className="flex-1 bg-white">
      <View className="absolute left-0 right-0 top-0 h-[60%]">
        <LinearGradient colors={["#014AF1", "#4B7BF5", "#A8C4F5"]} className="flex-1" />
      </View>

      <View
        className="absolute bottom-0 left-0 right-0 rounded-t-card bg-white px-4 pb-8 pt-8"
        style={{ paddingBottom: insets.bottom + 32 }}
      >
        <View className="mb-8 items-center">
          <SlideIndicator total={3} activeIndex={2} />
        </View>

        <Text className="mb-8 text-center font-sans-semibold text-heading-4 text-dark">
          Accedi per iniziare le tue conversazioni!
        </Text>

        <View className="gap-4">
          {/* Apple Sign-In (nativo su iOS) */}
          {Platform.OS === "ios" && (
            <AppleAuthentication.AppleAuthenticationButton
              buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
              buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
              cornerRadius={999}
              style={{ height: 56 }}
              onPress={handleAppleSignIn}
            />
          )}

          {/* Google Sign-In */}
          <AuthButton
            variant="google"
            onPress={handleGoogleSignIn}
            loading={isLoading === "google"}
            disabled={isLoading !== null}
          />

          {/* Divider */}
          <View className="flex-row items-center gap-4 my-2">
            <View className="flex-1 h-px bg-gray-200" />
            <Text className="text-gray-500 text-sm">oppure</Text>
            <View className="flex-1 h-px bg-gray-200" />
          </View>

          {/* Email Sign-In */}
          <AuthButton
            variant="email"
            onPress={handleEmailSignIn}
            loading={isLoading === "email"}
            disabled={isLoading !== null}
          />

          <Text className="mt-4 text-center text-body-small text-dark opacity-60">
            Continuando, accetti i{" "}
            <Text className="font-sans-semibold">Termini di Servizio</Text> e l'
            <Text className="font-sans-semibold">Informativa sulla Privacy</Text>
          </Text>
        </View>
      </View>
    </View>
  );
}
```

### Fase 6: Root Layout

#### File: `app/_layout.tsx`

```typescript
import "../global.css";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import { useFonts, ... } from "@expo-google-fonts/nunito-sans";
import { useEffect } from "react";
import { ThemeProvider, useTheme } from "@/contexts/ThemeContext";
import { AuthProvider } from "@/contexts/AuthContext";

SplashScreen.preventAutoHideAsync();

function RootLayoutContent() {
  const { theme, isDark } = useTheme();

  return (
    <>
      <StatusBar style={isDark ? "light" : "dark"} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: theme.background },
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" options={{ gestureEnabled: false }} />
        <Stack.Screen name="(tabs)" options={{ gestureEnabled: false }} />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({ ... });

  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync();
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <AuthProvider>
      <ThemeProvider>
        <RootLayoutContent />
      </ThemeProvider>
    </AuthProvider>
  );
}
```

### Fase 7: Index con Auth Check

#### File: `app/index.tsx`

```typescript
import { Redirect } from "expo-router";
import { View, ActivityIndicator } from "react-native";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";

export default function Index() {
  const { isAuthenticated, isLoading } = useAuth();
  const { theme } = useTheme();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: theme.background }}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  if (isAuthenticated) {
    return <Redirect href="/(tabs)/chat" />;
  }

  return <Redirect href="/(auth)/login" />;
}
```

---

## Dettagli Tecnici

### Expo Development Build

Auth0 SDK **non funziona con Expo Go**. È necessario creare un development build:

```bash
# iOS
bunx expo run:ios

# Android
bunx expo run:android

# Oppure con EAS Build
eas build --profile development --platform all
```

### Token Refresh

Il SDK Auth0 gestisce automaticamente il refresh dei token quando includi `offline_access` scope.

### Gestione Errori 401

Il client API rileva errori 401 e lancia un'eccezione che può essere gestita per forzare il re-login.

### Apple Sign-In su Android

Su Android, Apple Sign-In usa Universal Login (browser) invece del nativo.

---

## Checklist

### Auth0 Dashboard
- [ ] Creare Native Application
- [ ] Configurare Callback URLs
- [ ] Configurare Logout URLs
- [ ] Abilitare Google Connection
- [ ] Abilitare Apple Connection
- [ ] Abilitare Token Exchange grant type
- [ ] Configurare Apple in Advanced Settings (Team ID, App ID)

### Progetto
- [ ] Rimuovere dipendenze Logto
- [ ] Installare react-native-auth0
- [ ] Installare expo-apple-authentication
- [ ] Aggiornare app.json con plugin e bundle identifiers
- [ ] Aggiornare .env con credenziali Auth0
- [ ] Creare contexts/AuthContext.tsx
- [ ] Aggiornare services/api/client.ts
- [ ] Creare app/(auth)/_layout.tsx
- [ ] Creare app/(auth)/login.tsx
- [ ] Creare components/ui/AuthButton.tsx
- [ ] Aggiornare app/_layout.tsx
- [ ] Aggiornare app/index.tsx
- [ ] Aggiornare app/(tabs)/settings.tsx con logout
- [ ] Creare development build (non Expo Go)

### Testing
- [ ] Test Apple Sign-In nativo (iOS)
- [ ] Test Google Sign-In (Universal Login)
- [ ] Test Email Sign-In
- [ ] Test logout
- [ ] Test persistenza sessione
- [ ] Test API calls con Bearer token
- [ ] Test refresh token
- [ ] Test su Android

---

## Risorse

### Documentazione Auth0
- [Expo Quickstart](https://auth0.com/docs/quickstart/native/react-native-expo/interactive)
- [React Native SDK GitHub](https://github.com/auth0/react-native-auth0)
- [Token Exchange](https://auth0.com/docs/get-started/authentication-and-authorization-flow/token-exchange)

### Expo
- [expo-apple-authentication](https://docs.expo.dev/versions/latest/sdk/apple-authentication/)
- [Authentication Overview](https://docs.expo.dev/develop/authentication/)

### Limitazioni Note
- Auth0 SDK non compatibile con Expo Go
- Google Sign-In nativo non supportato ufficialmente (usa Universal Login)
- Apple Sign-In nativo solo su iOS (Android usa Universal Login)
