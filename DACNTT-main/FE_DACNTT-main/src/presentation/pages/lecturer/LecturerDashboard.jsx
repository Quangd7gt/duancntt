import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { StatsCard } from '../../components/common/Card';
import { getCoursesByLecturerUseCase } from '../../../usecases/courses/courseUseCases';

/**
 * LecturerDashboard Component
 * Lecturer overview dashboard with course list
 */
const LecturerDashboard = () => {
    const { user } = useAuth();
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                if (user?.id) {
                    console.log('=== FETCH LECTURER COURSES ===');
                    console.log('Lecturer User ID:', user.id);

                    // [FIX] Gọi đúng UseCase lấy lớp theo ID giảng viên
                    const result = await getCoursesByLecturerUseCase(user.id);

                    console.log('Courses Response:', result);
                    // Đảm bảo result là mảng
                    const courseList = Array.isArray(result) ? result : [];
                    setCourses(courseList);
                }
            } catch (error) {
                console.error('Error fetching lecturer courses:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchCourses();
    }, [user?.id]);

    const getDayLabel = (day) => {
        const days = {
            MONDAY: 'Thứ 2',
            TUESDAY: 'Thứ 3',
            WEDNESDAY: 'Thứ 4',
            THURSDAY: 'Thứ 5',
            FRIDAY: 'Thứ 6',
            SATURDAY: 'Thứ 7',
            SUNDAY: 'CN',
        };
        return days[day] || day;
    };

    return (
        <div className="space-y-6">
            {/* Welcome header */}
            <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl p-6 text-white">
                <h1 className="text-2xl font-bold">
                    Xin chào, {user?.fullName || 'Giảng viên'}!
                </h1>
                <p className="text-blue-100 mt-1">
                    Quản lý điểm danh cho các lớp học của bạn
                </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatsCard
                    title="Lớp đang dạy"
                    value={loading ? '-' : courses.length}
                    icon={{
                        element: (
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                        ),
                        color: 'blue',
                    }}
                />
                <StatsCard
                    title="Buổi học hôm nay"
                    value={loading ? '-' : courses.filter(c => {
                        const today = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase();
                        return c.dayOfWeek === today;
                    }).length}
                    icon={{
                        element: (
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        ),
                        color: 'green',
                    }}
                />
                <StatsCard
                    title="Tổng sinh viên"
                    value={loading ? '-' : courses.reduce((sum, c) => sum + (c.currentStudents || 0), 0)}
                    icon={{
                        element: (
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                        ),
                        color: 'purple',
                    }}
                />
            </div>

            {/* Course list */}
            <div className="bg-white rounded-xl border border-gray-100 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Danh sách lớp học</h2>

                {loading ? (
                    <div className="flex items-center justify-center py-8">
                        <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                    </div>
                ) : courses.length === 0 ? (
                    <div className="text-center py-8">
                        <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        <p className="text-gray-500">Bạn chưa được phân công lớp nào</p>
                    </div>
                ) : (
                    <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                        {courses.map((course) => (
                            <Link
                                key={course.id}
                                to={`/lecturer/courses/${course.id}`}
                                className="block p-4 rounded-xl border border-gray-100 hover:border-indigo-200 hover:shadow-md transition-all"
                            >
                                <div className="flex items-start justify-between">
                                    <div>
                                        <h3 className="font-semibold text-gray-900">{course.subjectName}</h3>
                                        <p className="text-sm text-indigo-600 font-medium">{course.courseCode}</p>
                                    </div>
                                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                                        {getDayLabel(course.dayOfWeek)}
                                    </span>
                                </div>
                                <div className="mt-3 flex items-center text-sm text-gray-500 space-x-4">
                                    <span className="flex items-center">
                                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        {course.startTime} - {course.endTime}
                                    </span>
                                    <span className="flex items-center">
                                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                        {course.room}
                                    </span>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default LecturerDashboard;