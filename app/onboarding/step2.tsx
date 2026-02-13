import { useTheme } from "@/contexts/ThemeContext";
import { usersApi } from "@/services/api/users";
import { languagesApi } from "@/services/api/languages";
import type { Language } from "@/services/api/types";
import { SlideIndicator } from "@/components/ui/SlideIndicator";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Routes } from "@/constants/routes";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function OnboardingStep2() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { t } = useTranslation();
  const { theme } = useTheme();

  const [languages, setLanguages] = useState<Language[]>([]);
  const [isLoadingLanguages, setIsLoadingLanguages] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedNative, setSelectedNative] = useState<Language | null>(null);
  const [selectedLearning, setSelectedLearning] = useState<Language | null>(null);
  const [activeSection, setActiveSection] = useState<"native" | "learning">("native");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadLanguages();
  }, []);

  const loadLanguages = async () => {
    try {
      const response = await languagesApi.getActive();
      setLanguages(response.data);
    } catch {
      Alert.alert(t("common.error"), t("onboarding.loadError"));
    } finally {
      setIsLoadingLanguages(false);
    }
  };

  const filteredLanguages = languages.filter((lang) => {
    const q = search.toLowerCase();
    return (
      lang.name.toLowerCase().includes(q) ||
      lang.nativeName.toLowerCase().includes(q) ||
      lang.code.toLowerCase().includes(q)
    );
  });

  const handleSelect = (lang: Language) => {
    if (activeSection === "native") {
      setSelectedNative(lang);
      if (!selectedLearning) {
        setActiveSection("learning");
        setSearch("");
      }
    } else {
      setSelectedLearning(lang);
    }
    setSearch("");
  };

  const isValid = selectedNative !== null && selectedLearning !== null;

  const handleNext = async () => {
    if (!isValid) return;
    setIsSaving(true);
    try {
      await usersApi.updateMyLanguages({
        languages: [
          {
            code: selectedNative!.code,
            proficiency: "NATIVE",
            isLearning: false,
          },
          {
            code: selectedLearning!.code,
            proficiency: "BEGINNER",
            isLearning: true,
          },
        ],
      });
      router.push(Routes.ONBOARDING_STEP3 as never);
    } catch {
      Alert.alert(t("common.error"), t("onboarding.saveError"));
    } finally {
      setIsSaving(false);
    }
  };

  const renderLanguageItem = ({ item }: { item: Language }) => {
    const isSelected =
      (activeSection === "native" && selectedNative?.code === item.code) ||
      (activeSection === "learning" && selectedLearning?.code === item.code);
    const isDisabled =
      (activeSection === "native" && selectedLearning?.code === item.code) ||
      (activeSection === "learning" && selectedNative?.code === item.code);

    return (
      <Pressable
        onPress={() => !isDisabled && handleSelect(item)}
        disabled={isDisabled}
        className="flex-row items-center rounded-2xl px-4 py-3"
        style={{
          backgroundColor: isSelected ? theme.primary + "15" : theme.card,
          borderWidth: 1,
          borderColor: isSelected ? theme.primary : theme.border,
          opacity: isDisabled ? 0.4 : 1,
          marginBottom: 8,
        }}
      >
        <View className="flex-1">
          <Text
            className="font-sans-semibold text-[15px]"
            style={{ color: isSelected ? theme.primary : theme.text }}
          >
            {item.name}
          </Text>
          <Text
            className="font-sans text-[13px]"
            style={{ color: theme.textSecondary }}
          >
            {item.nativeName}
          </Text>
        </View>
        {isSelected && (
          <Ionicons name="checkmark-circle" size={22} color={theme.primary} />
        )}
      </Pressable>
    );
  };

  if (isLoadingLanguages) {
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
          <SlideIndicator total={3} activeIndex={1} />
        </View>
        <View className="w-6" />
      </View>

      {/* Title */}
      <View className="px-6">
        <Text
          className="mb-2 font-sans-bold text-[28px]"
          style={{ color: theme.text }}
        >
          {t("onboarding.step2Title")}
        </Text>
        <Text
          className="mb-6 font-sans text-[16px]"
          style={{ color: theme.textSecondary }}
        >
          {t("onboarding.step2Subtitle")}
        </Text>
      </View>

      {/* Section Tabs */}
      <View className="mb-4 flex-row gap-3 px-6">
        <Pressable
          onPress={() => { setActiveSection("native"); setSearch(""); }}
          className="flex-1 items-center rounded-full py-3"
          style={{
            backgroundColor: activeSection === "native" ? theme.primary : theme.card,
            borderWidth: 1,
            borderColor: activeSection === "native" ? theme.primary : theme.border,
          }}
        >
          <Text
            className="font-sans-semibold text-[14px]"
            style={{ color: activeSection === "native" ? "#FFFFFF" : theme.text }}
          >
            {t("onboarding.iSpeak")}
            {selectedNative ? ` - ${selectedNative.name}` : ""}
          </Text>
        </Pressable>
        <Pressable
          onPress={() => { setActiveSection("learning"); setSearch(""); }}
          className="flex-1 items-center rounded-full py-3"
          style={{
            backgroundColor: activeSection === "learning" ? theme.primary : theme.card,
            borderWidth: 1,
            borderColor: activeSection === "learning" ? theme.primary : theme.border,
          }}
        >
          <Text
            className="font-sans-semibold text-[14px]"
            style={{ color: activeSection === "learning" ? "#FFFFFF" : theme.text }}
          >
            {t("onboarding.iWantToLearn")}
            {selectedLearning ? ` - ${selectedLearning.name}` : ""}
          </Text>
        </Pressable>
      </View>

      {/* Search */}
      <View className="px-6 pb-3">
        <View
          className="flex-row items-center rounded-2xl px-4 py-3"
          style={{ backgroundColor: theme.card, borderWidth: 1, borderColor: theme.border }}
        >
          <Ionicons name="search" size={18} color={theme.textTertiary} style={{ marginRight: 8 }} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder={t("onboarding.searchLanguage")}
            placeholderTextColor={theme.textTertiary}
            className="flex-1 font-sans text-[15px]"
            style={{ color: theme.text, padding: 0 }}
          />
        </View>
      </View>

      {/* Language List */}
      <FlatList
        data={filteredLanguages}
        keyExtractor={(item) => item.code}
        renderItem={renderLanguageItem}
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      />

      {/* Next Button */}
      <View
        className="absolute bottom-0 left-0 right-0 px-6"
        style={{ paddingBottom: insets.bottom + 16 }}
      >
        <Pressable
          onPress={handleNext}
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
              {t("common.next")}
            </Text>
          )}
        </Pressable>
      </View>
    </View>
  );
}
