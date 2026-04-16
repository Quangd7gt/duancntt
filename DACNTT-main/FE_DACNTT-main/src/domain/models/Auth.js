import { jwtDecode } from 'jwt-decode';
import { User } from './User';

/**
 * Auth Model
 * Represents authentication data
 */
export class Auth {
    constructor({
        accessToken = '',
        tokenType = 'Bearer',
        user = null,
    } = {}) {
        this.accessToken = accessToken;
        this.tokenType = tokenType;
        this.user = user;
    }

    /**
     * Get full authorization header value
     * @returns {string}
     */
    getAuthorizationHeader() {
        return `${this.tokenType} ${this.accessToken}`;
    }

    /**
     * Check if token is valid (not expired)
     * @returns {boolean}
     */
    isTokenValid() {
        if (!this.accessToken) return false;

        try {
            const decoded = jwtDecode(this.accessToken);
            const currentTime = Date.now() / 1000;
            return decoded.exp > currentTime;
        } catch (error) {
            return false;
        }
    }

    /**
     * Get token expiration date
     * @returns {Date|null}
     */
    getTokenExpirationDate() {
        if (!this.accessToken) return null;

        try {
            const decoded = jwtDecode(this.accessToken);
            return new Date(decoded.exp * 1000);
        } catch (error) {
            return null;
        }
    }

    /**
     * Get time until token expires (in seconds)
     * @returns {number}
     */
    getTimeUntilExpiration() {
        if (!this.accessToken) return 0;

        try {
            const decoded = jwtDecode(this.accessToken);
            const currentTime = Date.now() / 1000;
            return Math.max(0, Math.floor(decoded.exp - currentTime));
        } catch (error) {
            return 0;
        }
    }

    /**
     * Create Auth from login response
     * @param {Object} response - Login API response
     * @returns {Auth}
     */
    static fromLoginResponse(response) {
        let user = null;

        try {
            const decoded = jwtDecode(response.accessToken);
            
            // --- FIX LOGIC: Xử lý Role từ nhiều nguồn khác nhau ---
            // 1. Ưu tiên lấy từ response API (nếu Backend trả về)
            // 2. Lấy từ 'role' trong token (số ít)
            // 3. Lấy từ 'roles' trong token (số nhiều/mảng) -> lấy phần tử đầu tiên
            let rawRole = response.role || decoded.role || (decoded.roles && decoded.roles[0]) || '';
            
            // 4. Chuẩn hóa: Bỏ tiền tố ROLE_ nếu có (Ví dụ: ROLE_ADMIN -> ADMIN)
            if (rawRole && typeof rawRole === 'string' && rawRole.startsWith('ROLE_')) {
                rawRole = rawRole.replace('ROLE_', '');
            }
            // -----------------------------------------------------

            user = new User({
                id: response.userId || decoded.userId || decoded.sub,
                username: response.username || decoded.username || decoded.sub,
                email: response.email || decoded.email,
                fullName: response.fullName || decoded.fullName,
                
                role: rawRole, // Sử dụng role đã được xử lý chuẩn
                
                studentCode: response.studentCode || decoded.studentCode,
                lecturerCode: response.lecturerCode || decoded.lecturerCode,
            });
        } catch (error) {
            console.error('Error decoding token:', error);
        }

        return new Auth({
            accessToken: response.accessToken,
            tokenType: response.tokenType || 'Bearer',
            user,
        });
    }

    /**
     * Create Auth from stored data
     * @param {string} accessToken
     * @param {Object} userData
     * @returns {Auth}
     */
    static fromStorage(accessToken, userData) {
        return new Auth({
            accessToken,
            tokenType: 'Bearer',
            user: userData ? User.fromApi(userData) : null,
        });
    }
}

export default Auth;