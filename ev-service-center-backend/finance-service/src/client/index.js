import axios from 'axios';

const API_GATEWAY_URL = process.env.API_GATEWAY_URL;
const AUTH_INTERNAL_TOKEN = process.env.AUTH_INTERNAL_TOKEN || '';
const authHeaders = AUTH_INTERNAL_TOKEN ? { Authorization: `Bearer ${AUTH_INTERNAL_TOKEN}` } : {};

export const bookingClient = {
    async getDashboardStats() {
        try {
            const response = await axios.get(`${API_GATEWAY_URL}/api/booking/stats/booking`, {
                headers: authHeaders
            });
            return { data: response.data };
        } catch (error) {
            console.error('Error fetching booking dashboard stats:', error.message);
            throw new Error('Failed to fetch booking dashboard stats');
        }
    },

    async getAllAppointments(params = {}) {
        try {
            const response = await axios.get(`${API_GATEWAY_URL}/api/booking`, {
                params,
                headers: authHeaders
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching appointments:', error.message);
            throw new Error('Failed to fetch appointments');
        }
    },

    async getAppointmentById(appointmentId) {
        try {
            const response = await axios.get(`${API_GATEWAY_URL}/api/booking/${appointmentId}`, {
                headers: authHeaders
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching appointment:', error.message);
            throw new Error('Failed to fetch appointment');
        }
    }
};

export const workorderClient = {
    async getRevenueStats(year) {
        try {
            const response = await axios.get(`${API_GATEWAY_URL}/api/workorder/stats/revenue`, {
                params: { year },
                headers: authHeaders
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching revenue stats:', error.message);
            throw new Error('Failed to fetch revenue stats');
        }
    },

    async getTaskStats() {
        try {
            const response = await axios.get(`${API_GATEWAY_URL}/api/workorder/stats/tasks`, {
                headers: authHeaders
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching task stats:', error.message);
            throw new Error('Failed to fetch task stats');
        }
    },

    async getAllWorkOrders(params = {}) {
        try {
            const response = await axios.get(`${API_GATEWAY_URL}/api/workorder`, {
                params,
                headers: authHeaders
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching work orders:', error.message);
            throw new Error('Failed to fetch work orders');
        }
    },

    async getWorkOrderById(workOrderId) {
        try {
            const response = await axios.get(`${API_GATEWAY_URL}/api/workorder/${workOrderId}`, {
                headers: authHeaders
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching work order:', error.message);
            throw new Error('Failed to fetch work order');
        }
    }
};

export const inventoryClient = {
    async getPartsStats(year) {
        try {
            const response = await axios.get(`${API_GATEWAY_URL}/api/inventory/parts/stats/parts`, {
                params: { year },
                headers: authHeaders
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching parts stats:', error.message);
            throw new Error('Failed to fetch parts stats');
        }
    },

    async getAllParts(params = {}) {
        try {
            const response = await axios.get(`${API_GATEWAY_URL}/api/inventory/parts`, {
                params,
                headers: authHeaders
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching parts:', error.message);
            throw new Error('Failed to fetch parts');
        }
    },

    async getPartById(partId) {
        try {
            const response = await axios.get(`${API_GATEWAY_URL}/api/inventory/parts/${partId}`, {
                headers: authHeaders
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching part:', error.message);
            throw new Error('Failed to fetch part');
        }
    }
};

export const authClient = {
    async getUserById(userId) {
        try {
            const response = await axios.get(`${API_GATEWAY_URL}/api/auth/users/${userId}`, {
                headers: authHeaders
            });
            return response.data.data || response.data;
        } catch (error) {
            console.error('Error fetching user:', error.message);
            throw new Error(`Failed to fetch user with ID ${userId}`);
        }
    },

    async getUsersByIds(userIds) {
        try {
            const userPromises = userIds.map(id => this.getUserById(id));
            const users = await Promise.all(userPromises);
            return users;
        } catch (error) {
            console.error('Error fetching users:', error.message);
            throw new Error('Failed to fetch users');
        }
    },

    async getUserStats() {
        try {
            const response = await axios.get(`${API_GATEWAY_URL}/api/auth/stats/users`, {
                headers: authHeaders
            });
            return { data: response.data };
        } catch (error) {
            console.error('Error fetching user stats:', error.message);
            throw new Error('Failed to fetch user stats');
        }
    }
};
