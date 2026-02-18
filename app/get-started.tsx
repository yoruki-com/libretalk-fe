import { View, Text } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/Button";
import { SlideIndicator } from "@/components/ui/SlideIndicator";
import { Routes } from "@/constants/routes";

export default function GetStarted() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { t } = useTranslation();

  const handleGoogleLogin = () => {
    console.log("Google login pressed");
    router.replace(Routes.TABS_CHAT);
  };

  return (
    <View className="flex-1 bg-white">
      {/* Background with Gradient */}
      <View className="absolute left-0 right-0 top-0 h-[60%]">
        <LinearGradient
          colors={["#014AF1", "#4B7BF5", "#A8C4F5"]}
          className="flex-1"
        />
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
          {t("auth.getStartedHeadline")}
        </Text>

        {/* Form */}
        <View className="gap-4">
          <Button variant="google" onPress={handleGoogleLogin} />

          {/* Terms */}
          <Text className="mt-2 text-center text-body-small text-dark opacity-80">
            {t("auth.termsText")}{" "}
            <Text className="font-sans-semibold">{t("auth.termsOfService")}</Text> {t("auth.and")}{" "}
            <Text className="font-sans-semibold">{t("auth.privacyPolicy")}</Text>
          </Text>
        </View>
      </View>
    </View>
  );
}
