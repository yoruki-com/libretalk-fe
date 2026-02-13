import { useTheme } from "@/contexts/ThemeContext";
import type { PersonalityType } from "@/services/api/types";
import { Pressable, Text, View } from "react-native";

const MBTI_TYPES: PersonalityType[] = [
  "INTJ", "INTP", "ENTJ", "ENTP",
  "INFJ", "INFP", "ENFJ", "ENFP",
  "ISTJ", "ISFJ", "ESTJ", "ESFJ",
  "ISTP", "ISFP", "ESTP", "ESFP",
];

interface MbtiPickerProps {
  selected: PersonalityType | null;
  onSelect: (type: PersonalityType | null) => void;
}

export function MbtiPicker({ selected, onSelect }: MbtiPickerProps) {
  const { theme } = useTheme();

  return (
    <View className="flex-row flex-wrap gap-2">
      {MBTI_TYPES.map((type) => {
        const isSelected = selected === type;
        return (
          <Pressable
            key={type}
            onPress={() => onSelect(isSelected ? null : type)}
            className="items-center justify-center rounded-xl px-4 py-2.5"
            style={{
              backgroundColor: isSelected ? theme.primary : theme.card,
              borderWidth: 1,
              borderColor: isSelected ? theme.primary : theme.border,
              minWidth: 72,
            }}
          >
            <Text
              className="font-sans-semibold text-[14px]"
              style={{ color: isSelected ? "#FFFFFF" : theme.text }}
            >
              {type}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
