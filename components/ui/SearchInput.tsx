import { View, TextInput, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/contexts/ThemeContext";

interface SearchInputProps {
  placeholder?: string;
  value?: string;
  onChangeText?: (text: string) => void;
  onPress?: () => void;
}

export function SearchInput({
  placeholder = "Ask Chatterly AI or Search",
  value,
  onChangeText,
  onPress,
}: SearchInputProps) {
  const { theme } = useTheme();

  return (
    <Pressable onPress={onPress}>
      <View
        className="flex-row items-center gap-1.5 rounded-full px-2.5 py-1.5"
        style={{ backgroundColor: theme.surface }}
      >
        <Ionicons name="search" size={14} color={theme.iconSecondary} />
        <TextInput
          className="flex-1 font-sans text-[12px]"
          style={{ color: theme.text }}
          placeholder={placeholder}
          placeholderTextColor={theme.textTertiary}
          value={value}
          onChangeText={onChangeText}
          editable={!onPress}
        />
      </View>
    </Pressable>
  );
}
