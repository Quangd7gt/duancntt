import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import Select from '../../components/common/Select';
import Button from '../../components/common/Button';
import { getCoursesByLecturerUseCase } from '../../../usecases/courses/courseUseCases';
import { getLeaveRequestsByCourseUseCase, updateLeaveRequestStatusUseCase } from '../../../usecases/attendance/leaveRequestUseCases';
import { formatDate } from '../../../utils/dateUtils';

const LecturerLeaveRequests = () => {
    const { user } = useAuth();
    const [courses, setCourses] = useState([]);
    const [selectedCourseId, setSelectedCourseId] = useState('');
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(false);

    // 1. Load danh sách lớp của giảng viên
    useEffect(() => {
        const fetchCourses = async () => {
            if (user?.id) {
                try {
                    const res = await getCoursesByLecturerUseCase(user.id);
                    setCourses(Array.isArray(res) ? res : []);
                } catch (error) {
                    console.error("Lỗi tải lớp:", error);
                }
            }
        };
        fetchCourses();
    }, [user]);

    // 2. Load đơn khi chọn lớp
    useEffect(() => {
        const fetchRequests = async () => {
            if (!selectedCourseId) {
                setRequests([]);
                return;
            }
            setLoading(true);
            try {
                const res = await getLeaveRequestsByCourseUseCase(selectedCourseId);
                setRequests(res);
            } catch (err) {
                console.error(err);
                toast.error('Không thể tải danh sách đơn');
            } finally {
                setLoading(false);
            }
        };
        fetchRequests();
    }, [selectedCourseId]);

    // 3. Xử lý Duyệt / Từ chối
    const handleAction = async (requestId, status) => {
        try {
            console.log(`Đang cập nhật đơn ${requestId} sang trạng thái: ${status}`);
            await updateLeaveRequestStatusUseCase(requestId, status);
            toast.success(`Đã ${status === 'APPROVED' ? 'duyệt' : 'từ chối'} đơn thành công`);
            
            // Cập nhật lại danh sách trên giao diện ngay lập tức
            setRequests(prevRequests => prevRequests.map(r => 
                r.id === requestId ? { ...r, status: status } : r
            ));
        } catch (error) {
            console.error("Lỗi cập nhật:", error);
            const msg = error.response?.data?.message || 'Có lỗi xảy ra khi cập nhật trạng thái';
            toast.error(msg);
        }
    };

    // Helper hiển thị loại nghỉ
    const renderType = (type) => {
        const types = {
            'ABSENCE': 'Nghỉ học',
            'LATE': 'Đi muộn'
        };
        return types[type] || type || 'Nghỉ học';
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">Quản lý Đơn nghỉ phép</h1>
            </div>

            {/* Filter */}
            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm w-full md:w-1/2">
                <Select
                    label="Chọn lớp học phần để xem đơn"
                    value={selectedCourseId}
                    onChange={(e) => setSelectedCourseId(e.target.value)}
                    options={[{ value: '', label: '-- Chọn lớp --' }, ...courses.map(c => ({ value: c.id, label: `${c.subjectName} - ${c.courseCode}` }))]}
                />
            </div>

            {/* Danh sách đơn */}
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex justify-between">
                    <h3 className="font-semibold text-gray-900">Danh sách yêu cầu ({requests.length})</h3>
                </div>
                
                {loading ? (
                    <div className="p-8 text-center text-gray-500">Đang tải dữ liệu...</div>
                ) : !selectedCourseId ? (
                    <div className="p-8 text-center text-gray-500">Vui lòng chọn một lớp học để xem danh sách.</div>
                ) : requests.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">Không có đơn xin nghỉ nào trong lớp này.</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 text-gray-500 uppercase font-medium">
                                <tr>
                                    <th className="px-6 py-3">Sinh viên</th>
                                    <th className="px-6 py-3">Ngày xin nghỉ</th>
                                    <th className="px-6 py-3">Loại</th>
                                    <th className="px-6 py-3">Lý do</th>
                                    <th className="px-6 py-3 text-center">Trạng thái</th>
                                    <th className="px-6 py-3 text-right">Hành động</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {requests.map((req) => {
                                    // [FIX] Kiểm tra trạng thái pending (bao gồm cả null)
                                    const isPending = req.status === 'PENDING' || req.status === null;
                                    
                                    return (
                                        <tr key={req.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4">
                                                <p className="font-medium text-gray-900">{req.studentName}</p>
                                                <p className="text-xs text-gray-500">{req.studentCode}</p>
                                            </td>
                                            <td className="px-6 py-4">
                                                {/* [FIX] Đổi leaveDate -> requestDate */}
                                                {formatDate(req.requestDate)}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded text-xs font-medium ${req.type === 'LATE' ? 'bg-orange-100 text-orange-800' : 'bg-blue-100 text-blue-800'}`}>
                                                    {renderType(req.type)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 max-w-xs truncate" title={req.reason}>{req.reason}</td>
                                            <td className="px-6 py-4 text-center">
                                                {isPending && <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs font-bold">Chờ duyệt</span>}
                                                {req.status === 'APPROVED' && <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-bold">Đã duyệt</span>}
                                                {req.status === 'REJECTED' && <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs font-bold">Từ chối</span>}
                                            </td>
                                            <td className="px-6 py-4 text-right space-x-2">
                                                {isPending ? (
                                                    <>
                                                        <Button size="sm" variant="success" onClick={() => handleAction(req.id, 'APPROVED')}>Duyệt</Button>
                                                        <Button size="sm" variant="danger" onClick={() => handleAction(req.id, 'REJECTED')}>Từ chối</Button>
                                                    </>
                                                ) : (
                                                    <span className="text-gray-400 text-xs italic">Đã xử lý</span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LecturerLeaveRequests;