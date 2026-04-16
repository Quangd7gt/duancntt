import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { PageLoading } from '../components/common/Loading';

// Layouts
import MainLayout from '../components/layout/MainLayout';
import AuthLayout from '../components/layout/AuthLayout';

// Auth Pages
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';

// Admin Pages (Thư ký dùng chung các trang này)
import AdminDashboard from '../pages/admin/AdminDashboard';
import UserManagement from '../pages/admin/UserManagement';
import SemesterManagement from '../pages/admin/SemesterManagement';
import SubjectManagement from '../pages/admin/SubjectManagement';
import CourseManagement from '../pages/admin/CourseManagement';

// Lecturer Pages
import LecturerDashboard from '../pages/lecturer/LecturerDashboard';
import CourseDetail from '../pages/lecturer/CourseDetail';
import LecturerLeaveRequests from '../pages/lecturer/LecturerLeaveRequests';

// Student Pages
import StudentDashboard from '../pages/student/StudentDashboard';
import CheckInPage from '../pages/student/CheckInPage';
import AttendanceHistory from '../pages/student/AttendanceHistory';
import LeaveRequestPage from '../pages/student/LeaveRequestPage';

// Common Pages
import ProfilePage from '../pages/common/ProfilePage';

/**
 * Helper to normalize role
 * ROLE_ADMIN -> ADMIN
 * ROLE_SECRETARY -> SECRETARY
 */
const normalizeRole = (role) => {
    if (!role) return null;
    return role.replace('ROLE_', '');
};

/**
 * Protected Route Component
 */
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
    const { isAuthenticated, isLoading, user } = useAuth();

    if (isLoading) {
        return <PageLoading />;
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    const normalizedUserRole = normalizeRole(user?.role);

    // Kiểm tra quyền truy cập
    if (allowedRoles.length > 0 && !allowedRoles.includes(normalizedUserRole)) {
        // Redirect thông minh dựa trên role
        if (normalizedUserRole === 'ADMIN' || normalizedUserRole === 'SECRETARY') {
            return <Navigate to="/admin/dashboard" replace />;
        }
        if (normalizedUserRole === 'LECTURER') return <Navigate to="/lecturer/dashboard" replace />;
        if (normalizedUserRole === 'STUDENT') return <Navigate to="/student/dashboard" replace />;
        
        return <Navigate to="/login" replace />;
    }

    return children;
};

/**
 * Public Route Component
 */
const PublicRoute = ({ children }) => {
    const { isAuthenticated, isLoading, user } = useAuth();

    if (isLoading) {
        return <PageLoading />;
    }

    if (isAuthenticated && user?.role) {
        const normalizedRole = normalizeRole(user.role);
        if (normalizedRole === 'ADMIN' || normalizedRole === 'SECRETARY') {
            return <Navigate to="/admin/dashboard" replace />;
        }
        if (normalizedRole === 'LECTURER') return <Navigate to="/lecturer/dashboard" replace />;
        if (normalizedRole === 'STUDENT') return <Navigate to="/student/dashboard" replace />;
    }

    return children;
};

/**
 * Smart Redirect Component
 */
const SmartRedirect = () => {
    const { isAuthenticated, isLoading, user } = useAuth();

    if (isLoading) {
        return <PageLoading />;
    }

    if (isAuthenticated && user?.role) {
        const normalizedRole = normalizeRole(user.role);
        if (normalizedRole === 'ADMIN' || normalizedRole === 'SECRETARY') {
            return <Navigate to="/admin/dashboard" replace />;
        }
        if (normalizedRole === 'LECTURER') return <Navigate to="/lecturer/dashboard" replace />;
        if (normalizedRole === 'STUDENT') return <Navigate to="/student/dashboard" replace />;
    }

    return <Navigate to="/login" replace />;
};

/**
 * App Routes Component
 */
const AppRoutes = () => {
    return (
        <Routes>
            {/* Public Routes */}
            <Route element={<AuthLayout />}>
                <Route
                    path="/login"
                    element={
                        <PublicRoute>
                            <LoginPage />
                        </PublicRoute>
                    }
                />
                <Route
                    path="/register"
                    element={
                        <PublicRoute>
                            <RegisterPage />
                        </PublicRoute>
                    }
                />
            </Route>

            {/* Admin & Secretary Routes (Dùng chung Layout & Pages) */}
            <Route
                element={
                    // [UPDATED] Cho phép cả ADMIN và SECRETARY
                    <ProtectedRoute allowedRoles={['ADMIN', 'SECRETARY']}>
                        <MainLayout />
                    </ProtectedRoute>
                }
            >
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                <Route path="/admin/users" element={<UserManagement />} />
                <Route path="/admin/semesters" element={<SemesterManagement />} />
                <Route path="/admin/subjects" element={<SubjectManagement />} />
                <Route path="/admin/courses" element={<CourseManagement />} />
                
                {/* Profile chung cho Admin/Secretary */}
                <Route path="/admin/profile" element={<ProfilePage />} />
            </Route>

            {/* Lecturer Routes */}
            <Route
                element={
                    <ProtectedRoute allowedRoles={['LECTURER']}>
                        <MainLayout />
                    </ProtectedRoute>
                }
            >
                <Route path="/lecturer/dashboard" element={<LecturerDashboard />} />
                <Route path="/lecturer/courses/:courseId" element={<CourseDetail />} />
                <Route path="/lecturer/leave-requests" element={<LecturerLeaveRequests />} />
                <Route path="/lecturer/profile" element={<ProfilePage />} />
            </Route>

            {/* Student Routes */}
            <Route
                element={
                    <ProtectedRoute allowedRoles={['STUDENT']}>
                        <MainLayout />
                    </ProtectedRoute>
                }
            >
                <Route path="/student/dashboard" element={<StudentDashboard />} />
                <Route path="/student/checkin" element={<CheckInPage />} />
                <Route path="/student/history" element={<AttendanceHistory />} />
                <Route path="/student/leave-requests" element={<LeaveRequestPage />} />
                <Route path="/student/profile" element={<ProfilePage />} />
            </Route>

            {/* Default Routes */}
            <Route path="/" element={<SmartRedirect />} />
            <Route path="/dashboard" element={<SmartRedirect />} />
            <Route path="*" element={<SmartRedirect />} />
        </Routes>
    );
};

const AppRouter = () => {
    return (
        <BrowserRouter>
            <AuthProvider>
                <AppRoutes />
            </AuthProvider>
        </BrowserRouter>
    );
};

export default AppRouter;