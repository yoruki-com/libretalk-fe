import { useTheme } from "@/contexts/ThemeContext";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { usersApi } from "@/services/api/users";
import { PassionPicker } from "@/components/ui/PassionPicker";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function EditPassionsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { profile, refresh } = useCurrentUser();

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (profile?.passions) {
      setSelectedIds(new Set(profile.passions.map((p) => p.publicId)));
    }
  }, [profile]);

  const togglePassion = (publicId: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(publicId)) {
        next.delete(publicId);
      } else {
        next.add(publicId);
      }
      return next;
    });
  };

  const handleSave = async () => {
    if (selectedIds.size === 0) return;
    setIsSaving(true);
    try {
      await usersApi.updateMyPassions({
        passionIds: Array.from(selectedIds),
      });
      await refresh();
      router.back();
    } catch {
      Alert.alert(t("common.error"), t("editProfile.saveError"));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View
      className="flex-1"
      style={{ paddingTop: insets.top, backgroundColor: theme.background }}
    >
      {/* Header */}
      <View className="flex-row items-center px-4 py-3">
        <Pressable onPress={() => router.back()} className="active:opacity-70">
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </Pressable>
        <Text
          className="flex-1 text-center font-sans-semibold text-[18px]"
          style={{ color: theme.text }}
        >
          {t("editProfile.interests")}
        </Text>
        <View className="w-6" />
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 120 }}
      >
        <Text
          className="mb-6 font-sans text-[15px]"
          style={{ color: theme.textSecondary }}
        >
          {t("editProfile.passionsSubtitle")}
        </Text>

        <PassionPicker selectedIds={selectedIds} onToggle={togglePassion} />
      </ScrollView>

      {/* Save Button */}
      <View
        className="absolute bottom-0 left-0 right-0 px-6"
        style={{ paddingBottom: insets.bottom + 16 }}
      >
        <Pressable
          onPress={handleSave}
          disabled={selectedIds.size === 0 || isSaving}
          className="items-center rounded-full py-4 active:opacity-80"
          style={{
            backgroundColor: theme.primary,
            opacity: selectedIds.size === 0 || isSaving ? 0.5 : 1,
          }}
        >
          {isSaving ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text className="font-sans-semibold text-[16px] text-white">
              {t("editProfile.saveChanges")}
            </Text>
          )}
        </Pressable>
      </View>
    </View>
  );
}
