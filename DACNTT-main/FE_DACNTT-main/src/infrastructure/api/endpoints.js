// =============================================
// API Endpoints Configuration
// =============================================

const API_VERSION = '/api/v1';

export const API_ENDPOINTS = {
    // ==========================================
    // AUTH ENDPOINTS
    // ==========================================
    AUTH: {
        LOGIN: `${API_VERSION}/auth/login`,
        // REGISTER: `${API_VERSION}/auth/register`, // Nếu có dùng
    },

    // ==========================================
    // USER MANAGEMENT ENDPOINTS
    // ==========================================
    USERS: {
        CREATE: `${API_VERSION}/users/create`,
        LIST: `${API_VERSION}/users`,
        GET_BY_ID: (id) => `${API_VERSION}/users/${id}`,
        UPDATE: (id) => `${API_VERSION}/users/${id}`,
        DELETE: (id) => `${API_VERSION}/users/${id}`,
        RESET_PASSWORD: `${API_VERSION}/users/resetpassword`,
        GET_ME: `${API_VERSION}/users/me`, 
    },

    // ==========================================
    // ACADEMIC DATA ENDPOINTS
    // ==========================================
    SEMESTERS: {
        CREATE: `${API_VERSION}/semesters`,
        LIST: `${API_VERSION}/semesters`,
        GET_BY_ID: (id) => `${API_VERSION}/semesters/${id}`,
        UPDATE: (id) => `${API_VERSION}/semesters/${id}`,
        DELETE: (id) => `${API_VERSION}/semesters/${id}`,
    },

    SUBJECTS: {
        CREATE: `${API_VERSION}/subjects`,
        LIST: `${API_VERSION}/subjects`,
        GET_BY_ID: (id) => `${API_VERSION}/subjects/${id}`,
        UPDATE: (id) => `${API_VERSION}/subjects/${id}`,
        DELETE: (id) => `${API_VERSION}/subjects/${id}`,
    },

    // ==========================================
    // COURSE ENDPOINTS
    // ==========================================
    COURSES: {
        CREATE: `${API_VERSION}/courses`,
        LIST: `${API_VERSION}/courses`,
        GET_BY_ID: (id) => `${API_VERSION}/courses/${id}`,
        UPDATE: (id) => `${API_VERSION}/courses/${id}`,
        DELETE: (id) => `${API_VERSION}/courses/${id}`,
        REGISTER_STUDENT: `${API_VERSION}/courses/register-student`,
        GET_STUDENTS: (id) => `${API_VERSION}/courses/${id}/students`,
        BY_LECTURER: (lecturerId) => `${API_VERSION}/courses/by-lecturer/${lecturerId}`,
        
        MY_COURSES: `${API_VERSION}/courses/my-courses`,
        
        // [FIX LỖI 404] Đảm bảo dòng này chính xác
        STATISTICS: (id) => `${API_VERSION}/courses/${id}/statistics`,
        
        SEND_BAN_NOTIFICATIONS: (id) => `${API_VERSION}/courses/${id}/send-ban-notifications`,
        EXPORT_EXCEL: (id) => `${API_VERSION}/courses/${id}/export-excel`,
    },

    // ==========================================
    // LEAVE REQUEST ENDPOINTS
    // ==========================================
    LEAVE_REQUESTS: {
        CREATE: `${API_VERSION}/leave-requests`,
        GET_MY_HISTORY: `${API_VERSION}/leave-requests/my-history`,
        GET_BY_COURSE: (courseId) => `${API_VERSION}/leave-requests/course/${courseId}`,
        UPDATE_STATUS: (requestId) => `${API_VERSION}/leave-requests/${requestId}/status`,
    },

    // ==========================================
    // ATTENDANCE ENDPOINTS
    // ==========================================
    ATTENDANCE: {
        START_SESSION: `${API_VERSION}/attendance/start-session`,
        CLOSE_SESSION: `${API_VERSION}/attendance/close-session`,
        CHECK_IN: `${API_VERSION}/attendance/check-in`,
        GET_BY_COURSE: (courseId) => `${API_VERSION}/attendance/course/${courseId}`,
        GET_SESSION_RECORDS: (sessionId) => `${API_VERSION}/attendance/session/${sessionId}/records`,
        GET_HISTORY: (courseId) => `${API_VERSION}/attendance/history/${courseId}`,
        UPDATE_RECORD: (recordId) => `${API_VERSION}/attendance/record/${recordId}`,
    },
};

export default API_ENDPOINTS;