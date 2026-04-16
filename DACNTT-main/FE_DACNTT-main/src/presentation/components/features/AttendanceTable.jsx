import { clsx } from 'clsx';

/**
 * AttendanceTable Component
 * Displays attendance records for a session
 */
const AttendanceTable = ({
    records = [],
    loading = false,
    showActions = false,
    onUpdateStatus,
    className = '',
}) => {
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
            <span className={clsx(
                'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium',
                styles[status] || 'bg-gray-100 text-gray-800'
            )}>
                {labels[status] || status}
            </span>
        );
    };

    const formatTime = (time) => {
        if (!time) return '-';
        return new Date(time).toLocaleTimeString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    if (loading) {
        return (
            <div className={clsx('bg-white rounded-xl border border-gray-100 p-8', className)}>
                <div className="flex items-center justify-center">
                    <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                    <span className="ml-3 text-gray-500">Đang tải dữ liệu...</span>
                </div>
            </div>
        );
    }

    if (records.length === 0) {
        return (
            <div className={clsx('bg-white rounded-xl border border-gray-100 p-8', className)}>
                <div className="text-center">
                    <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <p className="text-gray-500">Chưa có dữ liệu điểm danh</p>
                </div>
            </div>
        );
    }

    return (
        <div className={clsx('bg-white rounded-xl border border-gray-100 overflow-hidden', className)}>
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-100">
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                STT
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                Mã SV
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                Họ và tên
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                Giờ điểm danh
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                Trạng thái
                            </th>
                            {showActions && (
                                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Thao tác
                                </th>
                            )}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {records.map((record, index) => (
                            <tr
                                key={record.id || index}
                                className="hover:bg-gray-50 transition-colors"
                            >
                                <td className="px-6 py-4 text-sm text-gray-600">
                                    {index + 1}
                                </td>
                                <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                    {record.studentCode}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-900">
                                    {record.studentName}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-600">
                                    {formatTime(record.checkInTime)}
                                </td>
                                <td className="px-6 py-4">
                                    {getStatusBadge(record.status)}
                                </td>
                                {showActions && (
                                    <td className="px-6 py-4 text-right">
                                        <select
                                            value={record.status}
                                            onChange={(e) => onUpdateStatus?.(record.id, e.target.value)}
                                            className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        >
                                            <option value="PRESENT">Có mặt</option>
                                            <option value="ABSENT">Vắng mặt</option>
                                            <option value="LATE">Đi trễ</option>
                                            <option value="EXCUSED">Có phép</option>
                                        </select>
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AttendanceTable;
