import "@/lib/i18n";
import { Stack } from "expo-router";
import * as Notifications from "expo-notifications";
import * as WebBrowser from "expo-web-browser";
import "../global.css";

import { AuthProvider } from "@/contexts/AuthContext";
import { WebSocketProvider } from "@/contexts/WebSocketContext";
import { ThemeProvider, useTheme } from "@/contexts/ThemeContext";
import { useNotificationNavigation } from "@/hooks/useNotificationNavigation";
import { getActiveChatId } from "@/utils/activeChatTracker";
import {
  NunitoSans_400Regular,
  NunitoSans_500Medium,
  NunitoSans_600SemiBold,
  NunitoSans_700Bold,
  useFonts,
} from "@expo-google-fonts/nunito-sans";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { AppState } from "react-native";

WebBrowser.maybeCompleteAuthSession();
SplashScreen.preventAutoHideAsync();

// Foreground push suppression: when app is active, in-app notification panel
// is sufficient -- suppress push alerts. When backgrounded/closed, show normally.
// Badge count is never set (per CONTEXT.md decision).
// Chat pushes are fully suppressed when that specific thread is open.
Notifications.setNotificationHandler({
  handleNotification: async (notification) => {
    const isActive = AppState.currentState === "active";
    const data = notification.request.content.data as
      | { screen?: string; params?: { id?: string } }
      | undefined;

    // Full suppression for chat pushes when that specific thread is open
    if (
      isActive &&
      data?.screen === "chat" &&
      data?.params?.id &&
      data.params.id === getActiveChatId()
    ) {
      return {
        shouldShowBanner: false,
        shouldShowList: false,
        shouldPlaySound: false,
        shouldSetBadge: false,
      };
    }

    return {
      shouldShowBanner: !isActive,
      shouldShowList: !isActive,
      shouldPlaySound: !isActive,
      shouldSetBadge: false,
    };
  },
});

function RootLayoutContent() {
  useNotificationNavigation();
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
        <Stack.Screen name="onboarding" options={{ gestureEnabled: false }} />
        <Stack.Screen name="get-started" />
        <Stack.Screen name="callback" options={{ headerShown: false }} />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    NunitoSans_400Regular,
    NunitoSans_500Medium,
    NunitoSans_600SemiBold,
    NunitoSans_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <AuthProvider>
      <WebSocketProvider>
        <ThemeProvider>
          <RootLayoutContent />
        </ThemeProvider>
      </WebSocketProvider>
    </AuthProvider>
  );
}
