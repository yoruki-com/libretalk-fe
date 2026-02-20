import { useEffect, useState } from "react";
import { router } from "expo-router";
import { View, ActivityIndicator, Text, ScrollView } from "react-native";
import { useAuth } from "@/contexts/AuthContext";
import { getDebugLog } from "@/contexts/AuthContext";

export default function Callback() {
  const { isLoading, isAuthenticated, hasAccessToken } = useAuth();
  const [log, setLog] = useState<string[]>([]);

  // Refresh the on-screen log every 500ms
  useEffect(() => {
    const id = setInterval(() => setLog([...getDebugLog()]), 500);
    return () => clearInterval(id);
  }, []);

  console.log("[Callback] render", JSON.stringify({ isLoading, isAuthenticated, hasAccessToken }));

  useEffect(() => {
    if (!isLoading) {
      console.log("[Callback] isLoading=false → router.replace('/')");
      router.replace("/");
    }
  }, [isLoading]);

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 20 }}>
      <ActivityIndicator size="large" />
      <Text style={{ color: "#888", marginTop: 10, fontSize: 12 }}>
        Callback — isLoading={String(isLoading)} isAuth={String(isAuthenticated)} hasToken={String(hasAccessToken)}
      </Text>
      <ScrollView style={{ flex: 1, marginTop: 10, width: "100%" }}>
        <Text style={{ color: "#aaa", fontSize: 9, fontFamily: "monospace" }}>
          {log.join("\n")}
        </Text>
      </ScrollView>
    </View>
  );
}
