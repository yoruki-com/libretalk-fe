/**
 * Format a timestamp for chat list display.
 * Returns HH:MM for today, "Yesterday", weekday name for <7 days, or short date.
 */
export function formatChatListTime(
  dateString: string | null,
  labels: { yesterday: string },
): string {
  if (!dateString) return "";

  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }
  if (diffDays === 1) {
    return labels.yesterday;
  }
  if (diffDays < 7) {
    return date.toLocaleDateString([], { weekday: "long" });
  }
  return date.toLocaleDateString([], { month: "short", day: "numeric" });
}

/**
 * Format a timestamp for message bubbles (e.g. "3:45 PM").
 */
export function formatMessageTime(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

/**
 * Format a timestamp as relative time (now, 5m, 2h, 3d, or short date).
 */
export function formatRelativeTime(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "now";
  if (diffMins < 60) return `${diffMins}m`;
  if (diffHours < 24) return `${diffHours}h`;
  if (diffDays < 7) return `${diffDays}d`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

/**
 * Format a date for message group separators (Today, Yesterday, or date).
 */
export function formatDateSeparator(
  isoString: string,
  labels: { today: string; yesterday: string },
): string {
  const date = new Date(isoString);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) {
    return labels.today;
  }
  if (date.toDateString() === yesterday.toDateString()) {
    return labels.yesterday;
  }
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: date.getFullYear() !== today.getFullYear() ? "numeric" : undefined,
  });
}

/**
 * Get "last seen" status text for a user.
 */
export function getLastSeenText(
  lastSeenAt: string | null,
  isOnline: boolean,
  labels: {
    online: string;
    offline: string;
    lastSeenNow: string;
    lastSeenMinutes: (count: number) => string;
    lastSeenHours: (count: number) => string;
    lastSeenDays: (count: number) => string;
  },
): string {
  if (isOnline) return labels.online;
  if (!lastSeenAt) return labels.offline;

  const lastSeen = new Date(lastSeenAt);
  const now = new Date();
  const diffMs = now.getTime() - lastSeen.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return labels.lastSeenNow;
  if (diffMins < 60) return labels.lastSeenMinutes(diffMins);
  if (diffHours < 24) return labels.lastSeenHours(diffHours);
  return labels.lastSeenDays(diffDays);
}
