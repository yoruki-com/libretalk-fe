import { useEffect, useRef } from "react";
import { Platform } from "react-native";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import Constants from "expo-constants";
import { deviceTokensApi } from "@/services/api";

export function usePushToken(isAuthenticated: boolean) {
  const hasRegistered = useRef(false);

  useEffect(() => {
    if (!isAuthenticated || hasRegistered.current) return;
    hasRegistered.current = true;
    registerForPushNotifications().catch((err) => {
      console.warn("[usePushToken] Registration failed:", err);
    });
  }, [isAuthenticated]);
}

async function registerForPushNotifications() {
  // Push tokens only work on physical devices
  if (!Device.isDevice) {
    console.warn("[usePushToken] Push tokens require a physical device");
    return;
  }

  // Android 13+: create notification channel before requesting permission
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "Default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
    });
  }

  // Check and request permission
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    // User denied push permission -- fire-and-forget API call to create
    // a SYSTEM in-app notification informing them push is disabled.
    // The backend POST /device-tokens/push-denied creates the notification
    // directly via NotificationService.create() with type SYSTEM.
    console.warn(
      "[usePushToken] Push permission denied, creating in-app notification"
    );
    try {
      await deviceTokensApi.reportPushDenied();
    } catch (err) {
      console.warn("[usePushToken] Failed to report push denied:", err);
    }
    return;
  }

  // Get Expo push token
  const projectId =
    Constants?.expoConfig?.extra?.eas?.projectId ??
    Constants?.easConfig?.projectId;

  try {
    const pushTokenResult = await Notifications.getExpoPushTokenAsync({
      projectId,
    });

    // Send to backend (fire-and-forget, errors logged but not thrown)
    try {
      await deviceTokensApi.register({
        token: pushTokenResult.data,
        platform: Platform.OS,
      });
    } catch (err) {
      console.warn(
        "[usePushToken] Failed to register token with backend:",
        err
      );
    }
  } catch (err) {
    // Expo Go or simulator may fail here -- not a fatal error
    console.warn("[usePushToken] Failed to get push token:", err);
  }
}
