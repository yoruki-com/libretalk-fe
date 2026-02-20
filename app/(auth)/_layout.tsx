import { Redirect, Stack } from "expo-router";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";
import { Routes } from "@/constants/routes";

export default function AuthLayout() {
  const { theme } = useTheme();
  const { isAuthenticated, isLoading } = useAuth();

  console.log("[AuthLayout] render", JSON.stringify({ isLoading, isAuthenticated }));

  if (!isLoading && isAuthenticated) {
    console.log("[AuthLayout] → REDIRECT to ROOT");
    return <Redirect href={Routes.ROOT} />;
  }

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
