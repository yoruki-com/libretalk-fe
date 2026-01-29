import { Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type ButtonVariant = "google" | "apple";

interface ButtonProps {
  variant: ButtonVariant;
  onPress?: () => void;
}

const variantStyles = {
  google: {
    container: "bg-[#218FFD]",
    text: "text-light",
    icon: "logo-google" as const,
  },
  apple: {
    container: "bg-dark",
    text: "text-light",
    icon: "logo-apple" as const,
  },
};

const buttonLabels = {
  google: "Continue With Google",
  apple: "Continue With Apple",
};

export function Button({ variant, onPress }: ButtonProps) {
  const styles = variantStyles[variant];

  return (
    <Pressable
      onPress={onPress}
      className={`${styles.container} flex-row items-center justify-center gap-3 rounded-button px-6 py-4 active:opacity-80`}
    >
      <Ionicons name={styles.icon} size={20} color="#F5F5F5" />
      <Text
        className={`${styles.text} text-link-normal font-inter-semibold capitalize`}
      >
        {buttonLabels[variant]}
      </Text>
    </Pressable>
  );
}
