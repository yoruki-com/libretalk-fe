import { View, Text } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@/contexts/ThemeContext";

export default function CommunityScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();

  return (
    <View
      className="flex-1 items-center justify-center"
      style={{ paddingTop: insets.top, backgroundColor: theme.background }}
    >
      <Text className="font-sans text-lg" style={{ color: theme.text }}>
        Community
      </Text>
    </View>
  );
}
