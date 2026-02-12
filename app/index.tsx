import { Redirect } from "expo-router";
import { View, ActivityIndicator } from "react-native";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useCurrentUser } from "@/hooks/useCurrentUser";

export default function Index() {
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const { theme } = useTheme();
  const { profile, isLoading: isProfileLoading } = useCurrentUser(isAuthenticated);

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
    return <Redirect href="/(auth)/login" />;
  }

  // Authenticated but hasn't completed onboarding
  if (profile && !profile.onboardingCompleted) {
    return <Redirect href={"/onboarding/step1" as never} />;
  }

  // Authenticated and onboarding complete
  return <Redirect href="/(tabs)/chat" />;
}
