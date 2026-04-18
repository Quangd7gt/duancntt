import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import QRScanner from '../../components/features/QRScanner';
import { Alert } from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import { checkInUseCase } from '../../../usecases/attendance/attendanceUseCases';
import { getMyCoursesUseCase } from '../../../usecases/courses/courseUseCases';
import { useAuth } from '../../../presentation/context/AuthContext';


const CheckInPage = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [mode, setMode] = useState('scan'); // 'scan' or 'manual'
    const [manualCode, setManualCode] = useState('');

    // Course selection state
    const [courses, setCourses] = useState([]);
    const [selectedCourseId, setSelectedCourseId] = useState('');
    const [loadingCourses, setLoadingCourses] = useState(true);

    // Fetch student's courses on mount
    useEffect(() => {
        const fetchCourses = async () => {
            try {
                setLoadingCourses(true);
                // [FIX LỖI 2] Chỉ gọi API getMyCourses chuẩn của Backend
                console.log('=== FETCH STUDENT COURSES (MY COURSES) ===');
                
                const courseList = await getMyCoursesUseCase();
                
                if (Array.isArray(courseList)) {
                    setCourses(courseList);
                } else {
                    setCourses([]);
                }

            } catch (err) {
                console.error('Error fetching courses:', err);
                setError('Không thể tải danh sách lớp học. Vui lòng thử lại.');
            } finally {
                setLoadingCourses(false);
            }
        };

        if (user) {
            fetchCourses();
        }
    }, [user]);

    const handleCheckIn = async (qrData) => {
        // Reset trạng thái trước khi gọi API
        setLoading(true);
        setError('');
        setSuccess('');
        setResult(null);

        if (!selectedCourseId) {
            setError('Vui lòng chọn lớp học trước khi điểm danh');
            setLoading(false);
            return;
        }

        // --- LẤY TỌA ĐỘ GPS ---
        let latitude = null;
        let longitude = null;

        try {
            const position = await new Promise((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject, {
                    enableHighAccuracy: false,
                    timeout: 15000
                });
            });
            latitude = position.coords.latitude;
            longitude = position.coords.longitude;
        } catch (gpsError) {
            console.error('GPS Error Details:', gpsError);
            let msg = 'Không thể lấy vị trí: ';
            switch (gpsError.code) {
                case 1: msg += 'Bạn đã từ chối quyền truy cập vị trí.'; break;
                case 2: msg += 'Không thể xác định vị trí (Sóng yếu hoặc lỗi OS).'; break;
                case 3: msg += 'Hết thời gian chờ (Timeout).'; break;
                default: msg += 'Lỗi không xác định.';
            }
            setError(msg);
            setLoading(false);
            return; // Chặn luôn không cho gửi null lên BE
        }

        const payload = {
            qrCodeData: qrData,
            courseId: selectedCourseId,
            latitude,
            longitude
        };

        console.log('=== CHECK-IN REQUEST WITH GPS ===');
        console.log('CheckIn Payload:', JSON.stringify(payload, null, 2));

        try {
            const response = await checkInUseCase(payload);

            console.log('CheckIn Response:', response);

            setResult(response);
            setSuccess('Điểm danh thành công!');
        } catch (err) {
            console.error('CheckIn Error:', err);
            setError(err.message || 'Không thể điểm danh. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    const handleManualSubmit = (e) => {
        e.preventDefault();
        if (manualCode.trim()) {
            handleCheckIn(manualCode.trim());
        }
    };

    const courseOptions = courses.map(course => ({
        value: course.id,
        label: course.subject?.subjectName
            ? `${course.subject.subjectName} (${course.subject.subjectCode || course.courseCode || ''})`
            : course.subjectName
                ? `${course.subjectName} (${course.courseCode || ''})`
                : `Lớp ${course.courseCode || course.id}`
    }));

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            {/* Header */}
            <div className="text-center">
                <h1 className="text-2xl font-bold text-gray-900">Điểm danh</h1>
                <p className="text-gray-500 mt-1">Quét mã QR hoặc nhập mã để điểm danh</p>
            </div>

            {/* [FIX] Hiển thị Alert nếu có lỗi hoặc thành công */}
            {success && <Alert type="success" message={success} onClose={() => setSuccess('')} />}
            {error && <Alert type="error" message={error} onClose={() => setError('')} />}

            {/* Course Selection or Manual ID Input */}
            {!result && (
                <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Thông tin lớp học</h3>

                    {/* Fallback to Manual Input if no courses found or error */}
                    {courses.length > 0 ? (
                        <>
                            <Select
                                name="courseId"
                                label="Chọn lớp học phần"
                                value={selectedCourseId}
                                onChange={(e) => setSelectedCourseId(e.target.value)}
                                options={courseOptions}
                                placeholder={loadingCourses ? "Đang tải danh sách..." : "Chọn lớp học để điểm danh"}
                                disabled={loadingCourses || loading}
                                required
                            />
                            <div className="mt-2 text-right">
                                <button
                                    type="button"
                                    onClick={() => setCourses([])} // Force manual mode
                                    className="text-xs text-indigo-600 hover:underline"
                                >
                                    Không thấy lớp? Nhập ID thủ công
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className="animate-fade-in">
                            <Input
                                name="manualCourseId"
                                label="ID Lớp học (Nhập thủ công)"
                                value={selectedCourseId}
                                onChange={(e) => setSelectedCourseId(e.target.value)}
                                placeholder="Nhập ID lớp học (VD: 101)"
                                required
                                disabled={loading}
                                type="number"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                * Do hệ thống không tải được danh sách lớp, vui lòng nhập ID lớp học thủ công.
                            </p>
                            <div className="mt-2 text-right">
                                <button
                                    type="button"
                                    onClick={() => window.location.reload()}
                                    className="text-xs text-indigo-600 hover:underline"
                                >
                                    Thử tải lại danh sách
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Mode Toggle */}
            {!result && (
                <div className="flex justify-center">
                    <div className="bg-gray-100 rounded-xl p-1 inline-flex">
                        <button
                            onClick={() => setMode('scan')}
                            className={`px-6 py-2.5 rounded-lg font-medium transition-all ${mode === 'scan'
                                ? 'bg-white text-indigo-600 shadow'
                                : 'text-gray-600 hover:text-gray-900'
                                }`}
                        >
                            📷 Quét QR
                        </button>
                        <button
                            onClick={() => setMode('manual')}
                            className={`px-6 py-2.5 rounded-lg font-medium transition-all ${mode === 'manual'
                                ? 'bg-white text-indigo-600 shadow'
                                : 'text-gray-600 hover:text-gray-900'
                                }`}
                        >
                            ⌨️ Nhập mã
                        </button>
                    </div>
                </div>
            )}

            {/* Scanner or Manual Input or Result */}
            <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
                {result ? (
                    <div className="text-center py-8">
                        <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
                            <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Điểm danh thành công!</h2>
                        <p className="text-gray-600 mb-6">
                            Trạng thái: {result.attendanceStatus === 'PRESENT' ? 'Có mặt' : result.attendanceStatus}
                        </p>
                        <div className="flex justify-center space-x-4">
                            <Button onClick={() => { setResult(null); setManualCode(''); setSuccess(''); }}>
                                Điểm danh tiếp
                            </Button>
                            <Button variant="secondary" onClick={() => navigate('/student/dashboard')}>
                                Về trang chủ
                            </Button>
                        </div>
                    </div>
                ) : mode === 'scan' ? (
                    <div className="space-y-4">
                        {!selectedCourseId ? (
                            <div className="text-center py-8 bg-gray-50 rounded-lg">
                                <p className="text-gray-500">Vui lòng chọn lớp học ở trên để bật Camera</p>
                            </div>
                        ) : (
                            <QRScanner onScan={handleCheckIn} />
                        )}
                    </div>
                ) : (
                    <form onSubmit={handleManualSubmit} className="space-y-4">
                        <div className="text-center mb-4">
                            <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-indigo-100 flex items-center justify-center">
                                <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900">Nhập mã điểm danh</h3>
                            <p className="text-sm text-gray-500">Nhập mã do giảng viên cung cấp</p>
                        </div>
                        <Input
                            name="code"
                            label="Mã điểm danh"
                            value={manualCode}
                            onChange={(e) => setManualCode(e.target.value)}
                            placeholder="Nhập mã điểm danh từ giảng viên"
                            required
                            disabled={!selectedCourseId}
                        />
                        <Button type="submit" className="w-full" loading={loading} disabled={!selectedCourseId}>
                            Điểm danh
                        </Button>
                    </form>
                )}
            </div>

            {/* Instructions */}
            {!result && (
                <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
                    <div className="flex items-start space-x-3">
                        <svg className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div>
                            <h4 className="font-medium text-amber-800">Hướng dẫn</h4>
                            <ul className="mt-1 text-sm text-amber-700 list-disc list-inside space-y-1">
                                <li><strong>Bước 1:</strong> Chọn lớp học bạn muốn điểm danh</li>
                                {mode === 'scan' ? (
                                    <>
                                        <li><strong>Bước 2:</strong> Đưa Camera vào mã QR của giảng viên</li>
                                        <li>Giữ điện thoại ổn định để quét</li>
                                    </>
                                ) : (
                                    <>
                                        <li><strong>Bước 2:</strong> Nhập mã điểm danh do giảng viên đọc</li>
                                        <li>Bấm nút "Điểm danh"</li>
                                    </>
                                )}
                            </ul>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CheckInPage;