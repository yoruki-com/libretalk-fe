import { useTheme } from "@/contexts/ThemeContext";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { usersApi } from "@/services/api/users";
import { passionsApi } from "@/services/api/passions";
import type { Passion, PersonalityType } from "@/services/api/types";
import { SlideIndicator } from "@/components/ui/SlideIndicator";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Routes } from "@/constants/routes";
import { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const MBTI_TYPES: PersonalityType[] = [
  "INTJ", "INTP", "ENTJ", "ENTP",
  "INFJ", "INFP", "ENFJ", "ENFP",
  "ISTJ", "ISFJ", "ESTJ", "ESFJ",
  "ISTP", "ISFP", "ESTP", "ESFP",
];

export default function OnboardingStep3() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { refresh: refreshProfile } = useCurrentUser();

  const [passions, setPassions] = useState<Passion[]>([]);
  const [isLoadingPassions, setIsLoadingPassions] = useState(true);
  const [selectedPassionIds, setSelectedPassionIds] = useState<Set<string>>(new Set());
  const [selectedMbti, setSelectedMbti] = useState<PersonalityType | null>(null);
  const [jobTitle, setJobTitle] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadPassions();
  }, []);

  const loadPassions = async () => {
    try {
      const response = await passionsApi.getActive();
      setPassions(response.data);
    } catch {
      Alert.alert(t("common.error"), t("onboarding.loadError"));
    } finally {
      setIsLoadingPassions(false);
    }
  };

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
    setSelectedPassionIds((prev) => {
      const next = new Set(prev);
      if (next.has(publicId)) {
        next.delete(publicId);
      } else {
        next.add(publicId);
      }
      return next;
    });
  };

  const isValid = selectedPassionIds.size > 0;

  const handleComplete = async () => {
    if (!isValid) return;
    setIsSaving(true);
    try {
      await usersApi.updateMyPassions({
        passionIds: Array.from(selectedPassionIds),
      });

      await usersApi.updateMe({
        personalityType: selectedMbti,
        jobTitle: jobTitle.trim() || null,
        onboardingCompleted: true,
      });

      await refreshProfile();
      router.replace(Routes.TABS_CHAT as never);
    } catch {
      Alert.alert(t("common.error"), t("onboarding.saveError"));
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoadingPassions) {
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
      <View className="flex-row items-center px-4 py-4">
        <Pressable onPress={() => router.back()} className="active:opacity-70">
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </Pressable>
        <View className="flex-1 items-center">
          <SlideIndicator total={3} activeIndex={2} />
        </View>
        <View className="w-6" />
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 120 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Title */}
        <Text
          className="mb-2 font-sans-bold text-[28px]"
          style={{ color: theme.text }}
        >
          {t("onboarding.step3Title")}
        </Text>
        <Text
          className="mb-8 font-sans text-[16px]"
          style={{ color: theme.textSecondary }}
        >
          {t("onboarding.step3Subtitle")}
        </Text>

        {/* Hobbies / Passions */}
        <Text
          className="mb-3 font-sans-semibold text-[16px]"
          style={{ color: theme.text }}
        >
          {t("onboarding.hobbies")}
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
                const isSelected = selectedPassionIds.has(passion.publicId);
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

        {/* MBTI */}
        <Text
          className="mb-3 mt-4 font-sans-semibold text-[16px]"
          style={{ color: theme.text }}
        >
          {t("onboarding.mbti")}
        </Text>
        <Text
          className="mb-3 font-sans text-[14px]"
          style={{ color: theme.textSecondary }}
        >
          {t("onboarding.mbtiOptional")}
        </Text>
        <View className="mb-6 flex-row flex-wrap gap-2">
          {MBTI_TYPES.map((type) => {
            const isSelected = selectedMbti === type;
            return (
              <Pressable
                key={type}
                onPress={() => setSelectedMbti(isSelected ? null : type)}
                className="items-center justify-center rounded-xl px-4 py-2.5"
                style={{
                  backgroundColor: isSelected ? theme.primary : theme.card,
                  borderWidth: 1,
                  borderColor: isSelected ? theme.primary : theme.border,
                  minWidth: 72,
                }}
              >
                <Text
                  className="font-sans-semibold text-[14px]"
                  style={{ color: isSelected ? "#FFFFFF" : theme.text }}
                >
                  {type}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Job Title */}
        <Text
          className="mb-2 font-sans-semibold text-[16px]"
          style={{ color: theme.text }}
        >
          {t("onboarding.jobTitle")}
        </Text>
        <Text
          className="mb-3 font-sans text-[14px]"
          style={{ color: theme.textSecondary }}
        >
          {t("onboarding.jobOptional")}
        </Text>
        <View
          className="mb-6 rounded-2xl px-4 py-3"
          style={{ backgroundColor: theme.card, borderWidth: 1, borderColor: theme.border }}
        >
          <TextInput
            value={jobTitle}
            onChangeText={setJobTitle}
            placeholder={t("onboarding.jobPlaceholder")}
            placeholderTextColor={theme.textTertiary}
            className="font-sans text-[16px]"
            style={{ color: theme.text, padding: 0 }}
            maxLength={100}
          />
        </View>
      </ScrollView>

      {/* Complete Button */}
      <View
        className="absolute bottom-0 left-0 right-0 px-6"
        style={{ paddingBottom: insets.bottom + 16 }}
      >
        <Pressable
          onPress={handleComplete}
          disabled={!isValid || isSaving}
          className="items-center rounded-full py-4 active:opacity-80"
          style={{
            backgroundColor: theme.primary,
            opacity: !isValid || isSaving ? 0.5 : 1,
          }}
        >
          {isSaving ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text className="font-sans-semibold text-[16px] text-white">
              {t("onboarding.complete")}
            </Text>
          )}
        </Pressable>
      </View>
    </View>
  );
}
