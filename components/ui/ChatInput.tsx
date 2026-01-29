import { View, TextInput, Pressable, Text, useWindowDimensions, ScrollView, Platform } from "react-native";
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
  const { height: screenHeight } = useWindowDimensions();
  const maxInputHeight = screenHeight / 4;

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

      {/* Input row - items-end to anchor buttons to bottom */}
      <View className="flex-row items-end gap-3">
        {/* Input container */}
        <View className="flex-1 flex-row items-end gap-3 rounded-2xl bg-light px-4 py-3">
          {/* Attach button */}
          <Pressable onPress={onAttachPress} className="mb-0.5 active:opacity-70">
            <Ionicons name="add" size={20} color="#131313" />
          </Pressable>

          {/* Text input with scrollbar */}
          <ScrollView
            style={{ maxHeight: maxInputHeight, flex: 1 }}
            showsVerticalScrollIndicator
            persistentScrollbar={Platform.OS === "android"}
            nestedScrollEnabled
            keyboardShouldPersistTaps="handled"
          >
            <TextInput
              className="font-sans text-[14px] text-dark"
              placeholder={placeholder}
              placeholderTextColor="rgba(19, 19, 19, 0.3)"
              value={value}
              onChangeText={onChangeText}
              multiline
              scrollEnabled={false}
              style={{ minHeight: 20 }}
            />
          </ScrollView>

          {/* Action buttons */}
          <View className="flex-row items-center gap-2">
            <Pressable
              onPress={onCameraPress}
              className="h-8 w-8 items-center justify-center rounded-full active:opacity-70"
            >
              <Ionicons name="camera" size={16} color="#131313" />
            </Pressable>
            <Pressable
              onPress={onMicPress}
              className="h-8 w-8 items-center justify-center rounded-full active:opacity-70"
            >
              <Ionicons name="mic" size={16} color="#131313" />
            </Pressable>
          </View>
        </View>

        {/* Send button - outside */}
        <Pressable
          onPress={onSend}
          className="h-11 w-11 items-center justify-center rounded-full bg-primary active:opacity-70"
        >
          <Ionicons name="send" size={18} color="#FFFFFF" />
        </Pressable>
      </View>
    </View>
  );
}
