import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import { getMyCoursesUseCase } from '../../../usecases/courses/courseUseCases';
import { createLeaveRequestUseCase, getMyLeaveRequestsUseCase } from '../../../usecases/attendance/leaveRequestUseCases';
import { formatDate } from '../../../utils/dateUtils';

const LeaveRequestPage = () => {
    // Data states
    const [courses, setCourses] = useState([]);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Form states
    const [formData, setFormData] = useState({
        courseId: '',
        reason: '',
        leaveDate: '', // Chú ý: Backend map vào requestDate
        type: 'ABSENCE' // [FIX] Mặc định phải là ABSENCE hoặc LATE
    });
    const [submitting, setSubmitting] = useState(false);

    // Initial Load
    useEffect(() => {
        const initData = async () => {
            try {
                const [coursesRes, historyRes] = await Promise.all([
                    getMyCoursesUseCase(),
                    getMyLeaveRequestsUseCase()
                ]);

                setCourses(Array.isArray(coursesRes) ? coursesRes : []);
                setHistory(Array.isArray(historyRes) ? historyRes : []);
            } catch (err) {
                console.error('Init data error:', err);
                toast.error('Không thể tải dữ liệu.');
            } finally {
                setLoading(false);
            }
        };
        initData();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            // Mapping dữ liệu cho khớp với Backend
            // Frontend dùng leaveDate, Backend cần requestDate
            const payload = {
                courseId: formData.courseId,
                reason: formData.reason,
                type: formData.type,
                requestDate: formData.leaveDate // Map lại tên biến
            };

            await createLeaveRequestUseCase(payload);
            toast.success('Gửi đơn xin nghỉ thành công!');
            
            // Reset form
            setFormData({
                courseId: '',
                reason: '',
                leaveDate: '',
                type: 'ABSENCE' // [FIX] Reset về giá trị hợp lệ
            });

            // Tải lại lịch sử
            const updatedHistory = await getMyLeaveRequestsUseCase();
            setHistory(Array.isArray(updatedHistory) ? updatedHistory : []);

        } catch (err) {
            console.error(err);
            // Hiển thị lỗi từ BE trả về để dễ debug
            const msg = err.response?.data?.message || err.message || 'Có lỗi xảy ra';
            toast.error(msg);
        } finally {
            setSubmitting(false);
        }
    };

    const renderStatus = (status) => {
        const statusMap = {
            'PENDING': { label: 'Chờ duyệt', class: 'bg-yellow-100 text-yellow-800' },
            'APPROVED': { label: 'Đã duyệt', class: 'bg-green-100 text-green-800' },
            'ACCEPTED': { label: 'Đã duyệt', class: 'bg-green-100 text-green-800' }, // Thêm trường hợp ACCEPTED
            'REJECTED': { label: 'Từ chối', class: 'bg-red-100 text-red-800' }
        };
        
        // Handle null status as Pending
        const config = (status === null) ? statusMap['PENDING'] : (statusMap[status] || { label: status, class: 'bg-gray-100 text-gray-800' });
        
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-bold ${config.class}`}>
                {config.label}
            </span>
        );
    };

    // [FIX] Helper hiển thị loại nghỉ đúng với Enum Backend
    const renderType = (type) => {
        const typeMap = {
            'ABSENCE': 'Nghỉ học',
            'LATE': 'Đi muộn'
        };
        return typeMap[type] || type;
    };

    const courseOptions = courses.map(c => ({
        value: c.id,
        label: `${c.subjectName} (${c.courseCode})`
    }));

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Xin nghỉ phép</h1>
                <p className="text-gray-500">Gửi đơn xin nghỉ học tới giảng viên</p>
            </div>

            {/* Form Section */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Tạo đơn mới</h3>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Select
                            name="courseId"
                            label="Chọn lớp học phần *"
                            value={formData.courseId}
                            onChange={handleChange}
                            options={courseOptions}
                            required
                            placeholder="-- Chọn lớp --"
                        />
                        <Input
                            type="date"
                            name="leaveDate"
                            label="Ngày nghỉ *"
                            value={formData.leaveDate}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    {/* [FIX] Sửa lại Options cho khớp với Enum Backend */}
                    <Select
                        name="type"
                        label="Loại nghỉ *"
                        value={formData.type}
                        onChange={handleChange}
                        options={[
                            { value: 'ABSENCE', label: 'Nghỉ học' },
                            { value: 'LATE', label: 'Đi muộn' }
                        ]}
                        required
                    />

                    <Input
                        name="reason"
                        label="Lý do cụ thể *"
                        value={formData.reason}
                        onChange={handleChange}
                        placeholder="Nhập chi tiết lý do (VD: Ốm, Xe hỏng...)"
                        required
                    />

                    <div className="pt-2">
                        <Button type="submit" loading={submitting} className="w-full md:w-auto">
                            Gửi đơn xin nghỉ
                        </Button>
                    </div>
                </form>
            </div>

            {/* History Section */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                    <h3 className="font-semibold text-gray-900">Lịch sử đơn từ</h3>
                    <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded border">
                        Tổng: {history.length}
                    </span>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-gray-500 uppercase font-medium">
                            <tr>
                                <th className="px-6 py-3 whitespace-nowrap">Ngày gửi</th>
                                <th className="px-6 py-3 whitespace-nowrap">Lớp học</th>
                                <th className="px-6 py-3 whitespace-nowrap">Ngày nghỉ</th>
                                <th className="px-6 py-3 whitespace-nowrap">Loại</th>
                                <th className="px-6 py-3 min-w-[200px]">Lý do</th>
                                <th className="px-6 py-3 text-center whitespace-nowrap">Trạng thái</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {history.length > 0 ? (
                                history.map((req, index) => (
                                    <tr key={req.id || index} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 text-gray-500">
                                            {formatDate(req.createdDate || new Date())}
                                        </td>
                                        <td className="px-6 py-4 font-medium text-gray-900">
                                            {req.courseName || 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 text-gray-900">
                                            {/* Backend trả về requestDate chứ không phải leaveDate */}
                                            {formatDate(req.requestDate)}
                                        </td>
                                        <td className="px-6 py-4 text-gray-600">
                                            {renderType(req.type)}
                                        </td>
                                        <td className="px-6 py-4 text-gray-600 truncate max-w-xs" title={req.reason}>
                                            {req.reason}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            {renderStatus(req.status)}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                                        <div className="flex flex-col items-center justify-center">
                                            <p>Chưa có đơn xin nghỉ nào.</p>
                                        </div>
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

export default LeaveRequestPage;