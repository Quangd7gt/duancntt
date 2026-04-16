import axiosClient from '../api/axiosClient';
import { API_ENDPOINTS } from '../api/endpoints';

/**
 * Course Repository Implementation
 * Handles all course-related API calls
 */
const courseRepositoryImpl = {
    // 1. Create
    async createCourse(courseData) {
        const response = await axiosClient.post(API_ENDPOINTS.COURSES.CREATE, courseData);
        return response;
    },

    // 2. Read List
    async getCourses(params = {}) {
        const response = await axiosClient.get(API_ENDPOINTS.COURSES.LIST, { params });
        return response;
    },

    // 3. Read One
    async getCourseById(courseId) {
        const response = await axiosClient.get(API_ENDPOINTS.COURSES.GET_BY_ID(courseId));
        return response;
    },

    // 4. Update
    async updateCourse(courseId, courseData) {
        // [NOTE] Backend hiện chưa hỗ trợ PUT, nếu gọi sẽ lỗi 405 Method Not Allowed
        const response = await axiosClient.put(API_ENDPOINTS.COURSES.UPDATE(courseId), courseData);
        return response;
    },

    // 5. Delete
    async deleteCourse(courseId) {
        const response = await axiosClient.delete(API_ENDPOINTS.COURSES.DELETE(courseId));
        return response;
    },

    // 6. Register Student
    async registerStudent(data) {
        const response = await axiosClient.post(API_ENDPOINTS.COURSES.REGISTER_STUDENT, data);
        return response;
    },

    // 7. Get Students in Course
    async getCourseStudents(courseId) {
        const response = await axiosClient.get(API_ENDPOINTS.COURSES.GET_STUDENTS(courseId));
        return response;
    },

    // 8. Get Courses by Lecturer
    async getCoursesByLecturer(lecturerId) {
        const response = await axiosClient.get(API_ENDPOINTS.COURSES.BY_LECTURER(lecturerId));
        return response;
    },

    // 9. Get My Courses (Logged in user)
    async getMyCourses() {
        const response = await axiosClient.get(API_ENDPOINTS.COURSES.MY_COURSES);
        return response;
    },

    // 10. Get Stats
    async getCourseStatistics(courseId) {
        const response = await axiosClient.get(API_ENDPOINTS.COURSES.STATISTICS(courseId));
        return response;
    },

    // 11. Send Ban Notifications
    async sendBanNotifications(courseId) {
        const response = await axiosClient.post(API_ENDPOINTS.COURSES.SEND_BAN_NOTIFICATIONS(courseId));
        return response; 
    },

    // 12. Export Excel [ĐÃ SỬA: QUAN TRỌNG NHẤT]
    async exportExcel(courseId) {
        // Thêm responseType: 'blob' để Axios không làm hỏng file binary
        return await axiosClient.get(API_ENDPOINTS.COURSES.EXPORT_EXCEL(courseId), {
            responseType: 'blob' 
        });
    },
};

// --- Semester Repository (Giữ nguyên logic) ---
export const semesterRepositoryImpl = {
    async createSemester(semesterData) {
        return await axiosClient.post(API_ENDPOINTS.SEMESTERS.CREATE, semesterData);
    },
    async getSemesters(params = {}) {
        return await axiosClient.get(API_ENDPOINTS.SEMESTERS.LIST, { params });
    },
    async getSemesterById(semesterId) {
        return await axiosClient.get(API_ENDPOINTS.SEMESTERS.GET_BY_ID(semesterId));
    },
    async updateSemester(semesterId, semesterData) {
        return await axiosClient.put(API_ENDPOINTS.SEMESTERS.UPDATE(semesterId), semesterData);
    },
    async deleteSemester(semesterId) {
        return await axiosClient.delete(API_ENDPOINTS.SEMESTERS.DELETE(semesterId));
    },
};

// --- Subject Repository (Giữ nguyên logic) ---
export const subjectRepositoryImpl = {
    async createSubject(subjectData) {
        return await axiosClient.post(API_ENDPOINTS.SUBJECTS.CREATE, subjectData);
    },
    async getSubjects(params = {}) {
        return await axiosClient.get(API_ENDPOINTS.SUBJECTS.LIST, { params });
    },
    async getSubjectById(subjectId) {
        return await axiosClient.get(API_ENDPOINTS.SUBJECTS.GET_BY_ID(subjectId));
    },
    async updateSubject(subjectId, subjectData) {
        return await axiosClient.put(API_ENDPOINTS.SUBJECTS.UPDATE(subjectId), subjectData);
    },
    async deleteSubject(subjectId) {
        return await axiosClient.delete(API_ENDPOINTS.SUBJECTS.DELETE(subjectId));
    },
};

export default courseRepositoryImpl;