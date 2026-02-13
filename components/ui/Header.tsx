import { useTheme } from "@/contexts/ThemeContext";
import { useRouter } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { Routes } from "@/constants/routes";

interface HeaderProps {
  title?: string;
  onVipPress?: () => void;
}

export function Header({ title = "Chat", onVipPress }: HeaderProps) {
  const { theme } = useTheme();
  const router = useRouter();

  const handleVipPress = () => {
    if (onVipPress) {
      onVipPress();
    } else {
      router.push(Routes.VIP);
    }
  };

  return (
    <View className="flex-row items-center justify-between py-2">
      {/* Left - VIP chip */}
      <View className="w-[76px]">
        <Pressable
          onPress={handleVipPress}
          className="items-center justify-center self-start rounded-full px-3 py-1 active:opacity-70"
          style={{ backgroundColor: "#F59E0B" }}
        >
          <Text className="font-sans-semibold text-[12px] text-white">
            VIP
          </Text>
        </Pressable>
      </View>

      {/* Center - Title */}
      <Text
        className="font-sans-semibold text-[20px] font-semibold leading-7"
        style={{ color: theme.text }}
      >
        {title}
      </Text>

      {/* Right - spacer to keep title centered */}
      <View className="w-[76px]" />
    </View>
  );
}
