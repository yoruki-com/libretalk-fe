import { View, Text } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/contexts/ThemeContext";

export default function CallScreen() {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { theme } = useTheme();

  return (
    <View
      className="flex-1 items-center justify-center"
      style={{ paddingTop: insets.top, backgroundColor: theme.background }}
    >
      <Text className="font-sans text-lg" style={{ color: theme.text }}>
        {t("tabs.call")}
      </Text>
    </View>
  );
}
