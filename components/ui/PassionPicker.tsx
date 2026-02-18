import { useTheme } from "@/contexts/ThemeContext";
import { passionsApi } from "@/services/api/passions";
import type { Passion } from "@/services/api/types";
import { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, Alert, Pressable, Text, View } from "react-native";

const MAX_PASSIONS = 7;

interface PassionPickerProps {
  selectedIds: Set<string>;
  onToggle: (publicId: string) => void;
}

export function PassionPicker({ selectedIds, onToggle }: PassionPickerProps) {
  const { t } = useTranslation();
  const { theme } = useTheme();

  const [passions, setPassions] = useState<Passion[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    passionsApi
      .getActive()
      .then((res) => setPassions(res.data))
      .catch(() => Alert.alert(t("common.error"), t("onboarding.loadError")))
      .finally(() => setIsLoading(false));
  }, []);

  const groupedPassions = useMemo(() => {
    const groups: Record<string, Passion[]> = {};
    for (const passion of passions) {
      const category = passion.category ?? t("onboarding.otherCategory");
      if (!groups[category]) groups[category] = [];
      groups[category].push(passion);
    }
    return groups;
  }, [passions, t]);

  if (isLoading) {
    return (
      <View className="items-center py-8">
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  const atLimit = selectedIds.size >= MAX_PASSIONS;

  return (
    <View>
      <Text
        className="mb-4 font-sans text-[13px]"
        style={{ color: atLimit ? theme.primary : theme.textSecondary }}
      >
        {t("onboarding.passionsCount", { count: selectedIds.size, max: MAX_PASSIONS })}
      </Text>
      {Object.entries(groupedPassions).map(([category, items]) => (
        <View key={category} className="mb-4">
          <Text
            className="mb-2 font-sans-semibold text-[13px] uppercase tracking-wider"
            style={{ color: theme.textSecondary }}
          >
            {category}
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {items.map((passion) => {
              const isSelected = selectedIds.has(passion.publicId);
              const isDisabled = !isSelected && atLimit;
              return (
                <Pressable
                  key={passion.publicId}
                  onPress={() => onToggle(passion.publicId)}
                  disabled={isDisabled}
                  className="flex-row items-center rounded-full px-4 py-2"
                  style={{
                    backgroundColor: isSelected
                      ? theme.primary + "15"
                      : theme.card,
                    borderWidth: 1,
                    borderColor: isSelected ? theme.primary : theme.border,
                    opacity: isDisabled ? 0.4 : 1,
                  }}
                >
                  {passion.icon && (
                    <Text className="mr-1.5 text-[14px]">{passion.icon}</Text>
                  )}
                  <Text
                    className="font-sans text-[14px]"
                    style={{ color: isSelected ? theme.primary : theme.text }}
                  >
                    {passion.name}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      ))}
    </View>
  );
}
