import { Pressable, Text, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";

type AuthButtonVariant = "google" | "email";

interface AuthButtonProps {
  variant: AuthButtonVariant;
  onPress?: () => void;
  disabled?: boolean;
  loading?: boolean;
}

const variantStyles = {
  google: {
    container: "bg-[#218FFD]",
    text: "text-light",
    icon: "logo-google" as const,
    iconColor: "#F5F5F5",
  },
  email: {
    container: "bg-primary",
    text: "text-light",
    icon: "mail-outline" as const,
    iconColor: "#F5F5F5",
  },
};

const buttonLabelKeys: Record<AuthButtonVariant, string> = {
  google: "auth.continueWithGoogle",
  email: "auth.continueWithEmail",
};

export function AuthButton({
  variant,
  onPress,
  disabled,
  loading,
}: AuthButtonProps) {
  const { t } = useTranslation();
  const styles = variantStyles[variant];
  const isDisabled = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      className={`${styles.container} flex-row items-center justify-center gap-3 rounded-button px-6 py-4 active:opacity-80 ${isDisabled ? "opacity-50" : ""}`}
    >
      {loading ? (
        <ActivityIndicator size="small" color={styles.iconColor} />
      ) : (
        <>
          <Ionicons name={styles.icon} size={20} color={styles.iconColor} />
          <Text
            className={`${styles.text} font-sans-semibold text-link-normal capitalize`}
          >
            {t(buttonLabelKeys[variant])}
          </Text>
        </>
      )}
    </Pressable>
  );
}
