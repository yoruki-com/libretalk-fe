import { useTranslation } from "react-i18next";
import {
  formatDateSeparator,
  getLastSeenText,
} from "@/utils/time";
import type { Message } from "@/services/api";

export function useFormatDateSeparator() {
  const { t } = useTranslation();

  return (isoString: string): string =>
    formatDateSeparator(isoString, {
      today: t("chat.today"),
      yesterday: t("chat.yesterday"),
    });
}

export function useGetLastSeenText() {
  const { t } = useTranslation();

  return (lastSeenAt: string | null, isOnline: boolean): string =>
    getLastSeenText(lastSeenAt, isOnline, {
      online: t("chat.online"),
      offline: t("chat.offline"),
      lastSeenNow: t("chat.lastSeenNow"),
      lastSeenMinutes: (count) => t("chat.lastSeenMinutes", { count }),
      lastSeenHours: (count) => t("chat.lastSeenHours", { count }),
      lastSeenDays: (count) => t("chat.lastSeenDays", { count }),
    });
}

export function useGroupMessagesByDate() {
  const formatDate = useFormatDateSeparator();

  return (messages: Message[]): { date: string; messages: Message[] }[] => {
    const groups: Map<string, Message[]> = new Map();
    const sortedMessages = [...messages].reverse();

    for (const message of sortedMessages) {
      const dateKey = formatDate(message.createdAt);
      const existing = groups.get(dateKey) || [];
      groups.set(dateKey, [...existing, message]);
    }

    return Array.from(groups.entries()).map(([date, msgs]) => ({
      date,
      messages: msgs,
    }));
  };
}
