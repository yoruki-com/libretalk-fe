import { useEffect } from "react";
import { router } from "expo-router";
import { View, ActivityIndicator } from "react-native";
import { useAuth } from "@/contexts/AuthContext";

/**
 * OAuth redirect handler for Logto.
 *
 * When the browser redirects back to `libretalk://callback`, Expo Router
 * renders this screen. The Logto SDK completes the token exchange in the
 * background (via expo-web-browser). We show a spinner and wait for the
 * auth state to settle before navigating to the root index.
 */
export default function Callback() {
  const { isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      router.replace("/");
    }
  }, [isLoading]);

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <ActivityIndicator size="large" />
    </View>
  );
}
