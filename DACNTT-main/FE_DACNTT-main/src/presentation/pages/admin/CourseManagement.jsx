import { useState, useEffect } from 'react';
import Table, { Pagination } from '../../components/common/Table';
import Modal, { ConfirmModal } from '../../components/common/Modal';
import { Alert } from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import { useAuth } from '../../context/AuthContext'; 
import {
    getCoursesUseCase,
    createCourseUseCase,
    deleteCourseUseCase,
    registerStudentUseCase,
    getSemestersUseCase,
    getSubjectsUseCase,
    exportExcelUseCase 
} from '../../../usecases/courses/courseUseCases';
import { getUsersUseCase } from '../../../usecases/users/userUseCases';

/**
 * CourseManagement Component
 * Full CRUD for courses + Register Student functionality
 */
const CourseManagement = () => {
    // 1. Lấy thông tin User để phân quyền
    const { user } = useAuth();
    const isSecretary = user?.role === 'ROLE_SECRETARY' || user?.role === 'SECRETARY';
    const isAdmin = user?.role === 'ROLE_ADMIN' || user?.role === 'ADMIN';

    // Course list state
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);

    // Form state
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [formData, setFormData] = useState({
        courseCode: '',
        subjectId: '',
        semesterId: '',
        lecturerId: '',
        dayOfWeek: '',
        startTime: '',
        endTime: '',
        room: '',
        maxStudents: 50,
    });
    
    // Select data state
    const [semesters, setSemesters] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [lecturers, setLecturers] = useState([]);
    const [submitting, setSubmitting] = useState(false);

    // Delete modal state
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [deleteError, setDeleteError] = useState('');

    // Register student modal state
    const [showRegisterModal, setShowRegisterModal] = useState(false);
    const [studentCode, setStudentCode] = useState('');
    const [registerLoading, setRegisterLoading] = useState(false);

    // Alerts
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Export loading state
    const [exportingId, setExportingId] = useState(null);

    const dayOptions = [
        { value: 'MONDAY', label: 'Thứ 2' },
        { value: 'TUESDAY', label: 'Thứ 3' },
        { value: 'WEDNESDAY', label: 'Thứ 4' },
        { value: 'THURSDAY', label: 'Thứ 5' },
        { value: 'FRIDAY', label: 'Thứ 6' },
        { value: 'SATURDAY', label: 'Thứ 7' },
    ];

    // Fetch courses
    const fetchCourses = async () => {
        setLoading(true);
        try {
            console.log('=== FETCH COURSES ===');
            const result = await getCoursesUseCase({ page, size: 10 });
            setCourses(result.courses || []);
            setTotalPages(result.totalPages || 1);
        } catch (err) {
            console.error('Fetch Courses Error:', err);
            setError('Không thể tải danh sách lớp học');
        } finally {
            setLoading(false);
        }
    };

    // Fetch form data (semesters, subjects, lecturers)
    const fetchFormData = async () => {
        try {
            const [semesterResult, subjectResult, lecturerResult] = await Promise.all([
                getSemestersUseCase(),
                getSubjectsUseCase(),
                // Gọi API lấy user với role LECTURER
                // Nhờ UseCase đã fix logic lọc, danh sách trả về sẽ chỉ toàn Giảng viên
                getUsersUseCase({ role: 'LECTURER', size: 100 }), 
            ]);
            setSemesters(semesterResult || []);
            setSubjects(subjectResult || []);
            setLecturers(lecturerResult.users || []);
        } catch (err) {
            console.error('Fetch Form Data Error:', err);
        }
    };

    useEffect(() => {
        fetchCourses();
        fetchFormData();
    }, [page]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'maxStudents' ? parseInt(value) || 0 : value
        }));
    };

    // Create Course
    const handleCreateCourse = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');

        try {
            // Tìm object Giảng viên từ ID đã chọn
            const selectedLecturer = lecturers.find(l => String(l.id) === String(formData.lecturerId));
            
            if (!selectedLecturer) {
                throw new Error("Vui lòng chọn giảng viên từ danh sách.");
            }

            // Lấy mã giảng viên
            const lecturerCode = selectedLecturer.lecturerCode || selectedLecturer.username;

            if (!lecturerCode) {
                throw new Error(`Giảng viên ${selectedLecturer.fullName} chưa có Mã giảng viên (lecturerCode). Vui lòng cập nhật thông tin người dùng này trước.`);
            }

            const dataToSend = {
                courseCode: formData.courseCode,
                subjectId: formData.subjectId,
                semesterId: formData.semesterId,
                lecturerId: formData.lecturerId,
                lecturerCodes: [lecturerCode], 
                dayOfWeek: formData.dayOfWeek,
                startTime: formData.startTime,
                endTime: formData.endTime,
                room: formData.room, 
                maxStudents: formData.maxStudents, 
            };

            console.log('=== SENDING PAYLOAD ===', dataToSend);

            await createCourseUseCase(dataToSend);
            
            setSuccess('Tạo lớp học phần thành công!');
            setShowCreateModal(false);
            
            // Reset form
            setFormData({
                courseCode: '', subjectId: '', semesterId: '', lecturerId: '',
                dayOfWeek: '', startTime: '', endTime: '', room: '', maxStudents: 50,
            });
            
            fetchCourses();

        } catch (err) {
            console.error('Create Course Error:', err);
            const serverMessage = err.response?.data?.message || err.message || 'Có lỗi xảy ra khi tạo lớp';
            setError(serverMessage); 
        } finally {
            setSubmitting(false);
        }
    };

    // Delete Course
    const handleDeleteCourse = async () => {
        setSubmitting(true);
        setDeleteError('');
        try {
            console.log('=== DELETE COURSE ===');
            console.log('Course ID:', selectedCourse?.id);

            await deleteCourseUseCase(selectedCourse.id);
            setSuccess('Xóa lớp học phần thành công');
            setShowDeleteModal(false);
            fetchCourses();
        } catch (err) {
            console.error('Delete Course Error:', err);
            setDeleteError(err.message || 'Có lỗi xảy ra khi xóa');
        } finally {
            setSubmitting(false);
        }
    };

    // Close modal and reset state
    const handleCloseModal = () => {
        setShowCreateModal(false);
        setFormData({
            courseCode: '', subjectId: '', semesterId: '', lecturerId: '',
            dayOfWeek: '', startTime: '', endTime: '', room: '', maxStudents: 50,
        });
        setError('');
    };

    // Register Student to Course
    const handleRegisterStudent = async (e) => {
        e.preventDefault();
        setRegisterLoading(true);
        setError('');

        try {
            const payload = {
                studentCode: studentCode,
                courseId: selectedCourse.id
            };

            console.log('=== REGISTER STUDENT ===');
            console.log('Payload:', payload);

            await registerStudentUseCase(payload);

            console.log('Register Student Success');

            setSuccess(`Đã thêm sinh viên ${studentCode} vào lớp ${selectedCourse.courseCode}`);
            setShowRegisterModal(false);
            setStudentCode('');
        } catch (err) {
            console.error('Register Student Error:', err);
            setError(err.message || 'Không thể thêm sinh viên vào lớp');
        } finally {
            setRegisterLoading(false);
        }
    };

    // Export Excel
    const handleExportExcel = async (course) => {
        setExportingId(course.id);
        try {
            await exportExcelUseCase(course.id, course.courseCode);
            setSuccess(`Đã tải báo cáo cho lớp ${course.courseCode}`);
        } catch (err) {
            setError(err.message || 'Lỗi khi xuất Excel');
        } finally {
            setExportingId(null);
        }
    };

    const columns = [
        { title: 'ID', dataIndex: 'id', key: 'id', width: '60px' },
        { title: 'Mã lớp', dataIndex: 'courseCode', key: 'courseCode' },
        { title: 'Môn học', dataIndex: 'subjectName', key: 'subjectName' },
        {
            title: 'Giảng viên',
            key: 'lecturer',
            render: (_, record) => record.lecturerName || '-'
        },
        {
            title: 'Lịch học',
            key: 'schedule',
            render: (_, record) => {
                const dayLabels = {
                    MONDAY: 'T2', TUESDAY: 'T3', WEDNESDAY: 'T4',
                    THURSDAY: 'T5', FRIDAY: 'T6', SATURDAY: 'T7'
                };
                return `${dayLabels[record.dayOfWeek] || record.dayOfWeek} ${record.startTime}-${record.endTime}`;
            }
        },
        {
            title: 'Thao tác',
            key: 'actions',
            width: '200px',
            render: (_, record) => (
                <div className="flex space-x-2">
                    {/* 1. Nút Xuất Excel */}
                    <button
                        onClick={() => handleExportExcel(record)}
                        disabled={exportingId === record.id}
                        className="text-green-600 hover:text-green-700 disabled:opacity-50"
                        title="Xuất báo cáo Excel"
                    >
                        {exportingId === record.id ? (
                            <div className="w-5 h-5 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        )}
                    </button>

                    {/* 2. Nút Thêm sinh viên */}
                    <button
                        onClick={() => {
                            setSelectedCourse(record);
                            setShowRegisterModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-700"
                        title="Thêm sinh viên"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                        </svg>
                    </button>
                    
                    {/* 3. Nút Sửa lớp - Disabled (Backend unimplemented) */}
                    <button
                        className="text-gray-400 cursor-not-allowed"
                        title="Tính năng đang bảo trì"
                        disabled={true}
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                    </button>

                    {/* 4. Nút Xóa lớp (CHỈ HIỂN THỊ VỚI ADMIN) */}
                    {isAdmin && (
                        <button
                            onClick={() => {
                                setSelectedCourse(record);
                                setShowDeleteModal(true);
                            }}
                            className="text-red-600 hover:text-red-700"
                            title="Xóa lớp"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        </button>
                    )}
                </div>
            ),
        },
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">Quản lý lớp học phần</h1>
                <Button onClick={() => setShowCreateModal(true)}>
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Thêm lớp học phần
                </Button>
            </div>

            {success && <Alert type="success" message={success} onClose={() => setSuccess('')} />}
            {error && <Alert type="error" message={error} onClose={() => setError('')} />}

            <Table columns={columns} data={courses} loading={loading} />

            <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={setPage}
            />

            {/* Create Course Modal */}
            <Modal
                isOpen={showCreateModal}
                onClose={handleCloseModal}
                title='Tạo lớp học phần mới'
                size="lg"
            >
                <form onSubmit={handleCreateCourse} className="space-y-4">
                    <Input
                        name="courseCode"
                        label="Mã lớp học phần"
                        value={formData.courseCode}
                        onChange={handleChange}
                        placeholder="VD: IT001.01"
                        required
                    />
                    <div className="grid grid-cols-2 gap-4">
                        <Select
                            name="subjectId"
                            label="Môn học"
                            value={formData.subjectId}
                            onChange={handleChange}
                            options={subjects.map(s => ({ value: s.id, label: `${s.subjectCode} - ${s.name}` }))}
                            required
                        />
                        <Select
                            name="semesterId"
                            label="Học kỳ"
                            value={formData.semesterId}
                            onChange={handleChange}
                            options={semesters.map(s => ({ value: s.id, label: s.name }))}
                            required
                        />
                    </div>
                    
                    {/* Danh sách giảng viên đã được lọc, chỉ hiện Giảng viên */}
                    <Select
                        name="lecturerId"
                        label="Giảng viên"
                        value={formData.lecturerId}
                        onChange={handleChange}
                        options={lecturers.map(l => ({ value: l.id, label: `${l.lecturerCode || l.username} - ${l.fullName}` }))}
                        required
                    />
                    
                    <div className="grid grid-cols-3 gap-4">
                        <Select
                            name="dayOfWeek"
                            label="Ngày học"
                            value={formData.dayOfWeek}
                            onChange={handleChange}
                            options={dayOptions}
                            required
                        />
                        <Input
                            name="startTime"
                            type="time"
                            label="Giờ bắt đầu"
                            value={formData.startTime}
                            onChange={handleChange}
                            required
                        />
                        <Input
                            name="endTime"
                            type="time"
                            label="Giờ kết thúc"
                            value={formData.endTime}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    
                    <div className="flex justify-end space-x-3 pt-4">
                        <Button variant="secondary" onClick={handleCloseModal}>
                            Hủy
                        </Button>
                        <Button type="submit" loading={submitting}>
                            Tạo lớp
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Register Student Modal */}
            <Modal
                isOpen={showRegisterModal}
                onClose={() => {
                    setShowRegisterModal(false);
                    setStudentCode('');
                }}
                title="Thêm sinh viên vào lớp"
            >
                <form onSubmit={handleRegisterStudent} className="space-y-4">
                    <p className="text-gray-600">
                        Lớp: <span className="font-semibold">{selectedCourse?.courseCode}</span> - {selectedCourse?.subjectName}
                    </p>
                    <Input
                        name="studentCode"
                        label="Mã sinh viên"
                        value={studentCode}
                        onChange={(e) => setStudentCode(e.target.value)}
                        placeholder="VD: SV001"
                        required
                    />
                    <div className="flex justify-end space-x-3 pt-4">
                        <Button variant="secondary" onClick={() => setShowRegisterModal(false)}>
                            Hủy
                        </Button>
                        <Button type="submit" loading={registerLoading}>
                            Thêm sinh viên
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Delete Confirmation */}
            <ConfirmModal
                isOpen={showDeleteModal}
                onClose={() => {
                    setShowDeleteModal(false);
                    setDeleteError('');
                }}
                onConfirm={handleDeleteCourse}
                title="Xóa lớp học phần"
                message={`Bạn có chắc chắn muốn xóa lớp "${selectedCourse?.courseCode}"?`}
                loading={submitting}
                error={deleteError}
            />
        </div>
    );
};

export default CourseManagement;