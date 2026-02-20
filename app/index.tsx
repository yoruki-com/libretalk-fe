import { Redirect } from "expo-router";
import { View, ActivityIndicator } from "react-native";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { Routes } from "@/constants/routes";

export default function Index() {
  const { isAuthenticated, hasAccessToken, isLoading: isAuthLoading } = useAuth();
  const { theme } = useTheme();
  const { profile, isLoading: isProfileLoading } = useCurrentUser(
    isAuthenticated && hasAccessToken,
  );

  // Show loading spinner while checking auth state or fetching profile
  if (isAuthLoading || (isAuthenticated && isProfileLoading)) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: theme.background,
        }}
      >
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  // Not authenticated
  if (!isAuthenticated) {
    return <Redirect href={Routes.AUTH_LOGIN} />;
  }

  // Authenticated but hasn't completed onboarding
  if (profile && !profile.onboardingCompleted) {
    return <Redirect href={Routes.ONBOARDING_STEP1 as never} />;
  }

  // Authenticated and onboarding complete
  return <Redirect href={Routes.TABS_CHAT} />;
}
