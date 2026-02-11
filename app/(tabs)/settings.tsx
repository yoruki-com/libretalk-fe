import { ProfileCard } from "@/components/ui/ProfileCard";
import { SettingsMenuGroup } from "@/components/ui/SettingsMenuGroup";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { Alert, Pressable, ScrollView, Switch, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { t } = useTranslation();
  const { theme, isDark, toggleTheme } = useTheme();
  const { user, signOut } = useAuth();

  const primaryMenuItems = [
    { icon: "laptop-outline" as const, label: t("settings.connectedDevice") },
    { icon: "time-outline" as const, label: t("settings.recentActivities") },
    {
      icon: "document-text-outline" as const,
      label: t("settings.draftChatterBox"),
    },
  ];

  const settingsMenuItems = [
    { icon: "person-outline" as const, label: t("settings.account") },
    { icon: "lock-closed-outline" as const, label: t("settings.privacy") },
    {
      icon: "chatbubbles-outline" as const,
      label: t("settings.chatCommunity"),
    },
    {
      icon: "notifications-outline" as const,
      label: t("settings.notification"),
    },
    { icon: "server-outline" as const, label: t("settings.storageData") },
    {
      icon: "information-circle-outline" as const,
      label: t("settings.recentUpdates"),
    },
  ];

  const handleQRPress = () => {
    console.log("QR pressed");
  };

  const handleContactsPress = () => {
    router.push("/profile/edit" as never);
  };

  const handleLogout = () => {
    Alert.alert(t("auth.logoutTitle"), t("auth.logoutConfirm"), [
      {
        text: t("common.cancel"),
        style: "cancel",
      },
      {
        text: t("auth.logout"),
        style: "destructive",
        onPress: async () => {
          try {
            await signOut();
            router.replace("/(auth)/login");
          } catch (error) {
            Alert.alert(t("common.error"), t("auth.logoutError"));
            console.error("Logout error:", error);
          }
        },
      },
    ]);
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
          {t("settings.title")}
        </Text>
      </View>

      {/* Menu Content */}
      <ScrollView
        className="mt-4 flex-1 px-6"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ gap: 24, paddingBottom: 24 }}
      >
        {/* Profile Card */}
        <ProfileCard
          name={user?.name ?? user?.email ?? t("common.user")}
          subtitle={user?.email ?? ""}
          avatar={user?.avatar}
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
                {t("settings.darkMode")}
              </Text>
              <Text
                className="font-sans text-sm"
                style={{ color: theme.textSecondary }}
              >
                {isDark ? t("settings.on") : t("settings.off")}
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

        {/* Logout Button */}
        <Pressable
          onPress={handleLogout}
          className="flex-row items-center justify-center gap-2 rounded-2xl p-4"
          style={{ backgroundColor: theme.surface }}
        >
          <Ionicons name="log-out-outline" size={20} color={theme.error} />
          <Text
            className="font-sans-semibold text-base"
            style={{ color: theme.error }}
          >
            {t("settings.logoutButton")}
          </Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}
