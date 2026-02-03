import { View, TextInput, Pressable, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";

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
  const canSubmit = value.trim().length > 0 && !isSubmitting;

  return (
    <View className="flex-row items-center gap-3 border-t border-gray6 bg-white px-4 py-3">
      {/* Avatar */}
      {avatarUrl ? (
        <Image
          source={{ uri: avatarUrl }}
          className="h-9 w-9 rounded-full bg-gray4"
        />
      ) : (
        <View className="h-9 w-9 items-center justify-center rounded-full bg-primary-30">
          <Ionicons name="person" size={18} color="#014AF1" />
        </View>
      )}

      {/* Input */}
      <View className="flex-1 flex-row items-center rounded-full bg-gray6 px-4 py-2">
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#949494"
          className="flex-1 font-sans text-[14px] text-dark"
          multiline
          maxLength={500}
          editable={!isSubmitting}
        />
      </View>

      {/* Submit button */}
      <Pressable
        onPress={canSubmit ? onSubmit : undefined}
        className={`h-9 w-9 items-center justify-center rounded-full ${
          canSubmit ? "bg-primary active:opacity-70" : "bg-gray4"
        }`}
        disabled={!canSubmit}
      >
        <Ionicons
          name="send"
          size={18}
          color={canSubmit ? "#FFFFFF" : "#949494"}
        />
      </Pressable>
    </View>
  );
}
