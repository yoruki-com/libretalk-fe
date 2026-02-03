import { View, TextInput, Pressable, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/contexts/ThemeContext";

interface CommentInputProps {
  value: string;
  onChangeText: (text: string) => void;
  onSubmit: () => void;
  avatarUrl?: string | null;
  placeholder?: string;
  isSubmitting?: boolean;
}

export function CommentInput({
  value,
  onChangeText,
  onSubmit,
  avatarUrl,
  placeholder = "Write a comment...",
  isSubmitting = false,
}: CommentInputProps) {
  const { theme } = useTheme();
  const canSubmit = value.trim().length > 0 && !isSubmitting;

  return (
    <View
      className="flex-row items-center gap-3 px-4 py-3"
      style={{
        backgroundColor: theme.card,
        borderTopWidth: 1,
        borderTopColor: theme.border,
      }}
    >
      {/* Avatar */}
      {avatarUrl ? (
        <Image
          source={{ uri: avatarUrl }}
          className="h-9 w-9 rounded-full"
          style={{ backgroundColor: theme.surface }}
        />
      ) : (
        <View
          className="h-9 w-9 items-center justify-center rounded-full"
          style={{ backgroundColor: theme.primaryLight }}
        >
          <Ionicons name="person" size={18} color={theme.primary} />
        </View>
      )}

      {/* Input */}
      <View
        className="flex-1 flex-row items-center rounded-full px-4 py-2"
        style={{ backgroundColor: theme.surface }}
      >
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={theme.textTertiary}
          className="flex-1 font-sans text-[14px]"
          style={{ color: theme.text }}
          multiline
          maxLength={500}
          editable={!isSubmitting}
        />
      </View>

      {/* Submit button */}
      <Pressable
        onPress={canSubmit ? onSubmit : undefined}
        className="h-9 w-9 items-center justify-center rounded-full"
        style={{
          backgroundColor: canSubmit ? theme.primary : theme.surface,
          opacity: canSubmit ? 1 : 0.6,
        }}
        disabled={!canSubmit}
      >
        <Ionicons
          name="send"
          size={18}
          color={canSubmit ? "#FFFFFF" : theme.textTertiary}
        />
      </Pressable>
    </View>
  );
}
