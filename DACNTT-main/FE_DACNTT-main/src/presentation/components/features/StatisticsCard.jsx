import React, { useMemo } from 'react';

const StatisticsCard = ({ statistics, onSendBanNotification, onExportExcel }) => {
    // Xử lý dữ liệu an toàn
    const { totalStudents, totalBanned, averageAttendance, list } = useMemo(() => {
        const data = statistics || {};
        
        // Lấy danh sách (Ưu tiên studentStats từ UseCase đã fix)
        const rawList = data.studentStats || data.studentDetails || [];
        
        const totalS = rawList.length;
        // Lấy số lượng cấm thi (ưu tiên số đã tính sẵn từ UseCase)
        const totalB = (typeof data.totalBanned === 'number') 
            ? data.totalBanned 
            : rawList.filter(s => s.isBanned).length;

        // Tính % đi học trung bình
        let avg = 0;
        if (totalS > 0) {
            const sumPercent = rawList.reduce((acc, curr) => {
                const percent = curr.absentPercentage || 0;
                return acc + (100 - percent);
            }, 0);
            avg = Math.round(sumPercent / totalS);
        }

        return { 
            totalStudents: totalS, 
            totalBanned: totalB, 
            averageAttendance: avg, 
            list: rawList 
        };
    }, [statistics]);

    if (!statistics) {
        return <div className="p-8 text-center text-gray-500">Đang tải dữ liệu thống kê...</div>;
    }

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header Buttons */}
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Thống kê điểm danh</h3>
                <div className="space-x-2">
                    <button
                        onClick={onExportExcel}
                        className="px-4 py-2 bg-green-50 text-green-700 rounded-lg text-sm font-medium hover:bg-green-100 transition-colors inline-flex items-center"
                    >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Xuất Excel
                    </button>
                </div>
            </div>

            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Tổng SV */}
                <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg transform transition hover:scale-105 duration-200">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-indigo-100 text-sm font-medium mb-1">Tổng sinh viên</p>
                            <h3 className="text-3xl font-bold">{totalStudents}</h3>
                        </div>
                        <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                        </div>
                    </div>
                </div>

                {/* Tỷ lệ đi học */}
                <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-6 text-white shadow-lg transform transition hover:scale-105 duration-200">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-emerald-100 text-sm font-medium mb-1">Tỷ lệ đi học TB</p>
                            <h3 className="text-3xl font-bold">{averageAttendance}%</h3>
                        </div>
                        <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                    </div>
                </div>

                {/* SV Cấm thi */}
                <div className="bg-gradient-to-br from-rose-500 to-pink-600 rounded-2xl p-6 text-white shadow-lg transform transition hover:scale-105 duration-200">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-rose-100 text-sm font-medium mb-1">SV bị cấm thi</p>
                            <h3 className="text-3xl font-bold">{totalBanned}</h3>
                        </div>
                        <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                    </div>
                    {totalBanned > 0 && (
                        <button 
                            onClick={onSendBanNotification}
                            className="mt-4 w-full py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors flex items-center justify-center backdrop-blur-sm border border-white/10"
                        >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            Gửi email cảnh báo
                        </button>
                    )}
                </div>
            </div>

            {/* Detailed List */}
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden mt-6 shadow-sm">
                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                    <h4 className="font-semibold text-gray-900">Chi tiết tình hình chuyên cần</h4>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mã SV</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Họ tên</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Vắng / Tổng</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Tỷ lệ vắng</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {list.length > 0 ? (
                                list.map((student, index) => (
                                    <tr key={index} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{student.studentCode}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.studentName}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-500">
                                            <span className="text-red-600 font-bold">{student.absentSessions}</span> 
                                            <span className="text-gray-400 mx-1">/</span> 
                                            {student.totalSessions}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                                                (student.absentPercentage || 0) >= 20 
                                                ? 'bg-red-100 text-red-800' 
                                                : (student.absentPercentage || 0) > 0 
                                                    ? 'bg-yellow-100 text-yellow-800' 
                                                    : 'bg-green-100 text-green-800'
                                            }`}>
                                                {student.absentPercentage || 0}%
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            {student.isBanned ? (
                                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800 border border-red-200">
                                                    🚫 Cấm thi
                                                </span>
                                            ) : (
                                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 border border-green-200">
                                                    ✅ Đủ điều kiện
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                                        Chưa có dữ liệu thống kê.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default StatisticsCard;