import axiosClient from '../../infrastructure/api/axiosClient';
import { API_ENDPOINTS } from '../../infrastructure/api/endpoints';

// 1. Tạo đơn xin nghỉ (Sinh viên)
export const createLeaveRequestUseCase = async (data) => {
    return await axiosClient.post(API_ENDPOINTS.LEAVE_REQUESTS.CREATE, data);
};

// 2. Lấy lịch sử đơn của bản thân (Sinh viên)
export const getMyLeaveRequestsUseCase = async () => {
    const response = await axiosClient.get(API_ENDPOINTS.LEAVE_REQUESTS.GET_MY_HISTORY);
    return Array.isArray(response) ? response : (response.data || []);
};

// 3. Lấy danh sách đơn theo lớp (Giảng viên)
export const getLeaveRequestsByCourseUseCase = async (courseId) => {
    if (!courseId) return [];
    const response = await axiosClient.get(API_ENDPOINTS.LEAVE_REQUESTS.GET_BY_COURSE(courseId));
    return Array.isArray(response) ? response : (response.data || []);
};

// 4. Cập nhật trạng thái đơn (Giảng viên duyệt)
export const updateLeaveRequestStatusUseCase = async (requestId, status) => {
    // [FIX LỖI MẤT DỮ LIỆU KHI F5]
    // 1. Bỏ "?status=..." trên URL đi.
    // 2. Truyền object { status: status } vào tham số thứ 2 (Body).
    
    return await axiosClient.patch(
        API_ENDPOINTS.LEAVE_REQUESTS.UPDATE_STATUS(requestId), 
        { status: status } // Dữ liệu nằm ở đây mới đúng!
    );
};