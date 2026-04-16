import {
    getCourseRepository,
    getSemesterRepository,
    getSubjectRepository
} from '../../domain/repositories/RepositoryFactory';
import { Course, Semester, Subject } from '../../domain/models/Course';

const courseRepository = getCourseRepository();
const semesterRepository = getSemesterRepository();
const subjectRepository = getSubjectRepository();

// =====================================
// COURSE USE CASES
// =====================================

export const createCourseUseCase = async (courseData) => {
    const requiredFields = ['subjectId', 'semesterId', 'lecturerId', 'dayOfWeek', 'startTime', 'endTime'];
    for (const field of requiredFields) {
        if (!courseData[field]) {
            throw new Error(`${field} không được để trống`);
        }
    }
    const response = await courseRepository.createCourse(courseData);
    return Course.fromApi(response);
};

export const getCoursesUseCase = async (params = {}) => {
    const response = await courseRepository.getCourses(params);
    const content = response.content || response.data || response;
    const courses = Array.isArray(content)
        ? content.map(c => Course.fromApi(c))
        : [];

    return {
        courses,
        total: response.totalElements || courses.length,
        page: response.number || 0,
        totalPages: response.totalPages || 1,
    };
};

export const getCourseByIdUseCase = async (courseId) => {
    const response = await courseRepository.getCourseById(courseId);
    return Course.fromApi(response);
};

export const updateCourseUseCase = async (courseId, courseData) => {
    const response = await courseRepository.updateCourse(courseId, courseData);
    return Course.fromApi(response);
};

export const deleteCourseUseCase = async (courseId) => {
    await courseRepository.deleteCourse(courseId);
};

export const registerStudentToCourseUseCase = async (courseId, studentId) => {
    if (!courseId || !studentId) {
        throw new Error('Course ID và Student ID không được để trống');
    }
    const response = await courseRepository.registerStudent({ courseId, studentId });
    return response;
};

export const registerStudentUseCase = async (data) => {
    const { studentCode, courseId } = data;
    if (!studentCode || !courseId) {
        throw new Error('Mã sinh viên và ID lớp học không được để trống');
    }
    const response = await courseRepository.registerStudent({ studentCode, courseId });
    return response;
};

export const getCourseStudentsUseCase = async (courseId) => {
    const response = await courseRepository.getCourseStudents(courseId);
    return Array.isArray(response) ? response : [];
};

export const getCoursesByLecturerUseCase = async (lecturerId) => {
    const response = await courseRepository.getCoursesByLecturer(lecturerId);
    const courses = Array.isArray(response) ? response : (response.content || []);
    return courses.map(c => Course.fromApi(c));
};

export const getMyCoursesUseCase = async () => {
    const response = await courseRepository.getMyCourses();
    const courses = Array.isArray(response) ? response : (response.content || []);
    return courses.map(c => Course.fromApi(c));
};

export const getCoursesByStudentUseCase = async (studentId) => {
    const response = await courseRepository.getCoursesByStudent(studentId);
    const courses = Array.isArray(response) ? response : (response.content || []);
    return courses.map(c => Course.fromApi(c));
};

// [ĐÃ SỬA: QUAN TRỌNG] Logic map dữ liệu thống kê chính xác
export const getCourseStatisticsUseCase = async (courseId) => {
    const response = await courseRepository.getCourseStatistics(courseId);
    const data = response || {};
    
    // Ưu tiên 'studentStats' (Backend mới), fallback 'studentDetails'
    const rawDetails = Array.isArray(data.studentStats) 
        ? data.studentStats 
        : (Array.isArray(data.studentDetails) ? data.studentDetails : []);

    const mappedDetails = rawDetails.map(s => {
        const absentPercent = s.absentPercentage || 0;
        
        // Logic cấm thi: Ưu tiên Backend (banned), nếu không có thì tự tính
        const isBannedCalc = (s.banned === true) || (s.isBanned === true) || (absentPercent >= 20);

        return {
            studentId: s.studentId || s.id,
            studentCode: s.studentCode || '',
            // Map fullName -> studentName
            studentName: s.fullName || s.studentName || 'Sinh viên',
            totalSessions: s.totalSessions || 0,
            // Map absentCount -> absentSessions
            absentSessions: (s.absentCount !== undefined) ? s.absentCount : (s.absentSessions || 0),
            absentPercentage: absentPercent,
            isBanned: isBannedCalc
        };
    });

    return {
        totalBanned: (typeof data.totalBanned === 'number') 
            ? data.totalBanned 
            : mappedDetails.filter(s => s.isBanned).length,
        studentStats: mappedDetails, 
        studentDetails: mappedDetails 
    };
};

export const sendBanNotificationsUseCase = async (courseId) => {
    const response = await courseRepository.sendBanNotifications(courseId);
    return response;
};

// [ĐÃ SỬA: QUAN TRỌNG] Logic Export Excel với Blob
export const exportExcelUseCase = async (courseId, courseName = 'attendance_report') => {
    const response = await courseRepository.exportExcel(courseId);

    // Xử lý khi response trả về từ Axios Interceptor (có thể là .data hoặc nguyên cục response)
    const blobData = response.data ? response.data : response;

    // Kiểm tra an toàn
    if (blobData.type === 'application/json') {
        throw new Error("Lỗi: Server trả về JSON thay vì file Excel.");
    }

    const url = window.URL.createObjectURL(new Blob([blobData]));
    const link = document.createElement('a');
    link.href = url;
    
    const safeName = courseName.replace(/\s+/g, '_');
    link.setAttribute('download', `${safeName}_Report.xlsx`);
    
    document.body.appendChild(link);
    link.click();
    
    link.parentNode.removeChild(link);
    window.URL.revokeObjectURL(url);
};

// =====================================
// SEMESTER & SUBJECT USE CASES (Giữ nguyên)
// =====================================

export const createSemesterUseCase = async (semesterData) => {
    const requiredFields = ['name', 'startDate', 'endDate'];
    for (const field of requiredFields) {
        if (!semesterData[field]) throw new Error(`${field} không được để trống`);
    }
    const response = await semesterRepository.createSemester(semesterData);
    return Semester.fromApi(response);
};

export const getSemestersUseCase = async (params = {}) => {
    const response = await semesterRepository.getSemesters(params);
    const content = response.content || response.data || response;
    return Array.isArray(content) ? content.map(s => Semester.fromApi(s)) : [];
};

export const updateSemesterUseCase = async (semesterId, semesterData) => {
    const response = await semesterRepository.updateSemester(semesterId, semesterData);
    return Semester.fromApi(response);
};

export const deleteSemesterUseCase = async (semesterId) => {
    await semesterRepository.deleteSemester(semesterId);
};

export const createSubjectUseCase = async (subjectData) => {
    const requiredFields = ['subjectCode', 'name', 'credits'];
    for (const field of requiredFields) {
        if (!subjectData[field]) throw new Error(`${field} không được để trống`);
    }
    const response = await subjectRepository.createSubject(subjectData);
    return Subject.fromApi(response);
};

export const getSubjectsUseCase = async (params = {}) => {
    const response = await subjectRepository.getSubjects(params);
    const content = response.content || response.data || response;
    return Array.isArray(content) ? content.map(s => Subject.fromApi(s)) : [];
};

export const updateSubjectUseCase = async (subjectId, subjectData) => {
    const response = await subjectRepository.updateSubject(subjectId, subjectData);
    return Subject.fromApi(response);
};

export const deleteSubjectUseCase = async (subjectId) => {
    await subjectRepository.deleteSubject(subjectId);
};

const courseUseCases = {
    createCourse: createCourseUseCase,
    getCourses: getCoursesUseCase,
    getCourseById: getCourseByIdUseCase,
    updateCourse: updateCourseUseCase,
    deleteCourse: deleteCourseUseCase,
    registerStudentToCourse: registerStudentToCourseUseCase,
    registerStudent: registerStudentUseCase,
    getCourseStudents: getCourseStudentsUseCase,
    getCoursesByLecturer: getCoursesByLecturerUseCase,
    getCourseStatistics: getCourseStatisticsUseCase,
    sendBanNotifications: sendBanNotificationsUseCase,
    exportExcel: exportExcelUseCase,
    getMyCourses: getMyCoursesUseCase,
    getCoursesByStudent: getCoursesByStudentUseCase,
    createSemester: createSemesterUseCase,
    getSemesters: getSemestersUseCase,
    updateSemester: updateSemesterUseCase,
    deleteSemester: deleteSemesterUseCase,
    createSubject: createSubjectUseCase,
    getSubjects: getSubjectsUseCase,
    updateSubject: updateSubjectUseCase,
    deleteSubject: deleteSubjectUseCase,
};

export default courseUseCases;