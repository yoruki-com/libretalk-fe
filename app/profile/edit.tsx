import { useTheme } from "@/contexts/ThemeContext";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useAvatarUpload } from "@/hooks/useAvatarUpload";
import { usersApi } from "@/services/api/users";
import type { Gender, UpdateUserDto } from "@/services/api/types";
import type { Theme } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActionSheetIOS,
  ActivityIndicator,
  Alert,
  Image,
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
  const { pendingAvatarUri, isUploading, pickAvatar, uploadAvatar } = useAvatarUpload();

  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [personalityType, setPersonalityType] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [gender, setGender] = useState<Gender | null>(null);
  const [city, setCity] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.displayName ?? "");
      setBio(profile.bio ?? "");
      setPersonalityType(profile.personalityType ?? "");
      setJobTitle(profile.jobTitle ?? "");
      setGender(profile.gender);
      setCity(profile.city ?? "");
    }
  }, [profile]);

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
      await refresh();
      router.back();
    } catch {
      Alert.alert(t("common.error"), t("editProfile.saveError"));
    } finally {
      setIsSaving(false);
    }
  };

  const genderOptions: Gender[] = ["MALE", "FEMALE", "OTHER", "PREFER_NOT_TO_SAY"];

  const handleGenderPress = () => {
    const labels = genderOptions.map((g) => t(`editProfile.gender_${g}`));
    const cancelLabel = t("common.cancel");

    if (Platform.OS === "ios") {
      ActionSheetIOS.showActionSheetWithOptions(
        { options: [...labels, cancelLabel], cancelButtonIndex: labels.length },
        (index) => {
          if (index < genderOptions.length) setGender(genderOptions[index]);
        }
      );
    } else {
      Alert.alert(
        t("editProfile.gender"),
        undefined,
        [
          ...genderOptions.map((g, i) => ({
            text: labels[i],
            onPress: () => setGender(g),
          })),
          { text: cancelLabel, style: "cancel" as const },
        ]
      );
    }
  };

  const zodiacSign = profile?.dateOfBirth ? getZodiacSign(profile.dateOfBirth, t) : null;

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

  const nativeLanguages =
    profile.languages?.filter((l) => !l.isLearning) ?? [];
  const learningLanguages =
    profile.languages?.filter((l) => l.isLearning) ?? [];

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
          <Pressable onPress={pickAvatar} disabled={isUploading} className="active:opacity-70">
            {(pendingAvatarUri ?? profile.avatarUrl) ? (
              <Image
                source={{ uri: pendingAvatarUri ?? profile.avatarUrl! }}
                className="h-24 w-24 rounded-full"
                resizeMode="cover"
              />
            ) : (
              <View
                className="h-24 w-24 items-center justify-center rounded-full"
                style={{ backgroundColor: theme.surface }}
              >
                <Ionicons
                  name="person"
                  size={40}
                  color={theme.iconSecondary}
                />
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
            <Text
              className="font-sans text-[15px]"
              style={{ color: theme.text }}
            >
              {nativeLanguages.map((l) => l.name).join(", ") || "—"}
            </Text>
          </FieldRow>
          <Divider theme={theme} />
          <FieldRow label={t("editProfile.learning")} theme={theme}>
            <Text
              className="font-sans text-[15px]"
              style={{ color: theme.text }}
            >
              {learningLanguages.map((l) => l.name).join(", ") || "—"}
            </Text>
          </FieldRow>
        </SectionCard>

        {/* Interests */}
        <SectionHeader label={t("editProfile.interests")} theme={theme} />
        <SectionCard theme={theme}>
          <IconRow
            icon="musical-notes"
            iconBg="#6C5CE7"
            label={t("editProfile.hobbies")}
            theme={theme}
          />
          <Divider theme={theme} />
          <IconRow
            icon="airplane"
            iconBg="#0984E3"
            label={t("editProfile.travelDestinations")}
            theme={theme}
          />
        </SectionCard>

        {/* Personal Info */}
        <SectionHeader label={t("editProfile.personalInfo")} theme={theme} />
        <SectionCard theme={theme}>
          <IconRow
            icon="happy-outline"
            iconBg="#6C5CE7"
            label={t("editProfile.myMbti")}
            value={personalityType || undefined}
            theme={theme}
          >
            <TextInput
              value={personalityType}
              onChangeText={setPersonalityType}
              className="font-sans text-[15px]"
              style={{ color: theme.text, padding: 0, minWidth: 60 }}
              placeholder="—"
              placeholderTextColor={theme.textTertiary}
              autoCapitalize="characters"
              maxLength={4}
            />
          </IconRow>
        </SectionCard>

        <SectionCard theme={theme}>
          <IconRow
            icon="home"
            iconBg="#00B894"
            label={t("editProfile.myCity")}
            theme={theme}
          >
            <TextInput
              value={city}
              onChangeText={setCity}
              className="font-sans text-[15px]"
              style={{ color: theme.text, padding: 0, minWidth: 60 }}
              placeholder="—"
              placeholderTextColor={theme.textTertiary}
            />
          </IconRow>
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
            <Pressable onPress={handleGenderPress} className="flex-row items-center justify-between active:opacity-70">
              <Text
                className="font-sans text-[15px]"
                style={{ color: theme.text }}
              >
                {gender ? t(`editProfile.gender_${gender}`) : "—"}
              </Text>
              <Ionicons name="chevron-forward" size={14} color={theme.textTertiary} />
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
    [1, 20, "capricorn"], [2, 19, "aquarius"], [3, 20, "pisces"],
    [4, 20, "aries"], [5, 21, "taurus"], [6, 21, "gemini"],
    [7, 22, "cancer"], [8, 23, "leo"], [9, 23, "virgo"],
    [10, 23, "libra"], [11, 22, "scorpio"], [12, 22, "sagittarius"],
  ];

  for (let i = 0; i < signs.length; i++) {
    const [m, d] = signs[i];
    if (month === m && day <= d) return t(`editProfile.zodiac_${signs[i][2]}`);
    if (month === m && day > d) return t(`editProfile.zodiac_${signs[(i + 1) % 12][2]}`);
  }
  return t("editProfile.zodiac_capricorn");
}
