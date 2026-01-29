import { View, Text } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Button } from "@/components/ui/Button";
import { SlideIndicator } from "@/components/ui/SlideIndicator";

export default function GetStarted() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const handleGoogleLogin = () => {
    console.log("Google login pressed");
    router.replace("/(tabs)/chat");
  };

  const handleAppleLogin = () => {
    console.log("Apple login pressed");
    router.replace("/(tabs)/chat");
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
        <Text className="mb-8 text-center font-open-sans text-heading-4 text-dark">
          Platform for Seamless Messaging and Connected Conversations!
        </Text>

        {/* Form */}
        <View className="gap-4">
          <Button variant="google" onPress={handleGoogleLogin} />
          <Button variant="apple" onPress={handleAppleLogin} />

          {/* Terms */}
          <Text className="mt-2 text-center text-body-small text-dark opacity-80">
            By continuing, you agree to the{" "}
            <Text className="font-inter-semibold">Terms of Service</Text> &{" "}
            <Text className="font-inter-semibold">Privacy Policy</Text>
          </Text>
        </View>
      </View>
    </View>
  );
}
