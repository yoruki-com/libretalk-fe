import { View, Text } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function CommunityScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View
      className="flex-1 items-center justify-center bg-white"
      style={{ paddingTop: insets.top }}
    >
      <Text className="font-sans text-lg text-dark">Community</Text>
    </View>
  );
}
