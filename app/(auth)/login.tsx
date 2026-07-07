import Logo from "@/assets/images/logo.svg";
import { useAuth } from "@/contexts/AuthContext";
import { LinearGradient } from "expo-linear-gradient";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, Alert, Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { performSignIn, performSignUp } = useAuth();
  const [isLoading, setIsLoading] = useState<string | null>(null);

  const handleSignIn = async () => {
    setIsLoading("signIn");
    try {
      await performSignIn();
    } catch {
      Alert.alert(t("common.error"), t("auth.errorEmail"));
    } finally {
      setIsLoading(null);
    }
  };

  const handleSignUp = async () => {
    setIsLoading("signUp");
    try {
      await performSignUp();
    } catch {
      Alert.alert(t("common.error"), t("auth.errorEmail"));
    } finally {
      setIsLoading(null);
    }
  };

  return (
    <View className="flex-1 bg-white">
      {/* Background with Gradient */}
      <View className="absolute left-0 right-0 top-0 h-[80%]">
        <LinearGradient
          colors={["#014AF1", "#4B7BF5", "#A8C4F5"]}
          className="flex-1 items-center justify-center"
        >
          <Logo width={140} height={140} />
        </LinearGradient>
      </View>

      {/* Content Card */}
      <View
        className="absolute bottom-0 left-0 right-0 rounded-t-card bg-white px-4 pb-8 pt-8"
        style={{ paddingBottom: insets.bottom + 32 }}
      >
        {/* Headline */}
        <Text className="mb-8 text-center font-sans-semibold text-heading-4 text-dark">
          {t("auth.getStartedHeadline")}
        </Text>

        {/* Buttons */}
        <View className="gap-4">
          {/* Sign Up (primary) */}
          <Pressable
            onPress={handleSignUp}
            disabled={isLoading !== null}
            className={`flex-row items-center justify-center rounded-button bg-primary px-6 py-4 active:opacity-80 ${isLoading !== null ? "opacity-50" : ""}`}
          >
            {isLoading === "signUp" ? (
              <ActivityIndicator size="small" color="#F5F5F5" />
            ) : (
              <Text className="font-sans-semibold text-link-normal text-light">
                {t("auth.signUp")}
              </Text>
            )}
          </Pressable>

          {/* Sign In (secondary/outline) */}
          <Pressable
            onPress={handleSignIn}
            disabled={isLoading !== null}
            className={`flex-row items-center justify-center rounded-button border-2 border-primary bg-white px-6 py-4 active:opacity-80 ${isLoading !== null ? "opacity-50" : ""}`}
          >
            {isLoading === "signIn" ? (
              <ActivityIndicator size="small" color="#014AF1" />
            ) : (
              <Text className="font-sans-semibold text-link-normal text-primary">
                {t("auth.login")}
              </Text>
            )}
          </Pressable>

          {/* Terms */}
          <Text className="mt-4 text-center text-body-small text-dark opacity-60">
            {t("auth.termsText")}{" "}
            <Text className="font-sans-semibold">
              {t("auth.termsOfService")}
            </Text>{" "}
            {t("auth.and")}
            <Text className="font-sans-semibold">
              {t("auth.privacyPolicy")}
            </Text>
          </Text>
        </View>
      </View>
    </View>
  );
}
