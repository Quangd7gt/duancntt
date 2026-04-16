import { useState, useEffect } from 'react';
import Table, { Pagination } from '../../components/common/Table';
import Button from '../../components/common/Button';
import Modal, { ConfirmModal } from '../../components/common/Modal';
import Input, { Select } from '../../components/common/Input';
import { Alert } from '../../components/common/Card';
import { useAuth } from '../../context/AuthContext'; // [NEW] Import Auth Context
import {
    getUsersUseCase,
    createUserUseCase,
    updateUserUseCase,
    deleteUserUseCase,
    resetPasswordUseCase
} from '../../../usecases/users/userUseCases';

/**
 * UserManagement Component
 * Admin/Secretary page for managing users (CRUD)
 */
const UserManagement = () => {
    // [NEW] Lấy thông tin user hiện tại để check quyền
    const { user: currentUser } = useAuth();
    const isSecretary = currentUser?.role === 'ROLE_SECRETARY' || currentUser?.role === 'SECRETARY';

    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [showModal, setShowModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    
    // Default role khi mở form tạo mới
    // Nếu là Secretary thì mặc định chọn STUDENT để tránh lỗi
    const defaultRole = isSecretary ? 'STUDENT' : 'STUDENT'; 

    const [formData, setFormData] = useState({
        username: '',
        password: '',
        email: '',
        fullName: '',
        firstName: '',
        lastName: '',
        role: defaultRole,
        lecturerCode: '',
        studentCode: '',
        department: '',
    });
    
    const [error, setError] = useState('');
    const [modalError, setModalError] = useState('');
    const [deleteError, setDeleteError] = useState('');
    const [success, setSuccess] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [showResetModal, setShowResetModal] = useState(false);
    const [resetLoading, setResetLoading] = useState(false);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const result = await getUsersUseCase({ page, size: 10 });
            setUsers(result.users);
            setTotalPages(result.totalPages);
        } catch (err) {
            setError('Không thể tải danh sách người dùng');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, [page]);

    const handleOpenModal = (user = null) => {
        if (user) {
            setSelectedUser(user);

            // Split fullName into firstName and lastName
            let firstName = user.firstName || '';
            let lastName = user.lastName || '';

            if (!firstName && !lastName && user.fullName) {
                const nameParts = user.fullName.trim().split(' ');
                if (nameParts.length >= 2) {
                    firstName = nameParts[0];
                    lastName = nameParts.slice(1).join(' ');
                } else if (nameParts.length === 1) {
                    firstName = nameParts[0];
                    lastName = '';
                }
            }

            setFormData({
                username: user.username,
                password: '',
                email: user.email,
                fullName: user.fullName,
                firstName: firstName,
                lastName: lastName,
                role: user.role,
                lecturerCode: user.lecturerCode || '',
                studentCode: user.studentCode || '',
            });
        } else {
            setSelectedUser(null);
            setFormData({
                username: '',
                password: '',
                email: '',
                fullName: '',
                firstName: '',
                lastName: '',
                role: isSecretary ? 'STUDENT' : 'STUDENT', // Reset về role an toàn
                lecturerCode: '',
                studentCode: '',
            });
        }
        setModalError('');
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setModalError('');

        try {
            // Validate quyền của Secretary (đề phòng hack client-side)
            if (isSecretary && (formData.role === 'ADMIN' || formData.role === 'SECRETARY')) {
                throw new Error('Bạn không có quyền tạo tài khoản Admin hoặc Thư ký.');
            }

            const fullName = `${formData.firstName} ${formData.lastName}`.trim();

            const dataToSend = {
                username: formData.username,
                email: formData.email,
                fullName: fullName,
                firstName: formData.firstName,
                lastName: formData.lastName,
                role: formData.role,
            };

            if (formData.password) {
                dataToSend.password = formData.password;
            }

            if (formData.role === 'LECTURER' && formData.lecturerCode) {
                dataToSend.lecturerCode = formData.lecturerCode;
            }
            if (formData.role === 'STUDENT' && formData.studentCode) {
                dataToSend.studentCode = formData.studentCode;
            }

            if (selectedUser) {
                await updateUserUseCase(selectedUser.id, dataToSend);
                setSuccess('Cập nhật người dùng thành công');
            } else {
                await createUserUseCase(dataToSend);
                setSuccess('Tạo người dùng thành công');
            }
            setShowModal(false);
            setModalError('');
            fetchUsers();
        } catch (err) {
            setModalError(err.message || 'Có lỗi xảy ra');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async () => {
        // [Safety Check] Secretary không được xóa Admin
        if (isSecretary && (selectedUser?.role === 'ADMIN' || selectedUser?.role === 'SECRETARY')) {
            setDeleteError('Bạn không có quyền xóa tài khoản quản trị.');
            return;
        }

        setSubmitting(true);
        setDeleteError('');
        try {
            await deleteUserUseCase(selectedUser.id);
            setSuccess('Xóa người dùng thành công');
            setShowDeleteModal(false);
            setDeleteError('');
            fetchUsers();
        } catch (err) {
            setDeleteError(err.message || 'Có lỗi xảy ra khi xóa');
        } finally {
            setSubmitting(false);
        }
    };

    const handleResetPassword = async () => {
        setResetLoading(true);
        try {
            await resetPasswordUseCase(selectedUser.username);
            setSuccess(`Đã reset mật khẩu cho ${selectedUser.username}. Mật khẩu mới là: 123456`);
            setShowResetModal(false);
        } catch (err) {
            console.error('Reset Password Error:', err);
            setError(err.message || 'Không thể reset mật khẩu');
        } finally {
            setResetLoading(false);
        }
    };

    const columns = [
        { title: 'ID', dataIndex: 'id', key: 'id', width: '60px' },
        { title: 'Username', dataIndex: 'username', key: 'username' },
        {
            title: 'Họ tên',
            key: 'fullName',
            render: (_, record) => record.fullName || `${record.firstName || ''} ${record.lastName || ''}`.trim() || '-'
        },
        { title: 'Email', dataIndex: 'email', key: 'email' },
        {
            title: 'Vai trò',
            dataIndex: 'role',
            key: 'role',
            render: (role) => {
                const colors = {
                    ADMIN: 'bg-purple-100 text-purple-800',
                    SECRETARY: 'bg-orange-100 text-orange-800',
                    LECTURER: 'bg-blue-100 text-blue-800',
                    STUDENT: 'bg-green-100 text-green-800',
                };
                const labels = {
                    ADMIN: 'Admin',
                    SECRETARY: 'Thư ký',
                    LECTURER: 'Giảng viên',
                    STUDENT: 'Sinh viên',
                };
                return (
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[role] || 'bg-gray-100'}`}>
                        {labels[role] || role}
                    </span>
                );
            },
        },
        {
            title: 'Thao tác',
            key: 'actions',
            render: (_, record) => {
                // [NEW] Logic ẩn nút thao tác nếu không đủ quyền
                // Secretary không được sửa/xóa Admin hoặc Secretary khác
                const isRestricted = isSecretary && (record.role === 'ADMIN' || record.role === 'SECRETARY');

                if (isRestricted) {
                    return <span className="text-xs text-gray-400 italic">Không có quyền</span>;
                }

                return (
                    <div className="flex space-x-2">
                        <button
                            onClick={() => handleOpenModal(record)}
                            className="text-indigo-600 hover:text-indigo-700"
                            title="Sửa"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                        </button>
                        <button
                            onClick={() => {
                                setSelectedUser(record);
                                setShowResetModal(true);
                            }}
                            className="text-amber-600 hover:text-amber-700"
                            title="Reset mật khẩu"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                            </svg>
                        </button>
                        <button
                            onClick={() => {
                                setSelectedUser(record);
                                setShowDeleteModal(true);
                            }}
                            className="text-red-600 hover:text-red-700"
                            title="Xóa"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        </button>
                    </div>
                );
            },
        },
    ];

    // [NEW] Tạo danh sách Role Options dựa trên quyền hạn
    const roleOptions = isSecretary 
        ? [
            { value: 'LECTURER', label: 'Giảng viên' },
            { value: 'STUDENT', label: 'Sinh viên' },
        ]
        : [
            { value: 'ADMIN', label: 'Quản trị viên' },
            { value: 'SECRETARY', label: 'Thư ký' },
            { value: 'LECTURER', label: 'Giảng viên' },
            { value: 'STUDENT', label: 'Sinh viên' },
        ];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">Quản lý người dùng</h1>
                <Button onClick={() => handleOpenModal()}>
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Thêm người dùng
                </Button>
            </div>

            {success && <Alert type="success" message={success} onClose={() => setSuccess('')} />}
            {error && <Alert type="error" message={error} onClose={() => setError('')} />}

            <Table columns={columns} data={users} loading={loading} />

            <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={setPage}
            />

            {/* Create/Edit Modal */}
            <Modal
                isOpen={showModal}
                onClose={() => {
                    setShowModal(false);
                    setModalError('');
                }}
                title={selectedUser ? 'Chỉnh sửa người dùng' : 'Thêm người dùng mới'}
                size="lg"
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    {modalError && (
                        <Alert
                            type="error"
                            message={modalError}
                            onClose={() => setModalError('')}
                        />
                    )}
                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            name="username"
                            label="Tên đăng nhập"
                            value={formData.username}
                            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                            required
                            disabled={!!selectedUser}
                        />
                        <Input
                            name="password"
                            type="password"
                            label={selectedUser ? 'Mật khẩu mới (để trống nếu không đổi)' : 'Mật khẩu'}
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            required={!selectedUser}
                        />
                    </div>
                    
                    {/* Select Role - Options thay đổi theo quyền */}
                    <Select
                        name="role"
                        label="Vai trò"
                        value={formData.role}
                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                        options={roleOptions}
                        required
                        // Nếu đang sửa user, và user đó có role cao hơn mình (trường hợp hiếm), disable luôn select
                        disabled={isSecretary && (selectedUser?.role === 'ADMIN' || selectedUser?.role === 'SECRETARY')}
                    />

                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            name="firstName"
                            label="Họ"
                            value={formData.firstName}
                            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                            required
                        />
                        <Input
                            name="lastName"
                            label="Tên"
                            value={formData.lastName}
                            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                            required
                        />
                    </div>
                    <Input
                        name="email"
                        type="email"
                        label="Email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                    />
                    {formData.role === 'LECTURER' && (
                        <div className="grid grid-cols-2 gap-4">
                            <Input
                                name="lecturerCode"
                                label="Mã giảng viên"
                                value={formData.lecturerCode}
                                onChange={(e) => setFormData({ ...formData, lecturerCode: e.target.value })}
                                required
                            />
                            <Input
                                name="department"
                                label="Khoa/Bộ môn"
                                value={formData.department}
                                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                            />
                        </div>
                    )}
                    {formData.role === 'STUDENT' && (
                        <Input
                            name="studentCode"
                            label="Mã sinh viên"
                            value={formData.studentCode}
                            onChange={(e) => setFormData({ ...formData, studentCode: e.target.value })}
                            required
                        />
                    )}
                    <div className="flex justify-end space-x-3 pt-4">
                        <Button variant="secondary" onClick={() => setShowModal(false)}>
                            Hủy
                        </Button>
                        <Button type="submit" loading={submitting}>
                            {selectedUser ? 'Cập nhật' : 'Tạo mới'}
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
                onConfirm={handleDelete}
                title="Xóa người dùng"
                message={`Bạn có chắc chắn muốn xóa người dùng "${selectedUser?.fullName}"?`}
                loading={submitting}
                error={deleteError}
            />

            {/* Reset Password Confirmation */}
            <ConfirmModal
                isOpen={showResetModal}
                onClose={() => setShowResetModal(false)}
                onConfirm={handleResetPassword}
                title="Reset mật khẩu"
                message={`Bạn có chắc chắn muốn reset mật khẩu cho "${selectedUser?.username}"? Mật khẩu mới sẽ là: 123456`}
                loading={resetLoading}
                confirmText="Reset"
                confirmVariant="warning"
            />
        </div>
    );
};

export default UserManagement;