import { useTheme } from "@/contexts/ThemeContext";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { usersApi } from "@/services/api/users";
import { passionsApi } from "@/services/api/passions";
import type { Passion } from "@/services/api/types";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState, useEffect, useMemo } from "react";
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

  const [passions, setPassions] = useState<Passion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    passionsApi
      .getActive()
      .then((res) => setPassions(res.data))
      .catch(() => Alert.alert(t("common.error"), t("onboarding.loadError")))
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    if (profile?.passions) {
      setSelectedIds(new Set(profile.passions.map((p) => p.publicId)));
    }
  }, [profile]);

  const groupedPassions = useMemo(() => {
    const groups: Record<string, Passion[]> = {};
    for (const passion of passions) {
      const category = passion.category ?? t("onboarding.otherCategory");
      if (!groups[category]) groups[category] = [];
      groups[category].push(passion);
    }
    return groups;
  }, [passions, t]);

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

  if (isLoading) {
    return (
      <View
        className="flex-1 items-center justify-center"
        style={{ backgroundColor: theme.background }}
      >
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

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

        {Object.entries(groupedPassions).map(([category, items]) => (
          <View key={category} className="mb-4">
            <Text
              className="mb-2 font-sans-semibold text-[13px] uppercase tracking-wider"
              style={{ color: theme.textSecondary }}
            >
              {category}
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {items.map((passion) => {
                const isSelected = selectedIds.has(passion.publicId);
                return (
                  <Pressable
                    key={passion.publicId}
                    onPress={() => togglePassion(passion.publicId)}
                    className="flex-row items-center rounded-full px-4 py-2"
                    style={{
                      backgroundColor: isSelected ? theme.primary + "15" : theme.card,
                      borderWidth: 1,
                      borderColor: isSelected ? theme.primary : theme.border,
                    }}
                  >
                    {passion.icon && (
                      <Text className="mr-1.5 text-[14px]">{passion.icon}</Text>
                    )}
                    <Text
                      className="font-sans text-[14px]"
                      style={{ color: isSelected ? theme.primary : theme.text }}
                    >
                      {passion.name}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        ))}
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
