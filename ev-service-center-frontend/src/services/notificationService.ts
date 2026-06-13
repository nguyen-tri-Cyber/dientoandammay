import { httpClient } from "@/lib/httpClient";

export interface Notification {
    id: number;
    message: string;
    link?: string;
    type: string;
    status: string;
    userId: number;
    createdAt: string;
    updatedAt: string;
    user?: {
        id: number;
        name: string;
        email: string;
    };
}

export interface NotificationResponse {
    data: Notification[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export interface NotificationFilters {
    page?: number;
    limit?: number;
    status?: string;
    userId?: number;
}

const API_BASE_URL = "/api/notification";

export const getAllNotifications = async (): Promise<Notification[]> => {
    const res = await httpClient.get(`${API_BASE_URL}/all`);
    return res.data?.data ?? res.data;
};

export const getNotifications = async (filters?: NotificationFilters): Promise<NotificationResponse> => {
    const params = new URLSearchParams();
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.status !== undefined) params.append('status', filters.status);
    if (filters?.userId) params.append('userId', filters.userId.toString());
    
    const queryString = params.toString();
    const url = queryString ? `${API_BASE_URL}?${queryString}` : API_BASE_URL;
    
    const res = await httpClient.get(url);
    return res.data;
};

export const getNotificationById = async (id: number): Promise<Notification> => {
    const res = await httpClient.get(`${API_BASE_URL}`, {
        params: { limit: 100 },
    });
    const notification = (res.data?.data ?? res.data).find((item: Notification) => item.id === id);
    if (!notification) {
        throw new Error("Notification not found");
    }
    return notification;
};

export const getNotificationsByUser = async (userId: number): Promise<Notification[]> => {
    const res = await httpClient.get(`${API_BASE_URL}/user/${userId}`);
    return res.data?.data ?? res.data;
};

export const getUnreadNotifications = async (filters?: NotificationFilters): Promise<NotificationResponse> => {
    const params = new URLSearchParams();
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.userId) params.append('userId', filters.userId.toString());
    params.append('status', 'unread');
    
    const queryString = params.toString();
    const url = `${API_BASE_URL}?${queryString}`;
    
    const res = await httpClient.get(url);
    return res.data;
};

export const createNotification = async (data: {
    message: string;
    type?: string;
    link?: string;
    userId: number;
}): Promise<Notification> => {
    const res = await httpClient.post(API_BASE_URL, {
        ...data,
        type: data.type ?? "system",
    });
    return res.data;
};

export const updateNotification = async (id: number, data: {
    message?: string;
    link?: string;
    status?: string;
}): Promise<Notification> => {
    const res = await httpClient.patch(`${API_BASE_URL}/${id}`, data);
    return res.data;
};

export const markAsRead = async (id: number): Promise<Notification> => {
    const res = await httpClient.put(`${API_BASE_URL}/${id}/read`);
    return res.data;
};

export const markAllAsRead = async (userId?: number): Promise<void> => {
    await httpClient.patch(`${API_BASE_URL}/read-all`, undefined, {
        params: userId ? { userId } : undefined,
    });
};

export const deleteNotification = async (id: number): Promise<void> => {
    await httpClient.delete(`${API_BASE_URL}/${id}`);
};

export interface CreateNotificationDto {
    message: string;
    type?: string;
    link?: string;
    userId: number;
}

export interface UpdateNotificationDto {
    message?: string;
    link?: string;
    type?: string;
    status?: string;
}
