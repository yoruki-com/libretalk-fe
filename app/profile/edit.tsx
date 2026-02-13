import { CityPicker } from "@/components/ui/CityPicker";
import { MbtiPicker } from "@/components/ui/MbtiPicker";
import { Routes } from "@/constants/routes";
import type { Theme } from "@/constants/theme";
import { useTheme } from "@/contexts/ThemeContext";
import { useAvatarUpload } from "@/hooks/useAvatarUpload";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { languagesApi } from "@/services/api/languages";
import type {
  Gender,
  Language,
  LanguageProficiency,
  UpdateUserDto,
} from "@/services/api/types";
import { usersApi } from "@/services/api/users";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActionSheetIOS,
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function EditProfileScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { profile, refresh } = useCurrentUser();
  const { pendingAvatarUri, isUploading, pickAvatar, uploadAvatar } =
    useAvatarUpload();

  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [personalityType, setPersonalityType] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [gender, setGender] = useState<Gender | null>(null);
  const [city, setCity] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Language editing state
  const [allLanguages, setAllLanguages] = useState<Language[]>([]);
  const [selectedNative, setSelectedNative] = useState<Language | null>(null);
  const [selectedLearning, setSelectedLearning] = useState<Language | null>(
    null,
  );
  const [nativeProficiency, setNativeProficiency] =
    useState<LanguageProficiency>("NATIVE");
  const [learningProficiency, setLearningProficiency] =
    useState<LanguageProficiency>("BEGINNER");
  const [languageModalVisible, setLanguageModalVisible] = useState(false);
  const [languageModalTarget, setLanguageModalTarget] = useState<
    "native" | "learning"
  >("native");
  const [languageSearch, setLanguageSearch] = useState("");
  const [languagesChanged, setLanguagesChanged] = useState(false);

  const nativeProficiencyOptions: LanguageProficiency[] = [
    "NATIVE",
    "FLUENT",
    "ADVANCED",
  ];
  const learningProficiencyOptions: LanguageProficiency[] = [
    "BEGINNER",
    "INTERMEDIATE",
    "ADVANCED",
    "FLUENT",
  ];

  const [mbtiModalVisible, setMbtiModalVisible] = useState(false);
  const [cityModalVisible, setCityModalVisible] = useState(false);

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.displayName ?? "");
      setBio(profile.bio ?? "");
      setPersonalityType(profile.personalityType ?? "");
      setJobTitle(profile.jobTitle ?? "");
      setGender(profile.gender);
      setCity(profile.city ?? "");

      // Initialize language state from profile
      const native = profile.languages?.find((l) => !l.isLearning);
      const learning = profile.languages?.find((l) => l.isLearning);
      if (native) {
        setSelectedNative({
          publicId: "",
          code: native.code,
          name: native.name,
          nativeName: native.nativeName,
          isActive: true,
        });
        setNativeProficiency(native.proficiency);
      }
      if (learning) {
        setSelectedLearning({
          publicId: "",
          code: learning.code,
          name: learning.name,
          nativeName: learning.nativeName,
          isActive: true,
        });
        setLearningProficiency(learning.proficiency);
      }
    }
  }, [profile]);

  useEffect(() => {
    languagesApi
      .getActive()
      .then((res) => setAllLanguages(res.data))
      .catch(() => {});
  }, []);

  const handleSave = async () => {
    if (!profile) return;
    setIsSaving(true);
    try {
      let avatarUrl: string | undefined;
      if (pendingAvatarUri) {
        const url = await uploadAvatar();
        if (url) avatarUrl = url;
      }

      const data: UpdateUserDto = {
        displayName: displayName.trim() || undefined,
        bio: bio.trim() || null,
        personalityType:
          (personalityType.trim() as UpdateUserDto["personalityType"]) || null,
        gender: gender ?? null,
        jobTitle: jobTitle.trim() || null,
        city: city.trim() || null,
        ...(avatarUrl !== undefined && { avatarUrl }),
      };
      await usersApi.updateMe(data);

      if (languagesChanged && selectedNative && selectedLearning) {
        await usersApi.updateMyLanguages({
          languages: [
            {
              code: selectedNative.code,
              proficiency: nativeProficiency,
              isLearning: false,
            },
            {
              code: selectedLearning.code,
              proficiency: learningProficiency,
              isLearning: true,
            },
          ],
        });
      }

      await refresh();
      router.back();
    } catch {
      Alert.alert(t("common.error"), t("editProfile.saveError"));
    } finally {
      setIsSaving(false);
    }
  };

  const openLanguageModal = (target: "native" | "learning") => {
    setLanguageModalTarget(target);
    setLanguageSearch("");
    setLanguageModalVisible(true);
  };

  const handleLanguageSelect = (lang: Language) => {
    if (languageModalTarget === "native") {
      setSelectedNative(lang);
    } else {
      setSelectedLearning(lang);
    }
    setLanguagesChanged(true);
    setLanguageModalVisible(false);
  };

  const filteredModalLanguages = allLanguages.filter((lang) => {
    const q = languageSearch.toLowerCase();
    const isOtherSelected =
      languageModalTarget === "native"
        ? selectedLearning?.code === lang.code
        : selectedNative?.code === lang.code;
    if (isOtherSelected) return false;
    return (
      lang.name.toLowerCase().includes(q) ||
      lang.nativeName.toLowerCase().includes(q) ||
      lang.code.toLowerCase().includes(q)
    );
  });

  const genderOptions: Gender[] = [
    "MALE",
    "FEMALE",
    "OTHER",
    "PREFER_NOT_TO_SAY",
  ];

  const handleGenderPress = () => {
    const labels = genderOptions.map((g) => t(`editProfile.gender_${g}`));
    const cancelLabel = t("common.cancel");

    if (Platform.OS === "ios") {
      ActionSheetIOS.showActionSheetWithOptions(
        { options: [...labels, cancelLabel], cancelButtonIndex: labels.length },
        (index) => {
          if (index < genderOptions.length) setGender(genderOptions[index]);
        },
      );
    } else {
      Alert.alert(t("editProfile.gender"), undefined, [
        ...genderOptions.map((g, i) => ({
          text: labels[i],
          onPress: () => setGender(g),
        })),
        { text: cancelLabel, style: "cancel" as const },
      ]);
    }
  };

  const zodiacSign = profile?.dateOfBirth
    ? getZodiacSign(profile.dateOfBirth, t)
    : null;

  if (!profile) {
    return (
      <View
        className="flex-1 items-center justify-center"
        style={{ backgroundColor: theme.background }}
      >
        <ActivityIndicator color={theme.primary} />
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
          {t("editProfile.title")}
        </Text>
        <View className="w-6" />
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16, gap: 20, paddingBottom: 120 }}
      >
        {/* Avatar Section */}
        <View className="items-center py-4">
          <Pressable
            onPress={pickAvatar}
            disabled={isUploading}
            className="active:opacity-70"
          >
            {(pendingAvatarUri ?? profile.avatarUrl) ? (
              <Image
                source={{ uri: (pendingAvatarUri ?? profile.avatarUrl)! }}
                className="h-24 w-24 rounded-full"
                resizeMode="cover"
              />
            ) : (
              <View
                className="h-24 w-24 items-center justify-center rounded-full"
                style={{ backgroundColor: theme.surface }}
              >
                <Ionicons name="person" size={40} color={theme.iconSecondary} />
              </View>
            )}
            <View
              className="absolute bottom-0 right-0 h-8 w-8 items-center justify-center rounded-full"
              style={{ backgroundColor: theme.primary }}
            >
              {isUploading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Ionicons name="camera" size={16} color="#FFFFFF" />
              )}
            </View>
          </Pressable>
        </View>

        {/* About Me */}
        <SectionHeader label={t("editProfile.aboutMe")} theme={theme} />
        <SectionCard theme={theme}>
          <FieldRow label={t("editProfile.displayName")} theme={theme}>
            <TextInput
              value={displayName}
              onChangeText={setDisplayName}
              className="font-sans text-[15px]"
              style={{ color: theme.text, padding: 0 }}
              placeholderTextColor={theme.textTertiary}
            />
          </FieldRow>
          <Divider theme={theme} />
          <FieldRow label={t("editProfile.bio")} theme={theme}>
            <TextInput
              value={bio}
              onChangeText={setBio}
              className="font-sans text-[15px]"
              style={{ color: theme.text, padding: 0 }}
              placeholder={t("editProfile.bioPlaceholder")}
              placeholderTextColor={theme.textTertiary}
              multiline
            />
          </FieldRow>
        </SectionCard>

        {/* Languages */}
        <SectionHeader label={t("editProfile.languages")} theme={theme} />
        <SectionCard theme={theme}>
          <FieldRow label={t("editProfile.native")} theme={theme}>
            <Pressable
              onPress={() => openLanguageModal("native")}
              className="flex-row items-center justify-between active:opacity-70"
            >
              <Text
                className="font-sans text-[15px]"
                style={{
                  color: selectedNative ? theme.text : theme.textTertiary,
                }}
              >
                {selectedNative?.name ?? "—"}
              </Text>
              <Ionicons
                name="chevron-forward"
                size={14}
                color={theme.textTertiary}
              />
            </Pressable>
          </FieldRow>
          {selectedNative && (
            <View className="px-4 pb-3">
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View className="flex-row gap-2">
                  {nativeProficiencyOptions.map((level) => {
                    const isActive = nativeProficiency === level;
                    return (
                      <Pressable
                        key={level}
                        onPress={() => {
                          setNativeProficiency(level);
                          setLanguagesChanged(true);
                        }}
                        className="items-center rounded-full px-3 py-1.5"
                        style={{
                          backgroundColor: isActive
                            ? theme.primary + "15"
                            : theme.card,
                          borderWidth: 1,
                          borderColor: isActive ? theme.primary : theme.border,
                        }}
                      >
                        <Text
                          className="font-sans-semibold text-[12px]"
                          style={{
                            color: isActive ? theme.primary : theme.text,
                          }}
                        >
                          {t(`onboarding.proficiency_${level}`)}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </ScrollView>
            </View>
          )}
          <Divider theme={theme} />
          <FieldRow label={t("editProfile.learning")} theme={theme}>
            <Pressable
              onPress={() => openLanguageModal("learning")}
              className="flex-row items-center justify-between active:opacity-70"
            >
              <Text
                className="font-sans text-[15px]"
                style={{
                  color: selectedLearning ? theme.text : theme.textTertiary,
                }}
              >
                {selectedLearning?.name ?? "—"}
              </Text>
              <Ionicons
                name="chevron-forward"
                size={14}
                color={theme.textTertiary}
              />
            </Pressable>
          </FieldRow>
          {selectedLearning && (
            <View className="px-4 pb-3">
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View className="flex-row gap-2">
                  {learningProficiencyOptions.map((level) => {
                    const isActive = learningProficiency === level;
                    return (
                      <Pressable
                        key={level}
                        onPress={() => {
                          setLearningProficiency(level);
                          setLanguagesChanged(true);
                        }}
                        className="items-center rounded-full px-3 py-1.5"
                        style={{
                          backgroundColor: isActive
                            ? theme.primary + "15"
                            : theme.card,
                          borderWidth: 1,
                          borderColor: isActive ? theme.primary : theme.border,
                        }}
                      >
                        <Text
                          className="font-sans-semibold text-[12px]"
                          style={{
                            color: isActive ? theme.primary : theme.text,
                          }}
                        >
                          {t(`onboarding.proficiency_${level}`)}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </ScrollView>
            </View>
          )}
        </SectionCard>

        {/* Interests */}
        <SectionHeader label={t("editProfile.interests")} theme={theme} />
        <Pressable
          onPress={() => router.push(Routes.PROFILE_PASSIONS as never)}
          className="active:opacity-70"
        >
          <SectionCard theme={theme}>
            <View className="flex-row items-center px-4 py-3">
              <View className="flex-1">
                {profile.passions && profile.passions.length > 0 ? (
                  <View className="flex-row flex-wrap gap-2">
                    {profile.passions.map((passion) => (
                      <View
                        key={passion.publicId}
                        className="flex-row items-center rounded-full px-3 py-1.5"
                        style={{
                          backgroundColor: theme.primary + "15",
                          borderWidth: 1,
                          borderColor: theme.primary + "30",
                        }}
                      >
                        {passion.icon && (
                          <Text className="mr-1 text-[13px]">
                            {passion.icon}
                          </Text>
                        )}
                        <Text
                          className="font-sans text-[13px]"
                          style={{ color: theme.primary }}
                        >
                          {passion.name}
                        </Text>
                      </View>
                    ))}
                  </View>
                ) : (
                  <Text
                    className="font-sans text-[14px]"
                    style={{ color: theme.textTertiary }}
                  >
                    {t("editProfile.addPassions")}
                  </Text>
                )}
              </View>
              <Ionicons
                name="chevron-forward"
                size={16}
                color={theme.textTertiary}
              />
            </View>
          </SectionCard>
        </Pressable>

        {/* Personal Info */}
        <SectionHeader label={t("editProfile.personalInfo")} theme={theme} />
        <Pressable
          onPress={() => setMbtiModalVisible(true)}
          className="active:opacity-70"
        >
          <SectionCard theme={theme}>
            <IconRow
              icon="happy-outline"
              iconBg="#6C5CE7"
              label={t("editProfile.myMbti")}
              theme={theme}
            >
              <Text
                className="font-sans text-[15px]"
                style={{
                  color: personalityType ? theme.text : theme.textTertiary,
                }}
              >
                {personalityType || "—"}
              </Text>
            </IconRow>
          </SectionCard>
        </Pressable>

        <Pressable
          onPress={() => setCityModalVisible(true)}
          className="active:opacity-70"
        >
          <SectionCard theme={theme}>
            <IconRow
              icon="home"
              iconBg="#00B894"
              label={t("editProfile.myCity")}
              theme={theme}
            >
              <View className="flex-row items-center">
                <Text
                  className="font-sans text-[15px]"
                  style={{ color: city ? theme.text : theme.textTertiary }}
                >
                  {city || "—"}
                </Text>
              </View>
            </IconRow>
          </SectionCard>
        </Pressable>
        <SectionCard theme={theme}>
          <Divider theme={theme} />
          <IconRow
            icon="briefcase"
            iconBg="#00B894"
            label={t("editProfile.myJob")}
            theme={theme}
          >
            <TextInput
              value={jobTitle}
              onChangeText={setJobTitle}
              className="font-sans text-[15px]"
              style={{ color: theme.text, padding: 0, minWidth: 60 }}
              placeholder="—"
              placeholderTextColor={theme.textTertiary}
            />
          </IconRow>
        </SectionCard>

        {/* Other */}
        <SectionHeader label={t("editProfile.other")} theme={theme} />
        <SectionCard theme={theme}>
          <FieldRow label={t("editProfile.username")} theme={theme}>
            <Text
              className="font-sans text-[15px]"
              style={{ color: theme.text }}
            >
              @{profile.username}
            </Text>
          </FieldRow>
        </SectionCard>

        <SectionCard theme={theme}>
          <FieldRow label={t("editProfile.country")} theme={theme}>
            <Text
              className="font-sans text-[15px]"
              style={{ color: theme.text }}
            >
              {profile.country?.name ?? "—"}
            </Text>
          </FieldRow>
          <Divider theme={theme} />
          <FieldRow label={t("editProfile.gender")} theme={theme}>
            <Pressable
              onPress={handleGenderPress}
              className="flex-row items-center justify-between active:opacity-70"
            >
              <Text
                className="font-sans text-[15px]"
                style={{ color: theme.text }}
              >
                {gender ? t(`editProfile.gender_${gender}`) : "—"}
              </Text>
              <Ionicons
                name="chevron-forward"
                size={14}
                color={theme.textTertiary}
              />
            </Pressable>
          </FieldRow>
          <Divider theme={theme} />
          <FieldRow label={t("editProfile.dateOfBirth")} theme={theme}>
            <Text
              className="font-sans text-[15px]"
              style={{ color: theme.text }}
            >
              {profile.dateOfBirth
                ? new Date(profile.dateOfBirth).toLocaleDateString()
                : "—"}
            </Text>
          </FieldRow>
          <Divider theme={theme} />
          <FieldRow label={t("editProfile.zodiac")} theme={theme}>
            <Text
              className="font-sans text-[15px]"
              style={{ color: theme.text }}
            >
              {zodiacSign ?? "—"}
            </Text>
          </FieldRow>
        </SectionCard>
      </ScrollView>

      {/* Save Button */}
      <View
        className="absolute bottom-0 left-0 right-0 px-4"
        style={{ paddingBottom: insets.bottom + 16 }}
      >
        <Pressable
          onPress={handleSave}
          disabled={isSaving}
          className="items-center rounded-full py-4 active:opacity-80"
          style={{
            backgroundColor: theme.primary,
            opacity: isSaving ? 0.6 : 1,
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
      {/* Language Picker Modal */}
      <Modal
        visible={languageModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setLanguageModalVisible(false)}
      >
        <View
          className="flex-1"
          style={{ backgroundColor: theme.background, paddingTop: insets.top }}
        >
          <View className="flex-row items-center px-4 py-3">
            <Pressable
              onPress={() => setLanguageModalVisible(false)}
              className="active:opacity-70"
            >
              <Ionicons name="close" size={24} color={theme.text} />
            </Pressable>
            <Text
              className="flex-1 text-center font-sans-semibold text-[18px]"
              style={{ color: theme.text }}
            >
              {t("editProfile.selectLanguage")}
            </Text>
            <View className="w-6" />
          </View>
          <View className="px-4 pb-3">
            <View
              className="flex-row items-center rounded-2xl px-4 py-3"
              style={{
                backgroundColor: theme.card,
                borderWidth: 1,
                borderColor: theme.border,
              }}
            >
              <Ionicons
                name="search"
                size={18}
                color={theme.textTertiary}
                style={{ marginRight: 8 }}
              />
              <TextInput
                value={languageSearch}
                onChangeText={setLanguageSearch}
                placeholder={t("onboarding.searchLanguage")}
                placeholderTextColor={theme.textTertiary}
                className="flex-1 font-sans text-[15px]"
                style={{ color: theme.text, padding: 0 }}
                autoFocus
              />
            </View>
          </View>
          <FlatList
            data={filteredModalLanguages}
            keyExtractor={(item) => item.code}
            renderItem={({ item }) => {
              const currentSelected =
                languageModalTarget === "native"
                  ? selectedNative
                  : selectedLearning;
              const isSelected = currentSelected?.code === item.code;
              return (
                <Pressable
                  onPress={() => handleLanguageSelect(item)}
                  className="flex-row items-center rounded-2xl px-4 py-3"
                  style={{
                    backgroundColor: isSelected
                      ? theme.primary + "15"
                      : theme.card,
                    borderWidth: 1,
                    borderColor: isSelected ? theme.primary : theme.border,
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
                    <Ionicons
                      name="checkmark-circle"
                      size={22}
                      color={theme.primary}
                    />
                  )}
                </Pressable>
              );
            }}
            contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40 }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          />
        </View>
      </Modal>
      {/* MBTI Picker Modal */}
      <Modal
        visible={mbtiModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setMbtiModalVisible(false)}
      >
        <View
          className="flex-1"
          style={{ backgroundColor: theme.background, paddingTop: insets.top }}
        >
          <View className="flex-row items-center px-4 py-3">
            <Pressable
              onPress={() => setMbtiModalVisible(false)}
              className="active:opacity-70"
            >
              <Ionicons name="close" size={24} color={theme.text} />
            </Pressable>
            <Text
              className="flex-1 text-center font-sans-semibold text-[18px]"
              style={{ color: theme.text }}
            >
              {t("editProfile.myMbti")}
            </Text>
            <View className="w-6" />
          </View>
          <ScrollView
            contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40 }}
            showsVerticalScrollIndicator={false}
          >
            <Text
              className="mb-4 font-sans text-[15px]"
              style={{ color: theme.textSecondary }}
            >
              {t("onboarding.mbtiOptional")}
            </Text>
            <MbtiPicker
              selected={(personalityType as any) || null}
              onSelect={(type) => {
                setPersonalityType(type ?? "");
                setMbtiModalVisible(false);
              }}
            />
          </ScrollView>
        </View>
      </Modal>
      {/* City Picker Modal */}
      <Modal
        visible={cityModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setCityModalVisible(false)}
      >
        <View
          className="flex-1"
          style={{ backgroundColor: theme.background, paddingTop: insets.top }}
        >
          <View className="flex-row items-center px-4 py-3">
            <Pressable
              onPress={() => setCityModalVisible(false)}
              className="active:opacity-70"
            >
              <Ionicons name="close" size={24} color={theme.text} />
            </Pressable>
            <Text
              className="flex-1 text-center font-sans-semibold text-[18px]"
              style={{ color: theme.text }}
            >
              {t("editProfile.myCity")}
            </Text>
            <View className="w-6" />
          </View>
          <View style={{ paddingHorizontal: 24, paddingTop: 8 }}>
            <CityPicker
              value={city}
              onSelect={(selected) => {
                setCity(selected);
                if (selected) setCityModalVisible(false);
              }}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

/* ── Sub-components ─────────────────────────────────────── */

function SectionCard({
  children,
  theme,
}: {
  children: React.ReactNode;
  theme: Pick<Theme, "card" | "border">;
}) {
  return (
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
  );
}

function SectionHeader({
  label,
  theme,
}: {
  label: string;
  theme: Pick<Theme, "text">;
}) {
  return (
    <Text
      className="font-sans-semibold text-[16px]"
      style={{ color: theme.text }}
    >
      {label}
    </Text>
  );
}

function FieldRow({
  label,
  children,
  theme,
}: {
  label: string;
  children: React.ReactNode;
  theme: Pick<Theme, "textSecondary">;
}) {
  return (
    <View className="gap-1 px-4 py-3">
      <Text
        className="font-sans text-[12px]"
        style={{ color: theme.textSecondary }}
      >
        {label}
      </Text>
      {children}
    </View>
  );
}

function IconRow({
  icon,
  iconBg,
  label,
  value,
  children,
  onPress,
  theme,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  iconBg: string;
  label: string;
  value?: string;
  children?: React.ReactNode;
  onPress?: () => void;
  theme: Pick<Theme, "text" | "textSecondary" | "textTertiary">;
}) {
  const content = (
    <View className="flex-row items-center gap-3 px-4 py-3">
      <View
        className="h-10 w-10 items-center justify-center rounded-xl"
        style={{ backgroundColor: iconBg }}
      >
        <Ionicons name={icon} size={20} color="#FFFFFF" />
      </View>
      <View className="flex-1">
        {children ? (
          <>
            <Text
              className="font-sans text-[12px]"
              style={{ color: theme.textSecondary }}
            >
              {label}
            </Text>
            {children}
          </>
        ) : (
          <Text
            className="font-sans text-[15px]"
            style={{ color: value ? theme.text : theme.textSecondary }}
          >
            {value ?? label}
          </Text>
        )}
      </View>
      <Ionicons name="chevron-forward" size={16} color={theme.textTertiary} />
    </View>
  );

  if (onPress) {
    return (
      <Pressable onPress={onPress} className="active:opacity-70">
        {content}
      </Pressable>
    );
  }
  return content;
}

function Divider({ theme }: { theme: Pick<Theme, "border"> }) {
  return (
    <View
      className="mx-4"
      style={{ height: 1, backgroundColor: theme.border }}
    />
  );
}

function getZodiacSign(dateStr: string, t: (key: string) => string): string {
  const date = new Date(dateStr);
  const month = date.getMonth() + 1;
  const day = date.getDate();

  const signs: [number, number, string][] = [
    [1, 20, "capricorn"],
    [2, 19, "aquarius"],
    [3, 20, "pisces"],
    [4, 20, "aries"],
    [5, 21, "taurus"],
    [6, 21, "gemini"],
    [7, 22, "cancer"],
    [8, 23, "leo"],
    [9, 23, "virgo"],
    [10, 23, "libra"],
    [11, 22, "scorpio"],
    [12, 22, "sagittarius"],
  ];

  for (let i = 0; i < signs.length; i++) {
    const [m, d] = signs[i];
    if (month === m && day <= d) return t(`editProfile.zodiac_${signs[i][2]}`);
    if (month === m && day > d)
      return t(`editProfile.zodiac_${signs[(i + 1) % 12][2]}`);
  }
  return t("editProfile.zodiac_capricorn");
}
