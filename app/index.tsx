import { useEffect, useState, useRef } from "react";
import { Redirect } from "expo-router";
import { View, ActivityIndicator, Text, ScrollView } from "react-native";
import { useAuth } from "@/contexts/AuthContext";
import { getDebugLog } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { Routes } from "@/constants/routes";
import { dbg } from "@/utils/debugLog";

export default function Index() {
  const { isAuthenticated, hasAccessToken, isLoading: isAuthLoading } = useAuth();
  const { theme } = useTheme();
  const { profile, isLoading: isProfileLoading } = useCurrentUser(
    isAuthenticated && hasAccessToken,
  );
  const [log, setLog] = useState<string[]>([]);

  // Refresh the on-screen log every 500ms
  useEffect(() => {
    const id = setInterval(() => setLog([...getDebugLog()]), 500);
    return () => clearInterval(id);
  }, []);

  // Only log when state actually changes (prevent flooding the debug buffer)
  const prevStateRef = useRef("");
  const stateKey = `${isAuthLoading}|${isAuthenticated}|${hasAccessToken}|${isProfileLoading}|${!!profile}`;
  if (stateKey !== prevStateRef.current) {
    prevStateRef.current = stateKey;
    dbg(
      "[Index] render " +
      JSON.stringify({
        isAuthLoading,
        isAuthenticated,
        hasAccessToken,
        isProfileLoading,
        hasProfile: !!profile,
      }),
    );
  }

  // Show loading spinner while checking auth state or fetching profile
  if (isAuthLoading || (isAuthenticated && isProfileLoading)) {
    const reason = isAuthLoading ? "auth loading" : "profile loading";
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: theme.background,
          padding: 20,
        }}
      >
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={{ color: "#888", marginTop: 10, fontSize: 12 }}>
          Index — {reason} | isAuth={String(isAuthenticated)} hasToken={String(hasAccessToken)}
        </Text>
        <ScrollView style={{ flex: 1, marginTop: 10, width: "100%" }}>
          <Text style={{ color: "#aaa", fontSize: 9, fontFamily: "monospace" }}>
            {log.join("\n")}
          </Text>
        </ScrollView>
      </View>
    );
  }

  // Not authenticated
  if (!isAuthenticated) {
    dbg("[Index] → REDIRECT to AUTH_LOGIN");
    return <Redirect href={Routes.AUTH_LOGIN} />;
  }

  // Authenticated but hasn't completed onboarding
  if (profile && !profile.onboardingCompleted) {
    dbg("[Index] → REDIRECT to ONBOARDING");
    return <Redirect href={Routes.ONBOARDING_STEP1 as never} />;
  }

  // Authenticated and onboarding complete
  dbg("[Index] → REDIRECT to TABS_CHAT");
  return <Redirect href={Routes.TABS_CHAT} />;
}
