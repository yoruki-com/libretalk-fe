import { Text, Pressable, ScrollView, View } from "react-native";

interface Category {
  id: string;
  emoji: string;
  label: string;
}

interface CategoryChipsProps {
  categories: Category[];
  selectedId?: string;
  onSelect?: (id: string) => void;
}

export function CategoryChips({
  categories,
  selectedId,
  onSelect,
}: CategoryChipsProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ gap: 8 }}
    >
      {categories.map((category) => {
        const isSelected = selectedId === category.id;
        return (
          <Pressable
            key={category.id}
            onPress={() => onSelect?.(category.id)}
            className={`flex-row items-center justify-center rounded-full border px-4 py-2.5 active:opacity-70 ${
              isSelected
                ? "border-primary bg-primary"
                : "border-border bg-white"
            }`}
          >
            <Text
              className={`font-sans text-[13px] leading-[1.4] ${
                isSelected ? "text-white" : "text-dark"
              }`}
            >
              {category.emoji} {category.label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
