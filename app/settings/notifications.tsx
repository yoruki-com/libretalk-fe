import { View, Text, Switch, ScrollView, Pressable, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@/contexts/ThemeContext";
import { useNotificationPreferences } from "@/hooks/useNotificationPreferences";
import type { NotificationPreferencesResponse } from "@/services/api";

interface ToggleRowProps {
  label: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  isLast?: boolean;
}

function ToggleRow({ label, value, onValueChange, isLast }: ToggleRowProps) {
  const { theme } = useTheme();

  return (
    <View
      className="flex-row items-center justify-between px-4 py-3"
      style={!isLast ? { borderBottomWidth: 1, borderBottomColor: theme.border } : undefined}
    >
      <Text
        className="font-sans flex-1 text-base"
        style={{ color: theme.text }}
      >
        {label}
      </Text>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: theme.border, true: theme.primary }}
        thumbColor={theme.card}
      />
    </View>
  );
}

interface ToggleSectionProps {
  title: string;
  children: React.ReactNode;
}

function ToggleSection({ title, children }: ToggleSectionProps) {
  const { theme } = useTheme();

  return (
    <View className="mb-6">
      <Text
        className="font-sans-semibold mb-2 px-1 text-xs uppercase tracking-wide"
        style={{ color: theme.textTertiary }}
      >
        {title}
      </Text>
      <View
        className="overflow-hidden rounded-2xl"
        style={{
          backgroundColor: theme.card,
          borderWidth: 1,
          borderColor: theme.border,
        }}
      >
        {children}
      </View>
    </View>
  );
}

export default function NotificationPreferencesScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { theme } = useTheme();
  const { preferences, isLoading, error, updatePreference } =
    useNotificationPreferences();

  const handleToggle = (
    key: keyof NotificationPreferencesResponse,
    value: boolean
  ) => {
    updatePreference(key, value);
  };

  return (
    <View
      className="flex-1"
      style={{ paddingTop: insets.top, backgroundColor: theme.background }}
    >
      {/* Header */}
      <View className="flex-row items-center gap-3 px-6 pb-4">
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </Pressable>
        <Text
          className="font-sans-semibold text-heading-4 font-semibold"
          style={{ color: theme.text }}
        >
          Notifications
        </Text>
      </View>

      {/* Loading state */}
      {isLoading && (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      )}

      {/* Error state */}
      {!isLoading && error && (
        <View className="flex-1 items-center justify-center px-6">
          <Text
            className="font-sans mb-4 text-center text-base"
            style={{ color: theme.textSecondary }}
          >
            Failed to load notification preferences.
          </Text>
          <Pressable
            onPress={() => {
              // Re-mount hook by navigating away and back
              router.back();
            }}
          >
            <Text
              className="font-sans-semibold text-base"
              style={{ color: theme.primary }}
            >
              Go Back
            </Text>
          </Pressable>
        </View>
      )}

      {/* Preferences content */}
      {!isLoading && !error && preferences && (
        <ScrollView
          className="flex-1 px-6"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
        >
          {/* Social section */}
          <ToggleSection title="Social">
            <ToggleRow
              label="Someone liked your vibe"
              value={preferences.pushLikes}
              onValueChange={(v) => handleToggle("pushLikes", v)}
            />
            <ToggleRow
              label="Someone commented on your vibe"
              value={preferences.pushComments}
              onValueChange={(v) => handleToggle("pushComments", v)}
            />
            <ToggleRow
              label="Someone followed you"
              value={preferences.pushFollowers}
              onValueChange={(v) => handleToggle("pushFollowers", v)}
              isLast
            />
          </ToggleSection>

          {/* Content section */}
          <ToggleSection title="Content">
            <ToggleRow
              label="New vibes from people you follow"
              value={preferences.pushNewVibes}
              onValueChange={(v) => handleToggle("pushNewVibes", v)}
              isLast
            />
          </ToggleSection>

          {/* Messages section */}
          <ToggleSection title="Messages">
            <ToggleRow
              label="New chat message"
              value={preferences.pushChat}
              onValueChange={(v) => handleToggle("pushChat", v)}
              isLast
            />
          </ToggleSection>

          {/* Footer note */}
          <Text
            className="font-sans mt-2 text-center text-xs"
            style={{ color: theme.textTertiary }}
          >
            In-app notifications are always on
          </Text>
        </ScrollView>
      )}
    </View>
  );
}
