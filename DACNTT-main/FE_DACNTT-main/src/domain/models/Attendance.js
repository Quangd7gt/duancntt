import { formatDate, formatTime } from '../../utils/dateUtils';

/**
 * Attendance Session Model
 * Represents an attendance session for a course
 */
export class AttendanceSession {
    constructor({
        id = null,
        courseId = null,
        courseName = '',
        status = 'CLOSED',
        qrCodeData = '',
        startTime = null,
        endTime = null,
        date = null,
        totalStudents = 0,
        presentCount = 0,
        absentCount = 0,
        lateCount = 0,
        excusedCount = 0,
    } = {}) {
        this.id = id;
        this.courseId = courseId;
        this.courseName = courseName;
        this.status = status;
        this.qrCodeData = qrCodeData;
        this.startTime = startTime;
        this.endTime = endTime;
        this.date = date;
        this.totalStudents = totalStudents;
        this.presentCount = presentCount;
        this.absentCount = absentCount;
        this.lateCount = lateCount;
        this.excusedCount = excusedCount;
    }

    /**
     * Check if session is open
     * @returns {boolean}
     */
    isOpen() {
        return this.status === 'OPEN';
    }

    /**
     * Check if session is closed
     * @returns {boolean}
     */
    isClosed() {
        return this.status === 'CLOSED';
    }

    /**
     * Get session date formatted
     * @returns {string}
     */
    getFormattedDate() {
        return formatDate(this.date);
    }

    /**
     * Get session time range
     * @returns {string}
     */
    getTimeRange() {
        if (!this.startTime) return '';
        const start = formatTime(this.startTime);
        const end = this.endTime ? formatTime(this.endTime) : 'Đang mở';
        return `${start} - ${end}`;
    }

    /**
     * Get attendance rate
     * @returns {number}
     */
    getAttendanceRate() {
        if (this.totalStudents === 0) return 0;
        return Math.round(((this.presentCount + this.lateCount) / this.totalStudents) * 100);
    }

    /**
     * Create from API response
     * @param {Object} data
     * @returns {AttendanceSession}
     */
    static fromApi(data) {
        return new AttendanceSession({
            id: data.id || data.sessionId,
            courseId: data.courseId,
            courseName: data.courseName,
            status: data.status,
            qrCodeData: data.qrCodeData,
            startTime: data.startTime,
            endTime: data.endTime,
            date: data.date || data.startTime,
            totalStudents: data.totalStudents,
            presentCount: data.presentCount,
            absentCount: data.absentCount,
            lateCount: data.lateCount,
            excusedCount: data.excusedCount,
        });
    }
}

/**
 * Attendance Record Model
 * Represents a single attendance record for a student
 */
export class AttendanceRecord {
    constructor({
        id = null,
        sessionId = null,
        studentId = null,
        studentCode = '',
        studentName = '',
        checkInTime = null,
        status = 'ABSENT',
        note = '',
    } = {}) {
        this.id = id;
        this.sessionId = sessionId;
        this.studentId = studentId;
        this.studentCode = studentCode;
        this.studentName = studentName;
        this.checkInTime = checkInTime;
        this.status = status;
        this.note = note;
    }

    /**
     * Check if student is present
     * @returns {boolean}
     */
    isPresent() {
        return this.status === 'PRESENT';
    }

    /**
     * Check if student is absent
     * @returns {boolean}
     */
    isAbsent() {
        return this.status === 'ABSENT';
    }

    /**
     * Check if student is late
     * @returns {boolean}
     */
    isLate() {
        return this.status === 'LATE';
    }

    /**
     * Check if student has excused absence
     * @returns {boolean}
     */
    isExcused() {
        return this.status === 'EXCUSED';
    }

    /**
     * Get status display text (Vietnamese)
     * @returns {string}
     */
    getStatusText() {
        const statusTexts = {
            'PRESENT': 'Có mặt',
            'ABSENT': 'Vắng mặt',
            'LATE': 'Đi trễ',
            'EXCUSED': 'Có phép',
        };
        return statusTexts[this.status] || this.status;
    }

    /**
     * Get status color class
     * @returns {string}
     */
    getStatusColor() {
        const colors = {
            'PRESENT': 'text-green-600 bg-green-100',
            'ABSENT': 'text-red-600 bg-red-100',
            'LATE': 'text-yellow-600 bg-yellow-100',
            'EXCUSED': 'text-blue-600 bg-blue-100',
        };
        return colors[this.status] || 'text-gray-600 bg-gray-100';
    }

    /**
     * Get formatted check-in time
     * @returns {string}
     */
    getFormattedCheckInTime() {
        return formatTime(this.checkInTime);
    }

    /**
     * Create from API response
     * @param {Object} data
     * @returns {AttendanceRecord}
     */
    static fromApi(data) {
        return new AttendanceRecord({
            id: data.id,
            sessionId: data.sessionId,
            studentId: data.studentId,
            studentCode: data.studentCode,
            studentName: data.studentName,
            checkInTime: data.checkInTime,
            status: data.status || data.attendanceStatus,
            note: data.note,
        });
    }
}

/**
 * Student Statistics Model
 * Represents attendance statistics for a student in a course
 */
export class StudentStatistics {
    constructor({
        studentId = null,
        studentCode = '',
        studentName = '',
        totalSessions = 0,
        presentSessions = 0,
        absentSessions = 0,
        lateSessions = 0,
        excusedSessions = 0,
        isBanned = false,
    } = {}) {
        this.studentId = studentId;
        this.studentCode = studentCode;
        this.studentName = studentName;
        this.totalSessions = totalSessions;
        this.presentSessions = presentSessions;
        this.absentSessions = absentSessions;
        this.lateSessions = lateSessions;
        this.excusedSessions = excusedSessions;
        this.isBanned = isBanned;
    }

    /**
     * Get attendance rate
     * @returns {number}
     */
    getAttendanceRate() {
        if (this.totalSessions === 0) return 0;
        return Math.round(((this.presentSessions + this.lateSessions) / this.totalSessions) * 100);
    }

    /**
     * Get absence rate
     * @returns {number}
     */
    getAbsenceRate() {
        if (this.totalSessions === 0) return 0;
        return Math.round((this.absentSessions / this.totalSessions) * 100);
    }

    /**
     * Create from API response
     * @param {Object} data
     * @returns {StudentStatistics}
     */
    static fromApi(data) {
        return new StudentStatistics({
            studentId: data.studentId,
            studentCode: data.studentCode,
            studentName: data.studentName,
            totalSessions: data.totalSessions,
            presentSessions: data.presentSessions,
            absentSessions: data.absentSessions,
            lateSessions: data.lateSessions,
            excusedSessions: data.excusedSessions,
            isBanned: data.isBanned,
        });
    }
}

// Attendance status constants
export const ATTENDANCE_STATUS = {
    PRESENT: 'PRESENT',
    ABSENT: 'ABSENT',
    LATE: 'LATE',
    EXCUSED: 'EXCUSED',
};

// Session status constants
export const SESSION_STATUS = {
    OPEN: 'OPEN',
    CLOSED: 'CLOSED',
};

export default AttendanceSession;
