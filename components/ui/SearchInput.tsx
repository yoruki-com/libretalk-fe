import { View, TextInput, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface SearchInputProps {
  placeholder?: string;
  value?: string;
  onChangeText?: (text: string) => void;
  onPress?: () => void;
}

export function SearchInput({
  placeholder = "Ask Chatterly AI or Search",
  value,
  onChangeText,
  onPress,
}: SearchInputProps) {
  return (
    <Pressable onPress={onPress}>
      <View className="flex-row items-center gap-2 rounded-full bg-light px-4 py-3">
        <Ionicons name="search" size={20} color="#131313" />
        <TextInput
          className="flex-1 font-inter text-[14px] text-dark"
          placeholder={placeholder}
          placeholderTextColor="rgba(19, 19, 19, 0.5)"
          value={value}
          onChangeText={onChangeText}
          editable={!onPress}
        />
      </View>
    </Pressable>
  );
}
