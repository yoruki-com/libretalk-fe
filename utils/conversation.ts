import type { Conversation } from "@/services/api";

export function getOtherParticipants(
  conversation: Conversation,
  currentUserPublicId: string,
) {
  return conversation.participants.filter(
    (p) => p.publicId !== currentUserPublicId,
  );
}

export function getConversationDisplayName(
  conversation: Conversation,
  currentUserPublicId: string,
  groupLabel: string,
): string {
  if (conversation.isGroup) {
    if (conversation.name) return conversation.name;
    const others = getOtherParticipants(conversation, currentUserPublicId);
    return others.map((p) => p.displayName).join(", ") || groupLabel;
  }
  const other = getOtherParticipants(conversation, currentUserPublicId)[0];
  return other?.displayName ?? "Unknown";
}

export function getConversationAvatar(
  conversation: Conversation,
  currentUserPublicId: string,
): string | undefined {
  if (conversation.isGroup) return conversation.avatarUrl ?? undefined;
  const other = getOtherParticipants(conversation, currentUserPublicId)[0];
  return other?.avatarUrl ?? undefined;
}

export function isConversationOnline(
  conversation: Conversation,
  currentUserPublicId: string,
): boolean {
  if (conversation.isGroup) return false;
  const other = getOtherParticipants(conversation, currentUserPublicId)[0];
  return other?.isOnline ?? false;
}
