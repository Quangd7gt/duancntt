import axiosClient from '../api/axiosClient';
import { API_ENDPOINTS } from '../api/endpoints';

/**
 * Leave Request Repository Implementation
 * Handles all leave request related API calls
 */
const leaveRequestRepositoryImpl = {
    /**
     * Create a new leave request
     * @param {Object} requestData
     * @returns {Promise<Object>}
     */
    async createRequest(requestData) {
        const response = await axiosClient.post(API_ENDPOINTS.LEAVE_REQUESTS.CREATE, requestData);
        return response;
    },

    /**
     * Get my leave requests (Student)
     */
    async getMyRequests() {
        const response = await axiosClient.get(API_ENDPOINTS.LEAVE_REQUESTS.GET_MY_HISTORY);
        return response;
    },

    /**
     * Get requests by course (Lecturer)
     * @param {number|string} courseId
     * @returns {Promise<Array>}
     */
    async getRequestsByCourse(courseId) {
        const response = await axiosClient.get(API_ENDPOINTS.LEAVE_REQUESTS.GET_BY_COURSE(courseId));
        return response;
    },

    /**
     * Update request status (Lecturer)
     * @param {number|string} requestId
     * @param {string} status - 'APPROVED' or 'REJECTED'
     * @returns {Promise<Object>}
     */
    async updateStatus(requestId, status) {
        const response = await axiosClient.patch(API_ENDPOINTS.LEAVE_REQUESTS.UPDATE_STATUS(requestId), { status });
        return response;
    },
};

export default leaveRequestRepositoryImpl;