import { Keyboard, Platform, Pressable, ScrollView, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@/contexts/ThemeContext";

interface CommentInputProps {
  value: string;
  onChangeText: (text: string) => void;
  onSubmit: () => void;
  placeholder?: string;
  isSubmitting?: boolean;
}

export function CommentInput({
  value,
  onChangeText,
  onSubmit,
  placeholder = "Write a comment...",
  isSubmitting = false,
}: CommentInputProps) {
  const insets = useSafeAreaInsets();
  const { height: screenHeight } = useWindowDimensions();
  const maxInputHeight = screenHeight / 4;
  const { theme } = useTheme();
  const canSubmit = value.trim().length > 0 && !isSubmitting;
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    const show = Keyboard.addListener("keyboardDidShow", () => setKeyboardVisible(true));
    const hide = Keyboard.addListener("keyboardDidHide", () => setKeyboardVisible(false));
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  return (
    <View
      className="px-4 pt-4"
      style={{
        paddingBottom: keyboardVisible ? 16 : insets.bottom + 16,
        backgroundColor: theme.background,
        borderTopWidth: 1,
        borderTopColor: theme.border,
      }}
    >
      {/* Input row */}
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
              maxLength={5000}
              editable={!isSubmitting}
              style={{ minHeight: 20, color: theme.text }}
            />
          </ScrollView>

          {/* Send button */}
          <Pressable
            onPress={canSubmit ? onSubmit : undefined}
            disabled={!canSubmit}
            className="h-9 w-9 items-center justify-center rounded-full active:opacity-70"
            style={{
              backgroundColor: canSubmit ? theme.primary : theme.surface,
              opacity: canSubmit ? 1 : 0.6,
            }}
          >
            <Ionicons
              name="send"
              size={16}
              color={canSubmit ? "#FFFFFF" : theme.textTertiary}
            />
          </Pressable>
        </View>
      </View>
    </View>
  );
}
