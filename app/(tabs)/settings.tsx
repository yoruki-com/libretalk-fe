import { View, Text, ScrollView, Switch } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { SearchInput } from "@/components/ui/SearchInput";
import { ProfileCard } from "@/components/ui/ProfileCard";
import { SettingsMenuGroup } from "@/components/ui/SettingsMenuGroup";
import { useTheme } from "@/contexts/ThemeContext";

const primaryMenuItems = [
  { icon: "laptop-outline" as const, label: "Connected Device" },
  { icon: "time-outline" as const, label: "Recent Activities" },
  { icon: "document-text-outline" as const, label: "Draft Chatter Box" },
];

const settingsMenuItems = [
  { icon: "person-outline" as const, label: "Account" },
  { icon: "lock-closed-outline" as const, label: "Privacy" },
  { icon: "chatbubbles-outline" as const, label: "Chat & Community" },
  { icon: "notifications-outline" as const, label: "Notification" },
  { icon: "server-outline" as const, label: "Storage & Data" },
  { icon: "information-circle-outline" as const, label: "Recent Updates" },
];

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const { theme, isDark, toggleTheme } = useTheme();

  const handleQRPress = () => {
    console.log("QR pressed");
  };

  const handleContactsPress = () => {
    console.log("Contacts pressed");
  };

  return (
    <View
      className="flex-1"
      style={{ paddingTop: insets.top, backgroundColor: theme.background }}
    >
      {/* Header */}
      <View className="gap-4 px-6">
        <Text
          className="font-sans-semibold text-heading-4 font-semibold"
          style={{ color: theme.text }}
        >
          Setting Menu
        </Text>
        <SearchInput />
      </View>

      {/* Menu Content */}
      <ScrollView
        className="mt-4 flex-1 px-6"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ gap: 24, paddingBottom: 24 }}
      >
        {/* Profile Card */}
        <ProfileCard
          name="Emma Carter"
          subtitle="Only Emergency Call"
          contactsCount={356}
          onQRPress={handleQRPress}
          onContactsPress={handleContactsPress}
        />

        {/* Theme Toggle */}
        <View
          className="flex-row items-center justify-between rounded-2xl p-4"
          style={{ backgroundColor: theme.surface }}
        >
          <View className="flex-row items-center gap-3">
            <View
              className="h-10 w-10 items-center justify-center rounded-full"
              style={{ backgroundColor: theme.primaryLight }}
            >
              <Ionicons
                name={isDark ? "moon" : "sunny"}
                size={20}
                color={theme.primary}
              />
            </View>
            <View>
              <Text
                className="font-sans-semibold text-base"
                style={{ color: theme.text }}
              >
                Dark Mode
              </Text>
              <Text
                className="font-sans text-sm"
                style={{ color: theme.textSecondary }}
              >
                {isDark ? "On" : "Off"}
              </Text>
            </View>
          </View>
          <Switch
            value={isDark}
            onValueChange={toggleTheme}
            trackColor={{ false: theme.border, true: theme.primary }}
            thumbColor={theme.card}
          />
        </View>

        {/* Primary Menu Group */}
        <SettingsMenuGroup items={primaryMenuItems} variant="primary" />

        {/* Settings Menu Group */}
        <SettingsMenuGroup items={settingsMenuItems} variant="default" />
      </ScrollView>
    </View>
  );
}
