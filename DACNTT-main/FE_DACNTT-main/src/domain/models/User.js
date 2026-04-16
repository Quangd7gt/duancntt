/**
 * User Model
 * Represents a user in the system
 */
export class User {
    constructor({
        id = null,
        username = '',
        email = '',
        fullName = '',
        firstName = '',
        lastName = '',
        role = 'STUDENT',
        studentCode = null,
        lecturerCode = null,
        department = null,
        enabled = true,
        createdAt = null,
        updatedAt = null,
    } = {}) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.firstName = firstName;
        this.lastName = lastName;
        // Auto-generate fullName if not provided
        this.fullName = fullName || `${firstName} ${lastName}`.trim();
        this.role = role;
        this.studentCode = studentCode;
        this.lecturerCode = lecturerCode;
        this.department = department;
        this.enabled = enabled;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    /**
     * Check if user is an admin
     * @returns {boolean}
     */
    isAdmin() {
        return this.role === 'ADMIN';
    }

    /**
     * Check if user is a lecturer
     * @returns {boolean}
     */
    isLecturer() {
        return this.role === 'LECTURER';
    }

    /**
     * Check if user is a student
     * @returns {boolean}
     */
    isStudent() {
        return this.role === 'STUDENT';
    }

    /**
     * Check if user is a secretary
     * @returns {boolean}
     */
    isSecretary() {
        return this.role === 'SECRETARY';
    }

    /**
     * Get display name
     * @returns {string}
     */
    getDisplayName() {
        return this.fullName || this.username;
    }

    /**
     * Get role display text (Vietnamese)
     * @returns {string}
     */
    getRoleDisplayText() {
        const roleTexts = {
            'ADMIN': 'Quản trị viên',
            'LECTURER': 'Giảng viên',
            'STUDENT': 'Sinh viên',
            'SECRETARY': 'Thư ký',
        };
        return roleTexts[this.role] || this.role;
    }

    /**
     * Create User from API response
     * @param {Object} data - API response data
     * @returns {User}
     */
    static fromApi(data) {
        // Normalize role by removing ROLE_ prefix if present
        let role = data.role || 'STUDENT';
        if (role.startsWith('ROLE_')) {
            role = role.replace('ROLE_', '');
        }
        return new User({
            id: data.id,
            username: data.username,
            email: data.email,
            firstName: data.firstName || '',
            lastName: data.lastName || '',
            fullName: data.fullName || '',
            role: role,
            studentCode: data.studentCode,
            lecturerCode: data.lecturerCode,
            department: data.department,
            enabled: data.enabled !== undefined ? data.enabled : true,
            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
        });
    }

    /**
     * Convert to JSON for API request
     * @returns {Object}
     */
    toJson() {
        return {
            id: this.id,
            username: this.username,
            email: this.email,
            fullName: this.fullName,
            role: this.role,
            studentCode: this.studentCode,
            lecturerCode: this.lecturerCode,
        };
    }
}

// Role constants
export const USER_ROLES = {
    ADMIN: 'ADMIN',
    LECTURER: 'LECTURER',
    STUDENT: 'STUDENT',
    SECRETARY: 'SECRETARY',
};

export default User;
