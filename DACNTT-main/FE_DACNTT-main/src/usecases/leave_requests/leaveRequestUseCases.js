import { getLeaveRequestRepository } from '../../domain/repositories/RepositoryFactory';

const leaveRequestRepository = getLeaveRequestRepository();

/**
 * Create Leave Request Use Case
 * @param {Object} data - { courseId, reason, requestDate, type }
 * @returns {Promise<Object>}
 */
export const createLeaveRequestUseCase = async (data) => {
    const { courseId, reason, requestDate, type } = data;
    
    if (!courseId) throw new Error('Vui lòng chọn lớp học phần');
    if (!reason) throw new Error('Vui lòng nhập lý do');
    if (!requestDate) throw new Error('Vui lòng chọn ngày nghỉ');
    if (!type) throw new Error('Vui lòng chọn loại nghỉ phép');

    const response = await leaveRequestRepository.createRequest({
        courseId,
        reason,
        requestDate,
        type
    });
    return response;
};

/**
 * Get My Leave Requests Use Case
 * [DISABLED] Returns empty array
 */
export const getMyLeaveRequestsUseCase = async () => {
    // BE chưa hỗ trợ, trả về mảng rỗng để tránh lỗi UI
    return [];
};

/**
 * Get Requests By Course Use Case
 * @param {number|string} courseId
 * @returns {Promise<Array>}
 */
export const getLeaveRequestsByCourseUseCase = async (courseId) => {
    if (!courseId) throw new Error('Course ID is required');
    const response = await leaveRequestRepository.getRequestsByCourse(courseId);
    return Array.isArray(response) ? response : [];
};

/**
 * Update Leave Request Status Use Case
 * @param {number|string} requestId
 * @param {string} status
 * @returns {Promise<Object>}
 */
export const updateLeaveRequestStatusUseCase = async (requestId, status) => {
    if (!requestId) throw new Error('Request ID is required');
    if (!['APPROVED', 'REJECTED'].includes(status)) throw new Error('Invalid status');
    
    const response = await leaveRequestRepository.updateStatus(requestId, status);
    return response;
};

const leaveRequestUseCases = {
    createRequest: createLeaveRequestUseCase,
    getMyRequests: getMyLeaveRequestsUseCase,
    getRequestsByCourse: getLeaveRequestsByCourseUseCase,
    updateStatus: updateLeaveRequestStatusUseCase,
};

export default leaveRequestUseCases;