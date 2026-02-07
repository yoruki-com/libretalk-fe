import { View, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { WebView } from "react-native-webview";
import { useTheme } from "@/contexts/ThemeContext";

const VIP_URL = "https://howareyou.app/vip";

export default function VipScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { theme } = useTheme();

  return (
    <View className="flex-1" style={{ paddingTop: insets.top, backgroundColor: theme.background }}>
      {/* Header */}
      <View
        className="flex-row items-center px-4 py-2"
        style={{ borderBottomWidth: 1, borderBottomColor: theme.border }}
      >
        <Pressable onPress={() => router.back()} className="active:opacity-70">
          <Ionicons name="close" size={24} color={theme.text} />
        </Pressable>
      </View>

      {/* WebView */}
      <WebView
        source={{ uri: VIP_URL }}
        style={{ flex: 1 }}
        startInLoadingState
      />
    </View>
  );
}
