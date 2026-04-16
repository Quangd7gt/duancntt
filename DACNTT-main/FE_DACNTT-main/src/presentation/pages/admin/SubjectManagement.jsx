import { useState, useEffect } from 'react';
import Table, { Pagination } from '../../components/common/Table';
import Modal, { ConfirmModal } from '../../components/common/Modal';
import { Alert } from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import {
    getSubjectsUseCase,
    createSubjectUseCase,
    updateSubjectUseCase,
    deleteSubjectUseCase
} from '../../../usecases/courses/courseUseCases';

/**
 * SubjectManagement Component
 * Full CRUD for subjects (Môn học)
 */
const SubjectManagement = () => {
    // List state
    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(true);

    // Modal state
    const [showModal, setShowModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedSubject, setSelectedSubject] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        subjectCode: '',
        name: '',
        credits: 3
    });

    // Alerts
    const [error, setError] = useState('');
    const [modalError, setModalError] = useState('');
    const [deleteError, setDeleteError] = useState('');
    const [success, setSuccess] = useState('');

    // Fetch subjects
    const fetchSubjects = async () => {
        setLoading(true);
        try {
            console.log('=== FETCH SUBJECTS ===');
            const result = await getSubjectsUseCase();
            console.log('Subjects Response:', result);
            setSubjects(Array.isArray(result) ? result : []);
        } catch (err) {
            console.error('Fetch Subjects Error:', err);
            setError('Không thể tải danh sách môn học');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSubjects();
    }, []);

    // Open modal for create/edit
    const handleOpenModal = (subject = null) => {
        if (subject) {
            setSelectedSubject(subject);
            setFormData({
                subjectCode: subject.subjectCode || '',
                name: subject.name || '',
                credits: subject.credits || 3
            });
        } else {
            setSelectedSubject(null);
            setFormData({ subjectCode: '', name: '', credits: 3 });
        }
        setModalError('');
        setShowModal(true);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'credits' ? parseInt(value) || 0 : value
        }));
    };

    // Create or Update subject
    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setModalError('');

        try {
            if (selectedSubject) {
                console.log('=== UPDATE SUBJECT ===');
                console.log('ID:', selectedSubject.id, 'Payload:', formData);
                await updateSubjectUseCase(selectedSubject.id, formData);
                setSuccess('Cập nhật môn học thành công');
            } else {
                console.log('=== CREATE SUBJECT ===');
                console.log('Payload:', formData);
                await createSubjectUseCase(formData);
                setSuccess('Tạo môn học thành công');
            }
            setShowModal(false);
            fetchSubjects();
        } catch (err) {
            console.error('Submit Error:', err);
            setModalError(err.message || 'Có lỗi xảy ra');
        } finally {
            setSubmitting(false);
        }
    };

    // Delete subject
    const handleDelete = async () => {
        setSubmitting(true);
        setDeleteError('');
        try {
            console.log('=== DELETE SUBJECT ===');
            console.log('ID:', selectedSubject?.id);
            await deleteSubjectUseCase(selectedSubject.id);
            setSuccess('Xóa môn học thành công');
            setShowDeleteModal(false);
            fetchSubjects();
        } catch (err) {
            console.error('Delete Error:', err);
            setDeleteError(err.message || 'Có lỗi xảy ra khi xóa');
        } finally {
            setSubmitting(false);
        }
    };

    const columns = [
        { title: 'ID', dataIndex: 'id', key: 'id', width: '60px' },
        { title: 'Mã môn', dataIndex: 'subjectCode', key: 'subjectCode' },
        { title: 'Tên môn học', dataIndex: 'name', key: 'name' },
        { title: 'Số tín chỉ', dataIndex: 'credits', key: 'credits', width: '100px' },
        {
            title: 'Thao tác',
            key: 'actions',
            render: (_, record) => (
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
                            setSelectedSubject(record);
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
            ),
        },
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">Quản lý môn học</h1>
                <Button onClick={() => handleOpenModal()}>
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Thêm môn học
                </Button>
            </div>

            {success && <Alert type="success" message={success} onClose={() => setSuccess('')} />}
            {error && <Alert type="error" message={error} onClose={() => setError('')} />}

            <Table columns={columns} data={subjects} loading={loading} />

            {/* Create/Edit Modal */}
            <Modal
                isOpen={showModal}
                onClose={() => {
                    setShowModal(false);
                    setModalError('');
                }}
                title={selectedSubject ? 'Chỉnh sửa môn học' : 'Thêm môn học mới'}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    {modalError && (
                        <Alert type="error" message={modalError} onClose={() => setModalError('')} />
                    )}
                    <Input
                        name="subjectCode"
                        label="Mã môn học"
                        value={formData.subjectCode}
                        onChange={handleChange}
                        placeholder="VD: IT001"
                        required
                        disabled={!!selectedSubject}
                    />
                    <Input
                        name="name"
                        label="Tên môn học"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="VD: Nhập môn lập trình"
                        required
                    />
                    <Input
                        name="credits"
                        type="number"
                        label="Số tín chỉ"
                        value={formData.credits}
                        onChange={handleChange}
                        min={1}
                        max={10}
                        required
                    />
                    <div className="flex justify-end space-x-3 pt-4">
                        <Button variant="secondary" onClick={() => setShowModal(false)}>
                            Hủy
                        </Button>
                        <Button type="submit" loading={submitting}>
                            {selectedSubject ? 'Cập nhật' : 'Tạo mới'}
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
                title="Xóa môn học"
                message={`Bạn có chắc chắn muốn xóa môn học "${selectedSubject?.name}" (${selectedSubject?.subjectCode})?`}
                loading={submitting}
                error={deleteError}
            />
        </div>
    );
};

export default SubjectManagement;
