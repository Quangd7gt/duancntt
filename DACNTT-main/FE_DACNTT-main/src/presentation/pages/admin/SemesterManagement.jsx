import { useState, useEffect } from 'react';
import Table from '../../components/common/Table';
import Modal, { ConfirmModal } from '../../components/common/Modal';
import { Alert } from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import DateInput from '../../components/common/DateInput';
import {
    getSemestersUseCase,
    createSemesterUseCase,
    updateSemesterUseCase,
    deleteSemesterUseCase
} from '../../../usecases/courses/courseUseCases';
import { formatDate } from '../../../utils/dateUtils';

/**
 * SemesterManagement Component
 * Full CRUD for semesters (Học kỳ)
 */
const SemesterManagement = () => {
    // List state
    const [semesters, setSemesters] = useState([]);
    const [loading, setLoading] = useState(true);

    // Modal state
    const [showModal, setShowModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedSemester, setSelectedSemester] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        year: new Date().getFullYear(),
        startDate: '',
        endDate: ''
    });

    // Alerts
    const [error, setError] = useState('');
    const [modalError, setModalError] = useState('');
    const [deleteError, setDeleteError] = useState('');
    const [success, setSuccess] = useState('');

    // Fetch semesters
    const fetchSemesters = async () => {
        setLoading(true);
        try {
            console.log('=== FETCH SEMESTERS ===');
            const result = await getSemestersUseCase();
            console.log('Semesters Response:', result);
            setSemesters(Array.isArray(result) ? result : []);
        } catch (err) {
            console.error('Fetch Semesters Error:', err);
            setError('Không thể tải danh sách học kỳ');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSemesters();
    }, []);

    // Open modal for create/edit
    const handleOpenModal = (semester = null) => {
        if (semester) {
            setSelectedSemester(semester);
            setFormData({
                name: semester.name || '',
                year: semester.year || new Date().getFullYear(),
                startDate: semester.startDate || '',
                endDate: semester.endDate || ''
            });
        } else {
            setSelectedSemester(null);
            setFormData({
                name: '',
                year: new Date().getFullYear(),
                startDate: '',
                endDate: ''
            });
        }
        setModalError('');
        setShowModal(true);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => {
            const newData = { ...prev, [name]: value };
            // Auto-update year when startDate changes
            if (name === 'startDate' && value) {
                newData.year = new Date(value).getFullYear();
            }
            return newData;
        });
    };

    // Create or Update semester
    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setModalError('');

        try {
            const dataToSend = {
                name: formData.name,
                year: formData.year,
                startDate: formData.startDate,
                endDate: formData.endDate
            };

            if (selectedSemester) {
                console.log('=== UPDATE SEMESTER ===');
                console.log('ID:', selectedSemester.id, 'Payload:', dataToSend);
                await updateSemesterUseCase(selectedSemester.id, dataToSend);
                setSuccess('Cập nhật học kỳ thành công');
            } else {
                console.log('=== CREATE SEMESTER ===');
                console.log('Payload:', dataToSend);
                await createSemesterUseCase(dataToSend);
                setSuccess('Tạo học kỳ thành công');
            }
            setShowModal(false);
            fetchSemesters();
        } catch (err) {
            console.error('Submit Error:', err);
            setModalError(err.message || 'Có lỗi xảy ra');
        } finally {
            setSubmitting(false);
        }
    };

    // Delete semester
    const handleDelete = async () => {
        setSubmitting(true);
        setDeleteError('');
        try {
            console.log('=== DELETE SEMESTER ===');
            console.log('ID:', selectedSemester?.id);
            await deleteSemesterUseCase(selectedSemester.id);
            setSuccess('Xóa học kỳ thành công');
            setShowDeleteModal(false);
            fetchSemesters();
        } catch (err) {
            console.error('Delete Error:', err);
            setDeleteError(err.message || 'Có lỗi xảy ra khi xóa');
        } finally {
            setSubmitting(false);
        }
    };

    const columns = [
        { title: 'ID', dataIndex: 'id', key: 'id', width: '60px' },
        { title: 'Tên học kỳ', dataIndex: 'name', key: 'name' },
        { title: 'Năm học', dataIndex: 'year', key: 'year', width: '100px' },
        {
            title: 'Ngày bắt đầu',
            key: 'startDate',
            render: (_, record) => formatDate(record.startDate) || '-'
        },
        {
            title: 'Ngày kết thúc',
            key: 'endDate',
            render: (_, record) => formatDate(record.endDate) || '-'
        },
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
                            setSelectedSemester(record);
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
                <h1 className="text-2xl font-bold text-gray-900">Quản lý học kỳ</h1>
                <Button onClick={() => handleOpenModal()}>
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Thêm học kỳ
                </Button>
            </div>

            {success && <Alert type="success" message={success} onClose={() => setSuccess('')} />}
            {error && <Alert type="error" message={error} onClose={() => setError('')} />}

            <Table columns={columns} data={semesters} loading={loading} />

            {/* Create/Edit Modal */}
            <Modal
                isOpen={showModal}
                onClose={() => {
                    setShowModal(false);
                    setModalError('');
                }}
                title={selectedSemester ? 'Chỉnh sửa học kỳ' : 'Thêm học kỳ mới'}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    {modalError && (
                        <Alert type="error" message={modalError} onClose={() => setModalError('')} />
                    )}
                    <Input
                        name="name"
                        label="Tên học kỳ"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="VD: Học kỳ 1 - 2024"
                        required
                    />
                    <div className="grid grid-cols-2 gap-4">
                        <DateInput
                            name="startDate"
                            label="Ngày bắt đầu"
                            value={formData.startDate}
                            onChange={handleChange}
                            required
                        />
                        <DateInput
                            name="endDate"
                            label="Ngày kết thúc"
                            value={formData.endDate}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <Input
                        name="year"
                        type="number"
                        label="Năm học"
                        value={formData.year}
                        onChange={handleChange}
                        min={2020}
                        max={2050}
                        required
                    />
                    <p className="text-xs text-gray-500">
                        * Năm học sẽ tự động cập nhật theo ngày bắt đầu
                    </p>
                    <div className="flex justify-end space-x-3 pt-4">
                        <Button variant="secondary" onClick={() => setShowModal(false)}>
                            Hủy
                        </Button>
                        <Button type="submit" loading={submitting}>
                            {selectedSemester ? 'Cập nhật' : 'Tạo mới'}
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
                title="Xóa học kỳ"
                message={`Bạn có chắc chắn muốn xóa học kỳ "${selectedSemester?.name}"?`}
                loading={submitting}
                error={deleteError}
            />
        </div>
    );
};

export default SemesterManagement;
