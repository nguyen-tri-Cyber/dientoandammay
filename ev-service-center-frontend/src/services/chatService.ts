import { httpClient } from "@/lib/httpClient";

const API_BASE_URL = "/api/chat";

export interface ChatMessage {
    id: number;
    Sender_ID: number;
    Receiver_ID: number;
    Message: string;
    createdAt: string;
    updatedAt: string;
}

export interface SendMessageRequest {
    Sender_ID: number;
    Receiver_ID: number;
    Message: string;
}

export interface ChatHistoryResponse {
    messages: ChatMessage[];
}

const normalizeChatError = (error: unknown): never => {
    const message = error instanceof Error ? error.message : "Chat service is unavailable";
    throw new Error(
        message.includes("disabled")
            ? "REST chat service is disabled. The current UI uses Firebase chat."
            : message
    );
};

export const sendMessage = async (data: SendMessageRequest): Promise<ChatMessage> => {
    try {
        const res = await httpClient.post(`${API_BASE_URL}/send`, data);
        return res.data;
    } catch (error) {
        return normalizeChatError(error);
    }
};

export const getChatHistory = async (user1: number, user2: number): Promise<ChatMessage[]> => {
    try {
        const res = await httpClient.get(`${API_BASE_URL}/history/${user1}/${user2}`);
        return res.data;
    } catch (error) {
        return normalizeChatError(error);
    }
};
