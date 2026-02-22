import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { usersApi } from "@/services/api/users";
import { SlideIndicator } from "@/components/ui/SlideIndicator";
import { CityPicker } from "@/components/ui/CityPicker";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Routes } from "@/constants/routes";
import { useState, useEffect, useCallback, useRef } from "react";
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

const USERNAME_REGEX = /^[a-zA-Z0-9_]+$/;
const USERNAME_MIN = 3;
const USERNAME_DEBOUNCE_MS = 500;

type UsernameStatus = "idle" | "checking" | "available" | "taken" | "invalid";

export default function OnboardingStep1() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { isAuthenticated, hasAccessToken, user: authUser } = useAuth();
  const { profile } = useCurrentUser(isAuthenticated && hasAccessToken);

  const [username, setUsername] = useState("");
  const [usernameStatus, setUsernameStatus] = useState<UsernameStatus>("idle");
  const [displayName, setDisplayName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [city, setCity] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const initialUsernameRef = useRef<string>("");

  useEffect(() => {
    if (profile) {
      setUsername(profile.username ?? "");
      initialUsernameRef.current = profile.username ?? "";

      // Pre-fill displayName from Google/Logto if the profile name is auto-generated
      if (!profile.displayName || profile.displayName === profile.username) {
        setDisplayName(authUser?.name ?? profile.displayName ?? "");
      } else {
        setDisplayName(profile.displayName ?? "");
      }

      setCity(profile.city ?? "");
      if (profile.dateOfBirth) {
        setDateOfBirth(new Date(profile.dateOfBirth));
      }
    }
  }, [profile, authUser?.name]);

  const checkUsernameAvailability = useCallback(async (value: string) => {
    if (value.length < USERNAME_MIN || !USERNAME_REGEX.test(value)) {
      setUsernameStatus("invalid");
      return;
    }

    setUsernameStatus("checking");
    try {
      const res = await usersApi.checkUsername(value);
      setUsernameStatus(res.data.available ? "available" : "taken");
    } catch {
      // On network error, don't block — treat as idle
      setUsernameStatus("idle");
    }
  }, []);

  const handleUsernameChange = useCallback(
    (value: string) => {
      const sanitized = value.toLowerCase().replace(/[^a-z0-9_]/g, "");
      setUsername(sanitized);

      if (debounceRef.current) clearTimeout(debounceRef.current);

      if (sanitized.length === 0) {
        setUsernameStatus("idle");
        return;
      }

      if (sanitized.length < USERNAME_MIN || !USERNAME_REGEX.test(sanitized)) {
        setUsernameStatus("invalid");
        return;
      }

      // Skip check if unchanged from server value
      if (sanitized === initialUsernameRef.current) {
        setUsernameStatus("available");
        return;
      }

      setUsernameStatus("checking");
      debounceRef.current = setTimeout(() => {
        checkUsernameAvailability(sanitized);
      }, USERNAME_DEBOUNCE_MS);
    },
    [checkUsernameAvailability],
  );

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

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

  const isUsernameValid = username.length >= USERNAME_MIN && usernameStatus === "available";
  const isValid =
    isUsernameValid &&
    displayName.trim().length > 0 &&
    dateOfBirth !== null &&
    city.trim().length > 0;

  const handleNext = async () => {
    if (!isValid) return;
    setIsSaving(true);
    try {
      await usersApi.updateMe({
        username,
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

  const renderUsernameStatus = () => {
    switch (usernameStatus) {
      case "checking":
        return (
          <View className="mt-1 flex-row items-center">
            <ActivityIndicator size="small" color={theme.textSecondary} style={{ marginRight: 4 }} />
            <Text className="font-sans text-[12px]" style={{ color: theme.textSecondary }}>
              {t("onboarding.usernameChecking")}
            </Text>
          </View>
        );
      case "available":
        return (
          <View className="mt-1 flex-row items-center">
            <Ionicons name="checkmark-circle" size={14} color="#22C55E" style={{ marginRight: 4 }} />
            <Text className="font-sans text-[12px]" style={{ color: "#22C55E" }}>
              {t("onboarding.usernameAvailable")}
            </Text>
          </View>
        );
      case "taken":
        return (
          <View className="mt-1 flex-row items-center">
            <Ionicons name="close-circle" size={14} color="#EF4444" style={{ marginRight: 4 }} />
            <Text className="font-sans text-[12px]" style={{ color: "#EF4444" }}>
              {t("onboarding.usernameTaken")}
            </Text>
          </View>
        );
      case "invalid":
        return (
          <View className="mt-1 flex-row items-center">
            <Ionicons name="close-circle" size={14} color="#EF4444" style={{ marginRight: 4 }} />
            <Text className="font-sans text-[12px]" style={{ color: "#EF4444" }}>
              {t("onboarding.usernameInvalid")}
            </Text>
          </View>
        );
      default:
        return null;
    }
  };

  const usernameBorderColor =
    usernameStatus === "available"
      ? "#22C55E"
      : usernameStatus === "taken" || usernameStatus === "invalid"
        ? "#EF4444"
        : theme.border;

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

        {/* Username */}
        <View className="mb-6">
          <Text
            className="mb-2 font-sans-semibold text-[14px]"
            style={{ color: theme.text }}
          >
            {t("onboarding.username")}
            <Text style={{ color: "#EF4444" }}> *</Text>
          </Text>
          <View
            className="flex-row items-center rounded-2xl px-4 py-3"
            style={{ backgroundColor: theme.card, borderWidth: 1, borderColor: usernameBorderColor }}
          >
            <Text
              className="font-sans text-[16px]"
              style={{ color: theme.textTertiary, marginRight: 2 }}
            >
              @
            </Text>
            <TextInput
              value={username}
              onChangeText={handleUsernameChange}
              placeholder={t("onboarding.usernamePlaceholder")}
              placeholderTextColor={theme.textTertiary}
              className="flex-1 font-sans text-[16px]"
              style={{ color: theme.text, padding: 0 }}
              maxLength={50}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
          {renderUsernameStatus()}
        </View>

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
