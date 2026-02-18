import { Ionicons } from "@expo/vector-icons";
import {
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@/contexts/ThemeContext";

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
  const { theme } = useTheme();

  return (
    <View
      className="px-4 pt-4"
      style={{
        paddingBottom: insets.bottom + 16,
        backgroundColor: theme.background,
        borderTopWidth: 1,
        borderTopColor: theme.border,
      }}
    >
      {/* Typing indicator */}
      {typingUser && (
        <Text
          className="mb-4 font-sans text-[12px] leading-[15px]"
          style={{ color: theme.textSecondary }}
        >
          <Text className="font-sans-semibold italic">{typingUser},</Text>
          <Text className="italic"> is typing...</Text>
        </Text>
      )}

      {/* Input row - items-end to anchor buttons to bottom */}
      <View className="flex-row items-end gap-3">
        {/* Input container */}
        <View
          className="flex-1 flex-row items-center gap-3 rounded-2xl px-4 py-2"
          style={{ backgroundColor: theme.surface }}
        >
          {/* Text input with scrollbar */}
          <ScrollView
            style={{ maxHeight: maxInputHeight, flex: 1 }}
            showsVerticalScrollIndicator
            persistentScrollbar={Platform.OS === "android"}
            nestedScrollEnabled
            keyboardShouldPersistTaps="handled"
          >
            <TextInput
              className="font-sans text-[14px]"
              placeholder={placeholder}
              placeholderTextColor={theme.textTertiary}
              value={value}
              onChangeText={onChangeText}
              multiline
              scrollEnabled={false}
              style={{ minHeight: 20, color: theme.text }}
            />
          </ScrollView>

          {/* Send button - in the middle */}
          <Pressable
            onPress={onSend}
            className="h-9 w-9 items-center justify-center rounded-full active:opacity-70"
            style={{ backgroundColor: theme.primary }}
          >
            <Ionicons name="send" size={16} color="#FFFFFF" />
          </Pressable>
        </View>
      </View>
    </View>
  );
}
