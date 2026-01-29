import { View, TextInput, Pressable, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface ChatInputProps {
  value?: string;
  onChangeText?: (text: string) => void;
  onSend?: () => void;
  onAttachPress?: () => void;
  onCameraPress?: () => void;
  onMicPress?: () => void;
  typingUser?: string;
  placeholder?: string;
}

export function ChatInput({
  value,
  onChangeText,
  onSend,
  onAttachPress,
  onCameraPress,
  onMicPress,
  typingUser,
  placeholder = "Type Here...",
}: ChatInputProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      className="border-t border-border bg-white px-4 pt-4"
      style={{ paddingBottom: insets.bottom + 16 }}
    >
      {/* Typing indicator */}
      {typingUser && (
        <Text className="mb-4 font-sans text-[12px] leading-[15px] text-dark">
          <Text className="font-sans-semibold italic">{typingUser},</Text>
          <Text className="italic"> is typing...</Text>
        </Text>
      )}

      {/* Input field */}
      <View className="flex-row items-center gap-4 rounded-full bg-light px-4 py-3">
        {/* Attach button */}
        <Pressable onPress={onAttachPress} className="active:opacity-70">
          <Ionicons name="add" size={20} color="#131313" />
        </Pressable>

        {/* Text input */}
        <TextInput
          className="flex-1 font-sans text-[14px] text-dark"
          placeholder={placeholder}
          placeholderTextColor="rgba(19, 19, 19, 0.3)"
          value={value}
          onChangeText={onChangeText}
          multiline
        />

        {/* Action buttons */}
        <View className="flex-row items-center gap-2">
          <Pressable
            onPress={onCameraPress}
            className="h-8 w-8 items-center justify-center rounded-full bg-light active:opacity-70"
          >
            <Ionicons name="camera" size={16} color="#131313" />
          </Pressable>
          <Pressable
            onPress={onMicPress}
            className="h-8 w-8 items-center justify-center rounded-full bg-light active:opacity-70"
          >
            <Ionicons name="mic" size={16} color="#131313" />
          </Pressable>
          <View className="mx-1 h-6 w-px bg-border" />
          <Pressable
            onPress={onSend}
            className="h-8 w-8 items-center justify-center rounded-full bg-light active:opacity-70"
          >
            <Ionicons name="send" size={14} color="#014AF1" />
          </Pressable>
        </View>
      </View>
    </View>
  );
}
