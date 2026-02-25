let activeChatConversationId: string | null = null;

export function setActiveChatId(id: string | null): void {
  activeChatConversationId = id;
}

export function getActiveChatId(): string | null {
  return activeChatConversationId;
}
