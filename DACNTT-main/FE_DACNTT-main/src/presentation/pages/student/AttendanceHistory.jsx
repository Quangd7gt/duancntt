import { useState, useEffect } from 'react';
import { Alert } from '../../components/common/Card';
import { getMyCoursesUseCase } from '../../../usecases/courses/courseUseCases';
import { getStudentHistoryUseCase } from '../../../usecases/attendance/attendanceUseCases';
import { formatDate, formatTime } from '../../../utils/dateUtils';

/**
 * AttendanceHistory Component
 * Student's attendance history page
 */
const AttendanceHistory = () => {
    const [courses, setCourses] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [historyLoading, setHistoryLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                // Use getMyCoursesUseCase for students
                const result = await getMyCoursesUseCase();
                setCourses(Array.isArray(result) ? result : []);
            } catch (err) {
                console.error('Fetch Courses Error:', err);
                setError('Không thể tải danh sách lớp học');
            } finally {
                setLoading(false);
            }
        };
        fetchCourses();
    }, []);

    const handleSelectCourse = async (course) => {
        setSelectedCourse(course);
        setHistoryLoading(true);
        try {
            const result = await getStudentHistoryUseCase(course.id);
            setHistory(Array.isArray(result) ? result : []);
        } catch (err) {
            console.error('Fetch History Error:', err);
            setError('Không thể tải lịch sử điểm danh');
        } finally {
            setHistoryLoading(false);
        }
    };

    const getStatusBadge = (status) => {
        const styles = {
            PRESENT: 'bg-green-100 text-green-800',
            ABSENT: 'bg-red-100 text-red-800',
            LATE: 'bg-amber-100 text-amber-800',
            EXCUSED: 'bg-blue-100 text-blue-800',
        };
        const labels = {
            PRESENT: 'Có mặt',
            ABSENT: 'Vắng mặt',
            LATE: 'Đi trễ',
            EXCUSED: 'Có phép',
        };
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status] || 'bg-gray-100'}`}>
                {labels[status] || status}
            </span>
        );
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Lịch sử điểm danh</h1>
                <p className="text-gray-500">Xem chi tiết điểm danh của bạn theo từng lớp học</p>
            </div>

            {error && <Alert type="error" message={error} onClose={() => setError('')} />}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Course list */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
                        <h3 className="font-semibold text-gray-900 mb-4">Chọn lớp học</h3>
                        {loading ? (
                            <div className="flex items-center justify-center py-8">
                                <div className="w-6 h-6 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                            </div>
                        ) : courses.length === 0 ? (
                            <p className="text-gray-500 text-center py-4">Không có lớp học nào</p>
                        ) : (
                            <div className="space-y-2">
                                {courses.map((course) => (
                                    <button
                                        key={course.id}
                                        onClick={() => handleSelectCourse(course)}
                                        className={`w-full p-3 rounded-lg text-left transition-colors ${selectedCourse?.id === course.id
                                            ? 'bg-indigo-100 border-indigo-300 border shadow-sm'
                                            : 'bg-gray-50 hover:bg-gray-100'
                                            }`}
                                    >
                                        <p className="font-medium text-gray-900">{course.subjectName}</p>
                                        <p className="text-sm text-gray-500">{course.courseCode}</p>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* History table */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
                        {!selectedCourse ? (
                            <div className="text-center py-12">
                                <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                                <p className="text-gray-500">Chọn một lớp học để xem lịch sử</p>
                            </div>
                        ) : historyLoading ? (
                            <div className="flex items-center justify-center py-12">
                                <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                            </div>
                        ) : (
                            <>
                                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
                                    <h3 className="font-semibold text-gray-900">{selectedCourse.subjectName}</h3>
                                    <p className="text-sm text-gray-500">{selectedCourse.courseCode}</p>
                                </div>
                                {history.length === 0 ? (
                                    <div className="text-center py-8">
                                        <p className="text-gray-500">Chưa có dữ liệu điểm danh</p>
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Buổi</th>
                                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Ngày</th>
                                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Giờ điểm danh</th>
                                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Trạng thái</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100">
                                                {history.map((record, index) => (
                                                    <tr key={record.id || index} className="hover:bg-gray-50">
                                                        <td className="px-6 py-4 text-sm text-gray-900 font-medium">Buổi {history.length - index}</td>
                                                        <td className="px-6 py-4 text-sm text-gray-600">
                                                            {/* [FIX] Dùng đúng tên trường từ Backend: sessionDate */}
                                                            {formatDate(record.sessionDate)}
                                                        </td>
                                                        <td className="px-6 py-4 text-sm text-gray-600">
                                                            {/* Nếu vắng thì hiển thị gạch ngang */}
                                                            {record.status === 'ABSENT' ? '-' : formatTime(record.checkInTime)}
                                                        </td>
                                                        <td className="px-6 py-4">{getStatusBadge(record.status)}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}

                                {/* Summary */}
                                {history.length > 0 && (
                                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-gray-600 font-medium">Tổng: {history.length} buổi</span>
                                            <div className="flex space-x-4">
                                                <span className="text-green-600 font-medium">Có mặt: {history.filter(h => h.status === 'PRESENT').length}</span>
                                                <span className="text-red-600 font-medium">Vắng: {history.filter(h => h.status === 'ABSENT').length}</span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AttendanceHistory;