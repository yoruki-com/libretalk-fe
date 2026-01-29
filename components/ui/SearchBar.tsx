import { View, TextInput, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface SearchBarProps {
  placeholder?: string;
  value?: string;
  onChangeText?: (text: string) => void;
  onFilterPress?: () => void;
  showFilter?: boolean;
}

export function SearchBar({
  placeholder = "Search",
  value,
  onChangeText,
  onFilterPress,
  showFilter = true,
}: SearchBarProps) {
  return (
    <View className="flex-row items-center gap-2 rounded-full bg-white px-4 py-3">
      <Ionicons name="search" size={20} color="#717171" />
      <TextInput
        className="flex-1 font-inter text-[14px] text-dark"
        placeholder={placeholder}
        placeholderTextColor="#717171"
        value={value}
        onChangeText={onChangeText}
      />
      {showFilter && (
        <>
          <View className="h-4 w-px bg-border" />
          <Pressable onPress={onFilterPress} className="active:opacity-70">
            <Ionicons name="options-outline" size={20} color="#131313" />
          </Pressable>
        </>
      )}
    </View>
  );
}
