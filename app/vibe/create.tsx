import { useTheme } from "@/contexts/ThemeContext";
import { vibesApi } from "@/services/api/vibes";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const MAX_LENGTH = 10000;

export default function CreateVibeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { theme } = useTheme();

  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canSend = content.trim().length > 0 && !isSubmitting;

  const handleSend = async () => {
    if (!canSend) return;

    setIsSubmitting(true);
    try {
      await vibesApi.create({ content: content.trim() });
      router.back();
    } catch {
      Alert.alert(t("vibes.vibeCreateError"));
      setIsSubmitting(false);
    }
  };

  return (
    <View className="flex-1" style={{ backgroundColor: theme.background }}>
      {/* Header */}
      <View
        className="flex-row items-center justify-between px-4 pb-3"
        style={{
          paddingTop: insets.top + 8,
          backgroundColor: theme.background,
          borderBottomWidth: 1,
          borderBottomColor: theme.border,
        }}
      >
        <Pressable
          onPress={() => router.back()}
          className="h-9 w-9 items-center justify-center rounded-full active:opacity-70"
        >
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </Pressable>

        <Text
          className="font-sans-semibold text-[17px]"
          style={{ color: theme.text }}
        >
          {t("vibes.createTitle")}
        </Text>

        <Pressable
          onPress={handleSend}
          disabled={!canSend}
          className="rounded-full px-4 py-1.5 active:opacity-70"
          style={{
            backgroundColor: canSend ? theme.primary : theme.card,
          }}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text
              className="font-sans-semibold text-[15px]"
              style={{
                color: canSend ? "#FFFFFF" : theme.textSecondary,
              }}
            >
              {t("vibes.send")}
            </Text>
          )}
        </Pressable>
      </View>

      {/* Content */}
      <KeyboardAvoidingView
        className="flex-1"
        behavior="padding"
      >
        <ScrollView
          className="flex-1"
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ flexGrow: 1 }}
        >
          <TextInput
            className="flex-1 px-4 pt-4 font-sans text-[16px]"
            style={{
              color: theme.text,
              minHeight: 150,
              textAlignVertical: "top",
            }}
            placeholder={t("vibes.contentPlaceholder")}
            placeholderTextColor={theme.textSecondary}
            multiline
            autoFocus
            maxLength={MAX_LENGTH}
            value={content}
            onChangeText={setContent}
            editable={!isSubmitting}
          />

          {/* Character counter */}
          {content.length > 0 && (
            <View className="px-4 pb-2">
              <Text
                className="font-sans text-[12px] text-right"
                style={{ color: theme.textSecondary }}
              >
                {content.length} / {MAX_LENGTH}
              </Text>
            </View>
          )}
        </ScrollView>

        {/* Attachment strip */}
        <View
          className="flex-row gap-3 px-4 py-3"
          style={{
            borderTopWidth: 1,
            borderTopColor: theme.border,
            paddingBottom: insets.bottom + 8,
          }}
        >
          <Pressable
            onPress={() => Alert.alert(t("vibes.comingSoon"))}
            className="flex-row items-center gap-1.5 rounded-full px-4 py-2 active:opacity-70"
            style={{ backgroundColor: theme.card }}
          >
            <Ionicons
              name="image-outline"
              size={18}
              color={theme.textSecondary}
            />
            <Text
              className="font-sans text-[13px]"
              style={{ color: theme.textSecondary }}
            >
              {t("vibes.attachPhoto")}
            </Text>
          </Pressable>

          <Pressable
            onPress={() => Alert.alert(t("vibes.comingSoon"))}
            className="flex-row items-center gap-1.5 rounded-full px-4 py-2 active:opacity-70"
            style={{ backgroundColor: theme.card }}
          >
            <Ionicons
              name="mic-outline"
              size={18}
              color={theme.textSecondary}
            />
            <Text
              className="font-sans text-[13px]"
              style={{ color: theme.textSecondary }}
            >
              {t("vibes.attachAudio")}
            </Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}
