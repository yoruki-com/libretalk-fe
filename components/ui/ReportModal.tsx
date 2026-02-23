import { useTheme } from "@/contexts/ThemeContext";
import { ReportReasonValues, type ReportReason } from "@/services/api/reports";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from "react-native";

interface ReportModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (reason: ReportReason, description?: string) => Promise<void>;
}

export function ReportModal({ visible, onClose, onSubmit }: ReportModalProps) {
  const { theme } = useTheme();
  const { t } = useTranslation();

  const [selectedReason, setSelectedReason] = useState<ReportReason | null>(null);
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetState = () => {
    setSelectedReason(null);
    setDescription("");
    setIsSubmitting(false);
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const handleSubmit = async () => {
    if (!selectedReason || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onSubmit(selectedReason, description.trim() || undefined);
      handleClose();
    } catch (error: unknown) {
      const message =
        error instanceof Error && error.message?.toLowerCase().includes("already reported")
          ? t("report.duplicate")
          : t("report.error");
      Alert.alert(message);
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
      >
        <TouchableWithoutFeedback onPress={handleClose}>
          <View className="flex-1" style={{ backgroundColor: "rgba(0,0,0,0.5)" }} />
        </TouchableWithoutFeedback>

        <View
          style={{
            backgroundColor: theme.card,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
          }}
        >
          {/* Title bar */}
          <View className="flex-row items-center justify-between px-5 pt-5 pb-2">
            <View className="w-8" />
            <Text
              className="font-sans-semibold text-[17px]"
              style={{ color: theme.text }}
            >
              {t("report.title")}
            </Text>
            <Pressable onPress={handleClose} className="p-1 active:opacity-70">
              <Ionicons name="close" size={24} color={theme.icon} />
            </Pressable>
          </View>

          {/* Subtitle */}
          <Text
            className="font-sans text-[14px] px-5 pb-3"
            style={{ color: theme.textSecondary }}
          >
            {t("report.selectReason")}
          </Text>

          {/* Reason list */}
          <View className="px-5">
            {ReportReasonValues.map((reason) => {
              const isSelected = selectedReason === reason;
              return (
                <Pressable
                  key={reason}
                  onPress={() => setSelectedReason(reason)}
                  className="flex-row items-center gap-3 py-3"
                  style={{
                    borderBottomWidth: 1,
                    borderBottomColor: theme.border,
                  }}
                >
                  <View
                    className="h-5 w-5 items-center justify-center rounded-full"
                    style={{
                      borderWidth: 2,
                      borderColor: isSelected ? theme.primary : theme.border,
                      backgroundColor: isSelected ? theme.primary : "transparent",
                    }}
                  >
                    {isSelected && (
                      <View
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: "#FFFFFF" }}
                      />
                    )}
                  </View>
                  <Text
                    className="font-sans text-[15px]"
                    style={{ color: theme.text }}
                  >
                    {t(`report.reason_${reason}`)}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {/* Description input */}
          <View className="px-5 pt-4">
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder={t("report.descriptionPlaceholder")}
              placeholderTextColor={theme.textTertiary}
              multiline
              maxLength={500}
              numberOfLines={3}
              style={{
                backgroundColor: theme.surface,
                borderWidth: 1,
                borderColor: theme.border,
                borderRadius: 12,
                padding: 12,
                minHeight: 80,
                color: theme.text,
                fontSize: 14,
                textAlignVertical: "top",
              }}
            />
          </View>

          {/* Submit button */}
          <View className="px-5 pt-4 pb-8">
            <Pressable
              onPress={handleSubmit}
              disabled={!selectedReason || isSubmitting}
              className="items-center rounded-full py-3.5 active:opacity-70"
              style={{
                backgroundColor: theme.primary,
                opacity: !selectedReason || isSubmitting ? 0.5 : 1,
              }}
            >
              <Text className="font-sans-semibold text-[15px] text-white">
                {isSubmitting ? t("report.submitting") : t("report.submit")}
              </Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
