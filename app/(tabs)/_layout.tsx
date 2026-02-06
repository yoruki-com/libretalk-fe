import { Tabs } from "expo-router";
import { BottomNavigation } from "@/components/ui/BottomNavigation";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
      }}
      tabBar={(props) => (
        <BottomNavigation
          activeTab={
            (props.state.routes[props.state.index].name as any) || "chat"
          }
          onTabPress={(tab) => {
            const route = props.state.routes.find((r) => r.name === tab);
            if (route) {
              props.navigation.navigate(route.name);
            }
          }}
          badges={{ vibes: true, chat: true, call: true }}
        />
      )}
    >
      <Tabs.Screen name="vibes" options={{ title: "Vibes" }} />
      <Tabs.Screen name="community" options={{ title: "Community" }} />
      <Tabs.Screen name="chat" options={{ title: "Chat" }} />
      <Tabs.Screen name="call" options={{ title: "Call" }} />
      <Tabs.Screen name="settings" options={{ title: "Settings" }} />
    </Tabs>
  );
}
