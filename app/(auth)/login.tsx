import { View, Text, Alert } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { SlideIndicator } from "@/components/ui/SlideIndicator";
import { AuthButton } from "@/components/ui/AuthButton";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import Logo from "@/assets/images/logo.svg";

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { signInWithGoogle, signInWithEmail } = useAuth();
  const [isLoading, setIsLoading] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    setIsLoading("google");
    try {
      await signInWithGoogle();
    } catch (error) {
      Alert.alert(t("common.error"), t("auth.errorGoogle"));
    } finally {
      setIsLoading(null);
    }
  };

  const handleEmailSignIn = async () => {
    setIsLoading("email");
    try {
      await signInWithEmail();
    } catch (error) {
      Alert.alert(t("common.error"), t("auth.errorEmail"));
    } finally {
      setIsLoading(null);
    }
  };

  return (
    <View className="flex-1 bg-white">
      {/* Background with Gradient */}
      <View className="absolute left-0 right-0 top-0 h-[60%]">
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
        {/* Slide Indicator */}
        <View className="mb-8 items-center">
          <SlideIndicator total={3} activeIndex={2} />
        </View>

        {/* Headline */}
        <Text className="mb-8 text-center font-sans-semibold text-heading-4 text-dark">
          {t("auth.loginHeadline")}
        </Text>

        {/* Buttons */}
        <View className="gap-4">
          {/* Google Sign-In */}
          <AuthButton
            variant="google"
            onPress={handleGoogleSignIn}
            loading={isLoading === "google"}
            disabled={isLoading !== null}
          />

          {/* Divider */}
          <View className="my-2 flex-row items-center gap-4">
            <View className="h-px flex-1 bg-gray-200" />
            <Text className="text-sm text-gray-500">{t("common.or")}</Text>
            <View className="h-px flex-1 bg-gray-200" />
          </View>

          {/* Email Sign-In */}
          <AuthButton
            variant="email"
            onPress={handleEmailSignIn}
            loading={isLoading === "email"}
            disabled={isLoading !== null}
          />

          {/* Terms */}
          <Text className="mt-4 text-center text-body-small text-dark opacity-60">
            {t("auth.termsText")}{" "}
            <Text className="font-sans-semibold">{t("auth.termsOfService")}</Text> {t("auth.and")}
            <Text className="font-sans-semibold">{t("auth.privacyPolicy")}</Text>
          </Text>
        </View>
      </View>
    </View>
  );
}
