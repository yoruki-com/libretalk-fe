import { View } from "react-native";

interface SlideIndicatorProps {
  total: number;
  activeIndex: number;
}

export function SlideIndicator({ total, activeIndex }: SlideIndicatorProps) {
  return (
    <View className="flex-row items-center justify-center gap-2">
      {Array.from({ length: total }).map((_, index) => (
        <View
          key={index}
          className={`h-1.5 w-1.5 rounded-full ${
            index === activeIndex ? "bg-primary" : "bg-gray4"
          }`}
        />
      ))}
    </View>
  );
}
