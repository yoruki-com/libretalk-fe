import { apiClient } from "./client";
import type {
  ApiResponse,
  PaginatedResponse,
  PaginationParams,
  Conversation,
  CreateConversationDto,
  UpdateConversationDto,
  Message,
  CreateMessageDto,
} from "./types";

export const conversationsApi = {
  // Get all conversations
  async getAll(params?: PaginationParams): Promise<PaginatedResponse<Conversation>> {
    return apiClient.get("/conversations", params);
  },

  // Get conversations for a specific user
  async getByUser(
    userPublicId: string,
    params?: PaginationParams
  ): Promise<PaginatedResponse<Conversation>> {
    return apiClient.get(`/conversations/user/${userPublicId}`, params);
  },

  // Get a single conversation by ID
  async getById(publicId: string): Promise<ApiResponse<Conversation>> {
    return apiClient.get(`/conversations/${publicId}`);
  },

  // Create a new conversation
  async create(data: CreateConversationDto): Promise<ApiResponse<Conversation>> {
    return apiClient.post("/conversations", data);
  },

  // Update a conversation
  async update(
    publicId: string,
    data: UpdateConversationDto
  ): Promise<ApiResponse<Conversation>> {
    return apiClient.patch(`/conversations/${publicId}`, data);
  },

  // Delete a conversation
  async delete(publicId: string): Promise<ApiResponse<{ deleted: boolean }>> {
    return apiClient.delete(`/conversations/${publicId}`);
  },

  // Add participant to conversation
  async addParticipant(
    conversationPublicId: string,
    userPublicId: string
  ): Promise<ApiResponse<Conversation>> {
    return apiClient.post(`/conversations/${conversationPublicId}/participants`, {
      userPublicId,
    });
  },

  // Remove participant from conversation
  async removeParticipant(
    conversationPublicId: string,
    userPublicId: string
  ): Promise<ApiResponse<Conversation>> {
    return apiClient.delete(
      `/conversations/${conversationPublicId}/participants/${userPublicId}`
    );
  },

  // Update participant settings (mute, pin)
  async updateParticipantSettings(
    conversationPublicId: string,
    settings: { isMuted?: boolean; isPinned?: boolean }
  ): Promise<ApiResponse<Conversation>> {
    return apiClient.patch(
      `/conversations/${conversationPublicId}/participant-settings`,
      settings
    );
  },

  // Mark conversation as read
  async markAsRead(conversationPublicId: string): Promise<ApiResponse<{ success: boolean }>> {
    return apiClient.post(`/conversations/${conversationPublicId}/read`);
  },

  // Messages
  messages: {
    // Get messages for a conversation
    async getAll(
      conversationPublicId: string,
      params?: PaginationParams
    ): Promise<PaginatedResponse<Message>> {
      return apiClient.get(`/conversations/${conversationPublicId}/messages`, params);
    },

    // Send a message
    async send(
      conversationPublicId: string,
      data: CreateMessageDto
    ): Promise<ApiResponse<Message>> {
      return apiClient.post(`/conversations/${conversationPublicId}/messages`, data);
    },

    // Edit a message
    async edit(
      conversationPublicId: string,
      messagePublicId: string,
      content: string
    ): Promise<ApiResponse<Message>> {
      return apiClient.patch(
        `/conversations/${conversationPublicId}/messages/${messagePublicId}`,
        { content }
      );
    },

    // Delete a message
    async delete(
      conversationPublicId: string,
      messagePublicId: string
    ): Promise<ApiResponse<{ deleted: boolean }>> {
      return apiClient.delete(
        `/conversations/${conversationPublicId}/messages/${messagePublicId}`
      );
    },
  },
};
