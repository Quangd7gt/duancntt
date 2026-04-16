import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/**
 * StudentDashboard Component
 * Student overview dashboard
 */
const StudentDashboard = () => {
    const { user } = useAuth();

    return (
        <div className="space-y-6">
            {/* Welcome header */}
            <div className="bg-gradient-to-r from-green-600 to-teal-600 rounded-2xl p-6 text-white">
                <h1 className="text-2xl font-bold">
                    Xin chào, {user?.fullName || 'Sinh viên'}! 
                </h1>
                <p className="text-green-100 mt-1">
                    Mã sinh viên: {user?.studentCode || 'N/A'}
                </p>
            </div>

            {/* Quick actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Link
                    to="/student/checkin"
                    className="block p-6 bg-white rounded-xl border border-gray-100 hover:border-indigo-200 hover:shadow-lg transition-all group"
                >
                    <div className="flex items-center space-x-4">
                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900">Điểm danh</h3>
                            <p className="text-gray-500">Quét mã QR hoặc nhập mã để điểm danh</p>
                        </div>
                    </div>
                </Link>

                <Link
                    to="/student/history"
                    className="block p-6 bg-white rounded-xl border border-gray-100 hover:border-green-200 hover:shadow-lg transition-all group"
                >
                    <div className="flex items-center space-x-4">
                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-green-500 to-teal-500 flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900">Lịch sử điểm danh</h3>
                            <p className="text-gray-500">Xem chi tiết điểm danh theo từng lớp học</p>
                        </div>
                    </div>
                </Link>
            </div>

            {/* Info cards */}
            <div className="bg-white rounded-xl border border-gray-100 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Hướng dẫn điểm danh</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 rounded-lg bg-indigo-50">
                        <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600 mb-3">
                            <span className="text-xl font-bold">1</span>
                        </div>
                        <h4 className="font-medium text-gray-900 mb-1">Vào lớp học</h4>
                        <p className="text-sm text-gray-600">Đến lớp đúng giờ và chờ giảng viên mở điểm danh</p>
                    </div>
                    <div className="p-4 rounded-lg bg-green-50">
                        <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center text-green-600 mb-3">
                            <span className="text-xl font-bold">2</span>
                        </div>
                        <h4 className="font-medium text-gray-900 mb-1">Quét mã QR</h4>
                        <p className="text-sm text-gray-600">Sử dụng camera điện thoại quét mã QR do giảng viên hiển thị</p>
                    </div>
                    <div className="p-4 rounded-lg bg-purple-50">
                        <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center text-purple-600 mb-3">
                            <span className="text-xl font-bold">3</span>
                        </div>
                        <h4 className="font-medium text-gray-900 mb-1">Hoàn tất</h4>
                        <p className="text-sm text-gray-600">Xác nhận điểm danh thành công và tiếp tục học tập</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentDashboard;