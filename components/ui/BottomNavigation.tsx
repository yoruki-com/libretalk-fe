import { useTheme } from "@/contexts/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type TabName = "vibes" | "community" | "chat" | "settings";

interface BottomNavigationProps {
  activeTab: TabName;
  onTabPress: (tab: TabName) => void;
  badges?: Partial<Record<TabName, boolean>>;
}

const tabs: {
  name: TabName;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}[] = [
  { name: "vibes", label: "Vibes", icon: "grid-outline" },
  { name: "community", label: "Community", icon: "people-outline" },
  { name: "chat", label: "Chat", icon: "chatbubbles" },
  { name: "settings", label: "Settings", icon: "settings-outline" },
];

export function BottomNavigation({
  activeTab,
  onTabPress,
  badges = {},
}: BottomNavigationProps) {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();

  return (
    <View
      className="flex-row items-center justify-between px-4"
      style={{
        paddingBottom: insets.bottom + 8,
        backgroundColor: theme.card,
        borderTopWidth: 1,
        borderTopColor: theme.border,
      }}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.name;
        return (
          <Pressable
            key={tab.name}
            onPress={() => onTabPress(tab.name)}
            className="relative min-w-[65px] items-center justify-center rounded-lg py-3"
          >
            <View className="relative">
              <Ionicons
                name={tab.icon}
                size={24}
                color={theme.icon}
                style={{ opacity: isActive ? 1 : 0.4 }}
              />
              {badges[tab.name] && (
                <View
                  className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: theme.primary }}
                />
              )}
            </View>
            <Text
              className="mt-1 font-sans text-[11px]"
              style={{
                color: theme.text,
                opacity: isActive ? 1 : 0.4,
              }}
            >
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
