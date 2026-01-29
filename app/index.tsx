import { Redirect } from "expo-router";

export default function Index() {
  // For now, redirect to the chat tab
  // Later this can check auth state and show GetStarted or redirect to tabs
  return <Redirect href="/(tabs)/chat" />;
}
