import { View, Pressable, ActivityIndicator, Text } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { WebView, type WebViewMessageEvent } from "react-native-webview";
import { useTheme } from "@/contexts/ThemeContext";
import { promotionsApi } from "@/services/api/promotions";
import { useEffect, useRef, useState } from "react";

interface WebViewBridgeMessage {
  action: "purchase" | "close" | "navigate";
  planCode?: string;
  route?: string;
}

export default function PromoScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { theme, isDark } = useTheme();
  const webViewRef = useRef<WebView>(null);

  const [html, setHtml] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;

    let cancelled = false;

    async function fetchContent() {
      try {
        setLoading(true);
        setError(null);
        const content = await promotionsApi.getContent(slug!);
        if (!cancelled) {
          setHtml(content);
        }
      } catch (err) {
        if (!cancelled) {
          setError("Unable to load this page. Please try again later.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchContent();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  const injectedJavaScript = `
    window.APP_CONTEXT = {
      theme: "${isDark ? "dark" : "light"}",
      primaryColor: "${theme.primary}"
    };
    true;
  `;

  const handleMessage = (event: WebViewMessageEvent) => {
    try {
      const message: WebViewBridgeMessage = JSON.parse(event.nativeEvent.data);

      switch (message.action) {
        case "purchase":
          // TODO: integrate with in-app purchase when ready
          console.log("[Promo] Purchase requested:", message.planCode);
          break;
        case "close":
          router.back();
          break;
        case "navigate":
          if (message.route) {
            router.push(message.route as never);
          }
          break;
      }
    } catch {
      // Ignore invalid messages
    }
  };

  return (
    <View
      className="flex-1"
      style={{ paddingTop: insets.top, backgroundColor: theme.background }}
    >
      {/* Header */}
      <View
        className="flex-row items-center px-4 py-2"
        style={{ borderBottomWidth: 1, borderBottomColor: theme.border }}
      >
        <Pressable onPress={() => router.back()} className="active:opacity-70">
          <Ionicons name="close" size={24} color={theme.text} />
        </Pressable>
      </View>

      {/* Loading State */}
      {loading && (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      )}

      {/* Error State */}
      {error && !loading && (
        <View className="flex-1 items-center justify-center px-6">
          <Text
            style={{
              color: theme.textSecondary,
              textAlign: "center",
              fontSize: 16,
            }}
          >
            {error}
          </Text>
          <Pressable
            onPress={() => router.back()}
            className="mt-4 active:opacity-70"
          >
            <Text style={{ color: theme.primary, fontSize: 16, fontWeight: "600" }}>
              Go Back
            </Text>
          </Pressable>
        </View>
      )}

      {/* WebView */}
      {html && !loading && (
        <WebView
          ref={webViewRef}
          source={{ html }}
          style={{ flex: 1, backgroundColor: theme.background }}
          injectedJavaScript={injectedJavaScript}
          onMessage={handleMessage}
          scrollEnabled={true}
          javaScriptEnabled={true}
          originWhitelist={["*"]}
        />
      )}
    </View>
  );
}
