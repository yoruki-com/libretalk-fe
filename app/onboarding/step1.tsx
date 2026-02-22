import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { usersApi } from "@/services/api/users";
import { SlideIndicator } from "@/components/ui/SlideIndicator";
import { CityPicker } from "@/components/ui/CityPicker";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Routes } from "@/constants/routes";
import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import DateTimePicker from "@react-native-community/datetimepicker";

export default function OnboardingStep1() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { isAuthenticated, hasAccessToken } = useAuth();
  const { profile } = useCurrentUser(isAuthenticated && hasAccessToken);

  const [displayName, setDisplayName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [city, setCity] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.displayName ?? "");
      setCity(profile.city ?? "");
      if (profile.dateOfBirth) {
        setDateOfBirth(new Date(profile.dateOfBirth));
      }
    }
  }, [profile]);

  const handleDateChange = useCallback(
    (event: { type: string; nativeEvent: { timestamp: number } }, selectedDate?: Date) => {
      if (Platform.OS === "android") {
        setShowDatePicker(false);
      }
      if (event.type === "dismissed") return;

      const date = selectedDate ?? new Date(event.nativeEvent.timestamp);
      setDateOfBirth(date);
    },
    [],
  );

  const isValid = displayName.trim().length > 0 && dateOfBirth !== null && city.trim().length > 0;

  const handleNext = async () => {
    if (!isValid) return;
    setIsSaving(true);
    try {
      await usersApi.updateMe({
        displayName: displayName.trim(),
        dateOfBirth: dateOfBirth!.toISOString(),
        city: city.trim(),
      });
      router.push(Routes.ONBOARDING_STEP2 as never);
    } catch {
      Alert.alert(t("common.error"), t("onboarding.saveError"));
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
      <View className="items-center px-4 py-4">
        <SlideIndicator total={3} activeIndex={0} />
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 24, paddingBottom: 120 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Title */}
        <Text
          className="mb-2 font-sans-bold text-[28px]"
          style={{ color: theme.text }}
        >
          {t("onboarding.step1Title")}
        </Text>
        <Text
          className="mb-8 font-sans text-[16px]"
          style={{ color: theme.textSecondary }}
        >
          {t("onboarding.step1Subtitle")}
        </Text>

        {/* Display Name */}
        <View className="mb-6">
          <Text
            className="mb-2 font-sans-semibold text-[14px]"
            style={{ color: theme.text }}
          >
            {t("onboarding.displayName")}
            <Text style={{ color: "#EF4444" }}> *</Text>
          </Text>
          <View
            className="rounded-2xl px-4 py-3"
            style={{ backgroundColor: theme.card, borderWidth: 1, borderColor: theme.border }}
          >
            <TextInput
              value={displayName}
              onChangeText={setDisplayName}
              placeholder={t("onboarding.displayNamePlaceholder")}
              placeholderTextColor={theme.textTertiary}
              className="font-sans text-[16px]"
              style={{ color: theme.text, padding: 0 }}
              maxLength={100}
            />
          </View>
        </View>

        {/* Date of Birth */}
        <View className="mb-6">
          <Text
            className="mb-2 font-sans-semibold text-[14px]"
            style={{ color: theme.text }}
          >
            {t("onboarding.dateOfBirth")}
            <Text style={{ color: "#EF4444" }}> *</Text>
          </Text>
          <Pressable
            onPress={() => setShowDatePicker(true)}
            className="flex-row items-center rounded-2xl px-4 py-3"
            style={{ backgroundColor: theme.card, borderWidth: 1, borderColor: theme.border }}
          >
            <Ionicons
              name="calendar-outline"
              size={20}
              color={dateOfBirth ? theme.text : theme.textTertiary}
              style={{ marginRight: 8 }}
            />
            <Text
              className="font-sans text-[16px]"
              style={{ color: dateOfBirth ? theme.text : theme.textTertiary }}
            >
              {dateOfBirth
                ? dateOfBirth.toLocaleDateString()
                : t("onboarding.dateOfBirthPlaceholder")}
            </Text>
          </Pressable>
          {(showDatePicker || Platform.OS === "ios") && (
            <View style={{ marginTop: Platform.OS === "ios" ? 8 : 0 }}>
              <DateTimePicker
                value={dateOfBirth ?? new Date(2000, 0, 1)}
                mode="date"
                display={Platform.OS === "ios" ? "spinner" : "default"}
                onChange={handleDateChange}
                maximumDate={new Date()}
                minimumDate={new Date(1920, 0, 1)}
              />
              {Platform.OS === "ios" && (
                <Pressable
                  onPress={() => setShowDatePicker(false)}
                  className="mt-2 items-center"
                >
                  <Text
                    className="font-sans-semibold text-[14px]"
                    style={{ color: theme.primary }}
                  >
                    {t("common.done")}
                  </Text>
                </Pressable>
              )}
            </View>
          )}
        </View>

        {/* City */}
        <View className="mb-6">
          <Text
            className="mb-2 font-sans-semibold text-[14px]"
            style={{ color: theme.text }}
          >
            {t("onboarding.city")}
            <Text style={{ color: "#EF4444" }}> *</Text>
          </Text>
          <CityPicker
            value={city}
            onSelect={setCity}
            placeholder={t("onboarding.cityPlaceholder")}
          />
        </View>
      </ScrollView>

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
