import { View, Text, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type TabName = "vibes" | "community" | "chat" | "call" | "settings";

interface BottomNavigationProps {
  activeTab: TabName;
  onTabPress: (tab: TabName) => void;
  badges?: Partial<Record<TabName, boolean>>;
}

const tabs: { name: TabName; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { name: "vibes", label: "Vibes", icon: "grid-outline" },
  { name: "community", label: "Community", icon: "people-outline" },
  { name: "chat", label: "Chat", icon: "chatbubbles" },
  { name: "call", label: "Call", icon: "call-outline" },
  { name: "settings", label: "Settings", icon: "settings-outline" },
];

export function BottomNavigation({
  activeTab,
  onTabPress,
  badges = {},
}: BottomNavigationProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      className="flex-row items-center justify-between border-t border-border bg-white/50 px-4"
      style={{ paddingBottom: insets.bottom + 8 }}
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
                color="#131313"
                style={{ opacity: isActive ? 1 : 0.4 }}
              />
              {badges[tab.name] && (
                <View className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-primary" />
              )}
            </View>
            <Text
              className={`mt-1 font-sans text-[11px] ${
                isActive ? "text-dark" : "text-dark opacity-40"
              }`}
            >
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
