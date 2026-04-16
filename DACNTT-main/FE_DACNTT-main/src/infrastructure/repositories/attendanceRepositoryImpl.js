import axiosClient from '../api/axiosClient';
import { API_ENDPOINTS } from '../api/endpoints';

const attendanceRepositoryImpl = {
    /**
     * Start an attendance session
     * @param {Object} sessionData - { courseId }
     */
    async startSession(sessionData) {
        const response = await axiosClient.post(API_ENDPOINTS.ATTENDANCE.START_SESSION, sessionData);
        return response;
    },

    /**
     * Close an attendance session
     * @param {Object} sessionData - { courseId }
     */
    async closeSession(sessionData) {
        // Backend yêu cầu courseId để tìm session mở
        const response = await axiosClient.post(API_ENDPOINTS.ATTENDANCE.CLOSE_SESSION, sessionData);
        return response;
    },

    /**
     * Check-in for attendance
     * @param {Object} checkInData - { qrCodeData, courseId }
     */
    async checkIn({ courseId, qrCodeData }) {
        const response = await axiosClient.post(API_ENDPOINTS.ATTENDANCE.CHECK_IN, { courseId, qrCodeData });
        return response;
    },

    async getSessionsByCourse(courseId) {
        console.warn('API getSessionsByCourse chưa khả dụng');
        return []; 
        // return await axiosClient.get(API_ENDPOINTS.ATTENDANCE.GET_BY_COURSE(courseId));
    },
    async getSessionRecords(sessionId) {
        console.warn('API getSessionRecords chưa khả dụng');
        return [];
        // return await axiosClient.get(API_ENDPOINTS.ATTENDANCE.GET_SESSION_RECORDS(sessionId));
    },

    
    async getStudentHistory(courseId) {
        const response = await axiosClient.get(API_ENDPOINTS.ATTENDANCE.GET_HISTORY(courseId));
        return response;
    },
    async updateRecord(recordId, updateData) {
        console.warn('API updateRecord chưa khả dụng');
        return {};
        // const response = await axiosClient.put(API_ENDPOINTS.ATTENDANCE.UPDATE_RECORD(recordId), updateData);
        // return response;
    },
};

export default attendanceRepositoryImpl;