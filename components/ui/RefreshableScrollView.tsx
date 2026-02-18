import { useCallback, useState } from "react";
import { RefreshControl, ScrollView, type ScrollViewProps } from "react-native";
import { useTheme } from "@/contexts/ThemeContext";

interface RefreshableScrollViewProps extends ScrollViewProps {
  onRefresh: () => Promise<void>;
}

export function RefreshableScrollView({
  onRefresh,
  children,
  ...props
}: RefreshableScrollViewProps) {
  const [refreshing, setRefreshing] = useState(false);
  const { theme } = useTheme();

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await onRefresh();
    setRefreshing(false);
  }, [onRefresh]);

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      {...props}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          tintColor={theme.primary}
          colors={[theme.primary]}
        />
      }
    >
      {children}
    </ScrollView>
  );
}
