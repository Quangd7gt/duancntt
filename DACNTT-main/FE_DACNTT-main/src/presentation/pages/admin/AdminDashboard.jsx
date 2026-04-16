import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { StatsCard } from '../../components/common/Card';
import { getUsersUseCase } from '../../../usecases/users/userUseCases';
import { getSemestersUseCase, getSubjectsUseCase, getCoursesUseCase } from '../../../usecases/courses/courseUseCases';

/**
 * AdminDashboard Component
 * Admin/Secretary overview dashboard with system statistics
 */
const AdminDashboard = () => {
    const { user, isAdmin } = useAuth();
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalCourses: 0,
        totalSemesters: 0,
        totalSubjects: 0,
    });
    const [loading, setLoading] = useState(true);

    // [FIX] Xác định chức danh hiển thị
    const roleTitle = isAdmin() ? 'Admin' : 'Thư ký';

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const [usersRes, semestersRes, subjectsRes, coursesRes] = await Promise.allSettled([
                    getUsersUseCase({ size: 1 }),
                    getSemestersUseCase(),
                    getSubjectsUseCase(),
                    getCoursesUseCase({ size: 1 }),
                ]);

                setStats({
                    totalUsers: usersRes.status === 'fulfilled' ? usersRes.value.total : 0,
                    totalCourses: coursesRes.status === 'fulfilled' ? coursesRes.value.total : 0,
                    totalSemesters: semestersRes.status === 'fulfilled' ? semestersRes.value.length : 0,
                    totalSubjects: subjectsRes.status === 'fulfilled' ? subjectsRes.value.length : 0,
                });
            } catch (error) {
                console.error('Error fetching stats:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Welcome header */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
                <h1 className="text-2xl font-bold">
                    {/* [FIX] Hiển thị đúng chức danh */}
                    Xin chào, {roleTitle}! 
                </h1>
                <p className="text-indigo-100 mt-1">
                    Chào mừng bạn đến với hệ thống quản lý điểm danh sinh viên
                </p>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatsCard
                    title="Tổng người dùng"
                    value={loading ? '-' : stats.totalUsers}
                    icon={{
                        element: (
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                        ),
                        color: 'blue',
                    }}
                />
                <StatsCard
                    title="Lớp học phần"
                    value={loading ? '-' : stats.totalCourses}
                    icon={{
                        element: (
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                        ),
                        color: 'orange',
                    }}
                />
                <StatsCard
                    title="Học kỳ"
                    value={loading ? '-' : stats.totalSemesters}
                    icon={{
                        element: (
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        ),
                        color: 'pink',
                    }}
                />
                <StatsCard
                    title="Môn học"
                    value={loading ? '-' : stats.totalSubjects}
                    icon={{
                        element: (
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        ),
                        color: 'green',
                    }}
                />
            </div>
        </div>
    );
};

export default AdminDashboard;