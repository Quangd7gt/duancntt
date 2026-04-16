import axiosClient from '../api/axiosClient';
import { API_ENDPOINTS } from '../api/endpoints';

/**
 * Authentication Repository Implementation
 * Handles all authentication-related API calls
 */
const authRepositoryImpl = {
    /**
     * Login user with username and password
     * @param {string} username - User's username
     * @param {string} password - User's password
     * @returns {Promise<{accessToken: string, tokenType: string}>}
     */
    async login(username, password) {
        const response = await axiosClient.post(API_ENDPOINTS.AUTH.LOGIN, {
            username,
            password,
        });
        return response;
    },

    /**
     * Register a new student
     * @param {Object} studentData - Student registration data
     * @param {string} studentData.username - Student's username
     * @param {string} studentData.password - Student's password
     * @param {string} studentData.email - Student's email
     * @param {string} studentData.fullName - Student's full name
     * @param {string} studentData.studentCode - Student's code/ID
     * @returns {Promise<{message: string}>}
     */
    async registerStudent(studentData) {
        const response = await axiosClient.post(API_ENDPOINTS.AUTH.REGISTER_STUDENT, studentData);
        return response;
    },

    /**
     * Store authentication data in localStorage
     * @param {string} accessToken - JWT access token
     * @param {Object} user - User data to store
     */
    storeAuthData(accessToken, user) {
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('user', JSON.stringify(user));
    },

    /**
     * Clear authentication data from localStorage
     */
    clearAuthData() {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
    },

    /**
     * Get stored access token
     * @returns {string|null}
     */
    getAccessToken() {
        return localStorage.getItem('accessToken');
    },

    /**
     * Get stored user data
     * @returns {Object|null}
     */
    getStoredUser() {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    },

    /**
     * Check if user is authenticated
     * @returns {boolean}
     */
    isAuthenticated() {
        return !!localStorage.getItem('accessToken');
    },
};

export default authRepositoryImpl;
