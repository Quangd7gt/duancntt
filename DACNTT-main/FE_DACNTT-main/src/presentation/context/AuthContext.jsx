// src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import authUseCases from '../../usecases/auth/authUseCases';
import userUseCases from '../../usecases/users/userUseCases'; // [FIX LỖI 5] Import userUseCases
import { USER_ROLES } from '../../domain/models/User';

// Create the Auth Context
const AuthContext = createContext(null);

/**
 * Auth Provider Component
 * Manages authentication state and provides auth functions to children
 */
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    // Check authentication status on mount
    useEffect(() => {
        const checkAuth = async () => { // [FIX LỖI 5] Đổi thành async function
            try {
                // 1. Kiểm tra Token trong localStorage có hợp lệ không
                const isAuth = authUseCases.checkAuth();
                
                if (isAuth) {
                    // 2. [FIX LỖI 5] Thay vì lấy user cũ từ LocalStorage, gọi API /me để lấy thông tin mới nhất
                    console.log('[AuthContext] Token valid, fetching user info from server...');
                    
                    try {
                        const currentUser = await userUseCases.getMe(); // Gọi API /me
                        
                        // Validate user data and role
                        if (currentUser && currentUser.role) {
                            let normalizedRole = currentUser.role;
                            if (normalizedRole.startsWith('ROLE_')) {
                                normalizedRole = normalizedRole.replace('ROLE_', '');
                            }

                            const validRoles = ['ADMIN', 'LECTURER', 'STUDENT', 'SECRETARY'];

                            if (validRoles.includes(normalizedRole)) {
                                setUser({ ...currentUser, role: normalizedRole });
                                setIsAuthenticated(true);
                            } else {
                                console.warn('Invalid user role, clearing auth data');
                                throw new Error('Invalid Role');
                            }
                        } else {
                            throw new Error('No user data');
                        }
                    } catch (apiError) {
                        // Nếu gọi /me thất bại (ví dụ token hết hạn trên server), logout
                        console.error('[AuthContext] Failed to fetch user info:', apiError);
                        authUseCases.logout();
                        setUser(null);
                        setIsAuthenticated(false);
                    }
                } else {
                    // Token không hợp lệ hoặc không có
                    setUser(null);
                    setIsAuthenticated(false);
                }
            } catch (error) {
                console.error('Error checking auth:', error);
                authUseCases.logout();
                setUser(null);
                setIsAuthenticated(false);
            } finally {
                setIsLoading(false);
            }
        };

        checkAuth();
    }, []);

    const login = useCallback(async (username, password) => {
        setIsLoading(true);
        try {
            const auth = await authUseCases.login(username, password);
            const userFromApi = auth.user;

            let normalizedRole = userFromApi.role;
            if (normalizedRole && normalizedRole.startsWith('ROLE_')) {
                normalizedRole = normalizedRole.replace('ROLE_', '');
            }

            const userToSave = { ...userFromApi, role: normalizedRole };

            setUser(userToSave);
            setIsAuthenticated(true);

            console.log("[AuthContext] ✅ Login success, role:", normalizedRole);

            setTimeout(() => {
                console.log("[AuthContext] 🚀 Navigating for role:", normalizedRole);
                if (normalizedRole === 'ADMIN') {
                    navigate('/admin/dashboard', { replace: true });
                } else if (normalizedRole === 'LECTURER') {
                    navigate('/lecturer/dashboard', { replace: true });
                } else if (normalizedRole === 'STUDENT') {
                    navigate('/student/dashboard', { replace: true });
                } else {
                    navigate('/dashboard', { replace: true });
                }
            }, 0);

            return userToSave;
        } catch (error) {
            console.error("[AuthContext] ❌ Login failed:", error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    }, [navigate]);

    const logout = useCallback(() => {
        authUseCases.logout();
        setUser(null);
        setIsAuthenticated(false);
        navigate('/login');
    }, [navigate]);

    const registerStudent = useCallback(async (studentData) => {
        setIsLoading(true);
        try {
            const response = await authUseCases.registerStudent(studentData);
            return response;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const hasRole = useCallback((roles) => {
        if (!user?.role) return false;
        if (Array.isArray(roles)) {
            return roles.includes(user.role);
        }
        return user.role === roles;
    }, [user]);

    const isAdmin = useCallback(() => hasRole('ADMIN') || hasRole(USER_ROLES.ADMIN), [hasRole]);
    const isLecturer = useCallback(() => hasRole('LECTURER') || hasRole(USER_ROLES.LECTURER), [hasRole]);
    const isStudent = useCallback(() => hasRole('STUDENT') || hasRole(USER_ROLES.STUDENT), [hasRole]);

    const value = {
        user,
        isAuthenticated,
        isLoading,
        login,
        logout,
        registerStudent,
        hasRole,
        isAdmin,
        isLecturer,
        isStudent,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export default AuthContext;