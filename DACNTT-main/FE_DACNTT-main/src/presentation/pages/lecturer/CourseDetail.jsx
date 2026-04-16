import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Button from '../../components/common/Button';
import { Alert } from '../../components/common/Card';
import QRCodeGenerator from '../../components/features/QRCodeGenerator';
import StatisticsCard from '../../components/features/StatisticsCard';
import { 
    getCourseByIdUseCase, 
    getCourseStudentsUseCase, 
    getCourseStatisticsUseCase, 
    sendBanNotificationsUseCase, 
    exportExcelUseCase 
} from '../../../usecases/courses/courseUseCases';
import { startSessionUseCase, closeSessionUseCase } from '../../../usecases/attendance/attendanceUseCases';

const CourseDetail = () => {
    const { courseId } = useParams();
    const navigate = useNavigate();
    
    // Data States
    const [course, setCourse] = useState(null);
    const [students, setStudents] = useState([]);
    const [statsData, setStatsData] = useState(null); 
    const [currentSession, setCurrentSession] = useState(null);
    
    // UI States
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('students');
    const [error, setError] = useState('');
    
    // Action Loading States
    const [sessionLoading, setSessionLoading] = useState(false);
    const [emailLoading, setEmailLoading] = useState(false);
    const [excelLoading, setExcelLoading] = useState(false);

    // FETCH DATA
    useEffect(() => {
        const loadData = async () => {
            try {
                const [courseRes, studentRes, statsRes] = await Promise.all([
                    getCourseByIdUseCase(courseId),
                    getCourseStudentsUseCase(courseId),
                    getCourseStatisticsUseCase(courseId)
                ]);

                setCourse(courseRes);
                setStudents(studentRes);
                setStatsData(statsRes); 
            } catch (err) {
                console.error("Lỗi Fetch:", err);
                setError("Không thể tải dữ liệu lớp học");
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [courseId]);

    // HANDLERS
    const handleStartSession = async () => {
        setSessionLoading(true);
        try {
            const res = await startSessionUseCase(courseId);
            setCurrentSession(res);
            toast.success("Đã mở phiên điểm danh");
        } catch (err) { toast.error(err.message || "Lỗi mở phiên"); }
        finally { setSessionLoading(false); }
    };

    const handleCloseSession = async () => {
        setSessionLoading(true);
        try {
            await closeSessionUseCase(courseId);
            setCurrentSession(null);
            toast.success("Đã đóng phiên");
        } catch (err) { toast.error(err.message || "Lỗi đóng phiên"); }
        finally { setSessionLoading(false); }
    };

    const handleEmail = async () => {
        setEmailLoading(true);
        try {
            await sendBanNotificationsUseCase(courseId);
            toast.success("Gửi email cảnh báo thành công");
        } catch (err) { toast.error("Lỗi gửi email"); }
        finally { setEmailLoading(false); }
    };

    const handleExcel = async () => {
        setExcelLoading(true);
        try {
            await exportExcelUseCase(courseId, course?.courseCode || 'report');
            toast.success("Tải file thành công");
        } catch (err) { toast.error("Lỗi tải file"); }
        finally { setExcelLoading(false); }
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
        </div>
    );

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header Area */}
            <div className="flex justify-between items-center">
                <div>
                    <button onClick={() => navigate(-1)} className="text-gray-500 hover:text-gray-700 mb-2 flex items-center">
                        <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Quay lại
                    </button>
                    <h1 className="text-2xl font-bold text-gray-900">{course?.subjectName}</h1>
                    <p className="text-gray-500">{course?.courseCode}</p>
                </div>
                <div>
                    {!currentSession ? (
                        <Button onClick={handleStartSession} loading={sessionLoading} variant="success">
                             <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                            </svg>
                            Mở điểm danh
                        </Button>
                    ) : (
                        <Button onClick={handleCloseSession} loading={sessionLoading} variant="danger">
                             <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            Đóng điểm danh
                        </Button>
                    )}
                </div>
            </div>

            {error && <Alert type="error" message={error} onClose={() => setError('')} />}

            {currentSession && (
                <div className="bg-white p-6 rounded-xl border border-indigo-200 text-center shadow-md mb-6 animate-fade-in">
                    <h2 className="text-xl font-bold text-indigo-800 mb-4">Đang mở điểm danh</h2>
                    <div className="inline-block p-4 border-2 border-dashed border-indigo-200 bg-white rounded-xl">
                        <QRCodeGenerator value={currentSession.qrCodeData} size={250} />
                    </div>
                    <p className="text-gray-500 mt-2 text-sm">Yêu cầu sinh viên quét mã để điểm danh</p>
                </div>
            )}

            {/* Tabs */}
            <div className="border-b border-gray-200">
                <nav className="flex space-x-8">
                    <button
                        onClick={() => setActiveTab('students')}
                        className={`py-4 px-1 border-b-2 font-medium transition-colors ${
                            activeTab === 'students' 
                            ? 'border-indigo-500 text-indigo-600' 
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        Danh sách Sinh viên
                    </button>
                    <button
                        onClick={() => setActiveTab('statistics')}
                        className={`py-4 px-1 border-b-2 font-medium transition-colors ${
                            activeTab === 'statistics' 
                            ? 'border-indigo-500 text-indigo-600' 
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        Thống kê
                    </button>
                </nav>
            </div>

            {/* Content Area */}
            {activeTab === 'students' && (
                <div className="bg-white rounded-xl border border-gray-100 overflow-hidden mt-6 animate-fade-in">
                    <div className="p-4 border-b border-gray-100 flex justify-end gap-2 bg-gray-50">
                        <Button variant="secondary" onClick={handleExcel} size="sm" loading={excelLoading}>Xuất Excel</Button>
                        <Button variant="danger" onClick={handleEmail} size="sm" loading={emailLoading}>Gửi cảnh báo</Button>
                    </div>
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Mã SV</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Họ tên</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Email</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {students.length > 0 ? students.map((s, i) => (
                                <tr key={i} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{s.studentCode}</td>
                                    <td className="px-6 py-4 text-sm text-gray-900">{s.firstName} {s.lastName}</td>
                                    <td className="px-6 py-4 text-sm text-gray-500">{s.email}</td>
                                </tr>
                            )) : (
                                <tr><td colSpan="3" className="p-8 text-center text-gray-500">Chưa có sinh viên</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* STATISTICS CARD */}
            {activeTab === 'statistics' && (
                <div className="mt-6">
                    <StatisticsCard 
                        statistics={statsData} 
                        onExportExcel={handleExcel} 
                        onSendBanNotification={handleEmail} 
                    />
                </div>
            )}
        </div>
    );
};

export default CourseDetail;