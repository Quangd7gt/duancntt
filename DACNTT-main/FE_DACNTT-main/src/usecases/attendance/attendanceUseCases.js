import { getAttendanceRepository } from '../../domain/repositories/RepositoryFactory';
import { AttendanceSession, AttendanceRecord } from '../../domain/models/Attendance';

const attendanceRepository = getAttendanceRepository();

/**
 * Start Attendance Session Use Case
 * Lecturer opens attendance for a course
 */
export const startSessionUseCase = async (courseId) => {
    if (!courseId) {
        throw new Error('Course ID không được để trống');
    }

    const response = await attendanceRepository.startSession({ courseId });
    return AttendanceSession.fromApi(response);
};

/**
 * [FIX LỖI 4] Close Attendance Session Use Case
 */
export const closeSessionUseCase = async (courseId) => {
    if (!courseId) {
        throw new Error('Course ID không được để trống');
    }

    // Backend API: POST /api/v1/attendance/close-session
    const response = await attendanceRepository.closeSession({ courseId });
    return response;
};

/**
 * Check In Use Case
 * Student scans QR code to check in
 * [FIX QUAN TRỌNG] Bắt lỗi và xử lý message trả về từ backend
 */
export const checkInUseCase = async (checkInData) => {
    const { qrCodeData, courseId } = checkInData;

    if (!qrCodeData) {
        throw new Error('Mã QR không hợp lệ');
    }

    if (!courseId) {
        throw new Error('Vui lòng chọn lớp học');
    }

    console.log('=== CHECK-IN PAYLOAD ===');
    console.log('Payload:', JSON.stringify({ qrCodeData, courseId }, null, 2));

    try {
        const response = await attendanceRepository.checkIn({
            qrCodeData,
            courseId,
            latitude: null,
            longitude: null
        });
        return response;
    } catch (error) {
        // [FIX] Xử lý lỗi để trả về message thân thiện cho UI
        console.error("CheckIn UseCase Error:", error);
        
        // Nếu backend trả về lỗi "Sinh viên đã điểm danh rồi" (thường là 400 Bad Request)
        // Axios client thường đã bóc tách error.response.data.message vào error.message
        // Ta ném tiếp lỗi này ra để UI bắt được.
        throw error;
    }
};

/**
 * Get Sessions By Course Use Case
 */
export const getSessionsByCourseUseCase = async (courseId) => {
    if (!courseId) {
        throw new Error('Course ID không được để trống');
    }

    const response = await attendanceRepository.getSessionsByCourse(courseId);
    const sessions = Array.isArray(response) ? response : (response.content || []);
    return sessions.map(s => AttendanceSession.fromApi(s));
};

/**
 * Get Session Records Use Case
 */
export const getSessionRecordsUseCase = async (sessionId) => {
    if (!sessionId) {
        throw new Error('Session ID không được để trống');
    }

    const response = await attendanceRepository.getSessionRecords(sessionId);
    const records = Array.isArray(response) ? response : (response.content || []);
    return records.map(r => AttendanceRecord.fromApi(r));
};

/**
 * Get Student History Use Case
 */
export const getStudentHistoryUseCase = async (courseId) => {
    if (!courseId) {
        throw new Error('Course ID không được để trống');
    }

    const response = await attendanceRepository.getStudentHistory(courseId);
    return Array.isArray(response) ? response : (response.content || []);
};

/**
 * Update Attendance Record Use Case
 */
export const updateRecordUseCase = async (recordId, status) => {
    if (!recordId) {
        throw new Error('Record ID không được để trống');
    }

    const validStatuses = ['PRESENT', 'ABSENT', 'EXCUSED', 'LATE'];
    if (!validStatuses.includes(status)) {
        throw new Error('Trạng thái không hợp lệ');
    }

    const response = await attendanceRepository.updateRecord(recordId, { status });
    return response;
};

// Export all attendance use cases
const attendanceUseCases = {
    startSession: startSessionUseCase,
    closeSession: closeSessionUseCase,
    checkIn: checkInUseCase,
    getSessionsByCourse: getSessionsByCourseUseCase,
    getSessionRecords: getSessionRecordsUseCase,
    getStudentHistory: getStudentHistoryUseCase,
    updateRecord: updateRecordUseCase,
};

export default attendanceUseCases;