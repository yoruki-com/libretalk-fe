import { View, Text, Alert, Platform } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { SlideIndicator } from "@/components/ui/SlideIndicator";
import { AuthButton } from "@/components/ui/AuthButton";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import * as AppleAuthentication from "expo-apple-authentication";

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const { signInWithApple, signInWithGoogle, signInWithEmail } = useAuth();
  const [isLoading, setIsLoading] = useState<string | null>(null);

  const handleAppleSignIn = async () => {
    setIsLoading("apple");
    try {
      await signInWithApple();
    } catch (error) {
      Alert.alert(
        "Errore",
        "Si è verificato un errore durante l'accesso con Apple."
      );
    } finally {
      setIsLoading(null);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading("google");
    try {
      await signInWithGoogle();
    } catch (error) {
      Alert.alert(
        "Errore",
        "Si è verificato un errore durante l'accesso con Google."
      );
    } finally {
      setIsLoading(null);
    }
  };

  const handleEmailSignIn = async () => {
    setIsLoading("email");
    try {
      await signInWithEmail();
    } catch (error) {
      Alert.alert("Errore", "Si è verificato un errore durante l'accesso.");
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
          Accedi per iniziare le tue conversazioni!
        </Text>

        {/* Buttons */}
        <View className="gap-4">
          {/* Apple Sign-In (native on iOS) */}
          {Platform.OS === "ios" && (
            <AppleAuthentication.AppleAuthenticationButton
              buttonType={
                AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN
              }
              buttonStyle={
                AppleAuthentication.AppleAuthenticationButtonStyle.BLACK
              }
              cornerRadius={999}
              style={{ height: 56 }}
              onPress={handleAppleSignIn}
            />
          )}

          {/* Apple Sign-In button for Android */}
          {Platform.OS === "android" && (
            <AuthButton
              variant="apple"
              onPress={handleAppleSignIn}
              loading={isLoading === "apple"}
              disabled={isLoading !== null}
            />
          )}

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
            <Text className="text-sm text-gray-500">oppure</Text>
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
            Continuando, accetti i{" "}
            <Text className="font-sans-semibold">Termini di Servizio</Text> e l'
            <Text className="font-sans-semibold">Informativa sulla Privacy</Text>
          </Text>
        </View>
      </View>
    </View>
  );
}
