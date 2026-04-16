import { getAuthRepository } from '../../domain/repositories/RepositoryFactory';
import { Auth } from '../../domain/models/Auth';

const authRepository = getAuthRepository();

/**
 * Login Use Case
 * Handles user authentication
 * 
 * @param {string} username - User's username
 * @param {string} password - User's password
 * @returns {Promise<Auth>} Authentication data with user info
 */
export const loginUseCase = async (username, password) => {
    // Validate input
    if (!username || !password) {
        throw new Error('Username và password không được để trống');
    }

    // Call repository
    const response = await authRepository.login(username, password);

    // Create Auth model from response
    const auth = Auth.fromLoginResponse(response);

    // Store authentication data
    if (auth.user) {
        authRepository.storeAuthData(auth.accessToken, auth.user);
    } else {
        authRepository.storeAuthData(auth.accessToken, null);
    }

    return auth;
};

/**
 * Register Student Use Case
 * Handles student registration
 * 
 * @param {Object} studentData - Student registration data
 * @returns {Promise<Object>} Registration result
 */
export const registerStudentUseCase = async (studentData) => {
    // Validate required fields
    const requiredFields = ['username', 'password', 'email', 'fullName', 'studentCode'];
    for (const field of requiredFields) {
        if (!studentData[field]) {
            throw new Error(`${field} không được để trống`);
        }
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(studentData.email)) {
        throw new Error('Email không đúng định dạng');
    }

    // Validate password strength
    if (studentData.password.length < 6) {
        throw new Error('Mật khẩu phải có ít nhất 6 ký tự');
    }

    // Call repository
    const response = await authRepository.registerStudent(studentData);
    return response;
};

/**
 * Logout Use Case
 * Clears authentication data
 */
export const logoutUseCase = () => {
    authRepository.clearAuthData();
};

/**
 * Check Authentication Use Case
 * Checks if user is currently authenticated
 * 
 * @returns {boolean}
 */
export const checkAuthUseCase = () => {
    const token = authRepository.getAccessToken();
    if (!token) return false;

    // Create auth to check token validity
    const auth = Auth.fromStorage(token, authRepository.getStoredUser());
    return auth.isTokenValid();
};

/**
 * Get Current User Use Case
 * Gets the currently logged in user
 * 
 * @returns {Object|null} Current user data
 */
export const getCurrentUserUseCase = () => {
    return authRepository.getStoredUser();
};

// Export all use cases as default object
const authUseCases = {
    login: loginUseCase,
    registerStudent: registerStudentUseCase,
    logout: logoutUseCase,
    checkAuth: checkAuthUseCase,
    getCurrentUser: getCurrentUserUseCase,
};

export default authUseCases;
