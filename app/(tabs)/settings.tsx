import { View, Text, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { SearchInput } from "@/components/ui/SearchInput";
import { ProfileCard } from "@/components/ui/ProfileCard";
import { SettingsMenuGroup } from "@/components/ui/SettingsMenuGroup";

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

  const handleQRPress = () => {
    console.log("QR pressed");
  };

  const handleContactsPress = () => {
    console.log("Contacts pressed");
  };

  return (
    <View className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
      {/* Header */}
      <View className="gap-4 px-6">
        <Text className="font-sans-semibold text-heading-4 font-semibold text-dark">
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

        {/* Primary Menu Group */}
        <SettingsMenuGroup items={primaryMenuItems} variant="primary" />

        {/* Settings Menu Group */}
        <SettingsMenuGroup items={settingsMenuItems} variant="default" />
      </ScrollView>
    </View>
  );
}
