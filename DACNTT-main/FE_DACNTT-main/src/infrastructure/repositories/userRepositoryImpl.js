import axiosClient from '../api/axiosClient';
import { API_ENDPOINTS } from '../api/endpoints';

/**
 * User Repository Implementation
 * Handles all user management API calls
 */
const userRepositoryImpl = {
    async createUser(userData) {
        const response = await axiosClient.post(API_ENDPOINTS.USERS.CREATE, userData);
        return response;
    },

    // [FIX] Truyền đầy đủ tham số xuống Backend
    async getUsers(params = {}) {
        const response = await axiosClient.get(API_ENDPOINTS.USERS.LIST, {
            params: {
                page: params.page || 0,
                size: params.size || 10,
                role: params.role, // Truyền role để backend lọc (nếu có hỗ trợ)
            },
        });
        return response;
    },

    async getUserById(userId) {
        const response = await axiosClient.get(API_ENDPOINTS.USERS.GET_BY_ID(userId));
        return response;
    },

    async updateUser(userId, userData) {
        const response = await axiosClient.put(API_ENDPOINTS.USERS.UPDATE(userId), userData);
        return response;
    },

    async deleteUser(userId) {
        const response = await axiosClient.delete(API_ENDPOINTS.USERS.DELETE(userId));
        return response;
    },

    async resetPassword(username) {
        const response = await axiosClient.post(API_ENDPOINTS.USERS.RESET_PASSWORD, username, {
            headers: {
                'Content-Type': 'text/plain',
            },
        });
        return response;
    },

    async getMe() {
        const response = await axiosClient.get(API_ENDPOINTS.USERS.GET_ME);
        return response;
    },
};

export default userRepositoryImpl;