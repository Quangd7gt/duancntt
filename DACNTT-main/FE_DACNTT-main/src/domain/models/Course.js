/**
 * Course Model
 * Represents a course/class in the system
 */
export class Course {
    constructor({
        id = null,
        courseCode = '',
        name = '',
        subjectId = null,
        subjectName = '',
        subjectCode = '',
        semesterId = null,
        semesterName = '',
        lecturerId = null,
        lecturerName = '',
        dayOfWeek = '',
        startTime = '',
        endTime = '',
        room = '',
        credits = 0,
        maxStudents = 0,
        currentStudents = 0,
        createdAt = null,
    } = {}) {
        this.id = id;
        this.courseCode = courseCode;
        this.name = name;
        this.subjectId = subjectId;
        this.subjectName = subjectName;
        this.subjectCode = subjectCode;
        this.semesterId = semesterId;
        this.semesterName = semesterName;
        this.lecturerId = lecturerId;
        this.lecturerName = lecturerName;
        this.dayOfWeek = dayOfWeek;
        this.startTime = startTime;
        this.endTime = endTime;
        this.room = room;
        this.credits = credits;
        this.maxStudents = maxStudents;
        this.currentStudents = currentStudents;
        this.createdAt = createdAt;
    }

    /**
     * Get schedule display text
     * @returns {string}
     */
    getScheduleText() {
        const dayNames = {
            'MONDAY': 'Thứ 2',
            'TUESDAY': 'Thứ 3',
            'WEDNESDAY': 'Thứ 4',
            'THURSDAY': 'Thứ 5',
            'FRIDAY': 'Thứ 6',
            'SATURDAY': 'Thứ 7',
            'SUNDAY': 'Chủ nhật',
        };
        const day = dayNames[this.dayOfWeek] || this.dayOfWeek;
        return `${day} (${this.startTime} - ${this.endTime})`;
    }

    /**
     * Check if course is full
     * @returns {boolean}
     */
    isFull() {
        return this.currentStudents >= this.maxStudents;
    }

    /**
     * Get available slots
     * @returns {number}
     */
    getAvailableSlots() {
        return Math.max(0, this.maxStudents - this.currentStudents);
    }

    /**
     * Create Course from API response
     * @param {Object} data - API response data
     * @returns {Course}
     */
    static fromApi(data) {
        // Handle lecturers list from Backend (Set<SimpleLecturerResponse>)
        // Use the first lecturer in the list, or fallback to single 'lecturer' object if available
        const firstLecturer = (data.lecturers && Array.isArray(data.lecturers) && data.lecturers.length > 0)
            ? data.lecturers[0]
            : null;

        const singleLecturer = data.lecturer; 
        const finalLecturer = firstLecturer || singleLecturer;

        // Count students
        const currentStudents = data.currentStudents 
            || (data.students ? data.students.length : 0)
            || 0;

        const maxStudents = data.maxStudents
            || data.capacity
            || data.maxEnrollment
            || 0;

        return new Course({
            id: data.id,
            courseCode: data.courseCode,
            name: data.name,
            
            // Subject
            subjectId: data.subject?.id || data.subjectId,
            subjectName: data.subject?.name || data.subjectName || '',
            subjectCode: data.subject?.subjectCode || data.subjectCode || '',
            
            // Semester
            semesterId: data.semester?.id || data.semesterId,
            semesterName: data.semester?.name || data.semesterName || '',
            
            // Lecturer Info
            lecturerId: finalLecturer?.id || data.lecturerId,
            lecturerName: finalLecturer 
                ? `${finalLecturer.firstName || ''} ${finalLecturer.lastName || ''}`.trim() 
                : (data.lecturerName || ''),
            
            // Schedule fields
            dayOfWeek: data.dayOfWeek,
            startTime: data.startTime,
            endTime: data.endTime,
            
            // Room (Backend chưa có thì để trống, tránh lỗi)
            room: data.room || '', 
            
            credits: data.credits || data.subject?.credits || 0,
            maxStudents: maxStudents,
            currentStudents: currentStudents,
            createdAt: data.createdAt,
        });
    }

    /**
     * Convert to JSON for API request
     * @returns {Object}
     */
    toJson() {
        return {
            id: this.id,
            courseCode: this.courseCode,
            name: this.name,
            subjectId: this.subjectId,
            semesterId: this.semesterId,
            lecturerId: this.lecturerId,
            dayOfWeek: this.dayOfWeek,
            startTime: this.startTime,
            endTime: this.endTime,
            room: this.room,
            maxStudents: this.maxStudents,
        };
    }
}

/**
 * Semester Model
 */
export class Semester {
    constructor({
        id = null,
        name = '',
        year = null,
        startDate = '',
        endDate = '',
    } = {}) {
        this.id = id;
        this.name = name;
        this.year = year;
        this.startDate = startDate;
        this.endDate = endDate;
    }

    static fromApi(data) {
        return new Semester({
            id: data.id,
            name: data.name,
            year: data.year,
            startDate: data.startDate,
            endDate: data.endDate,
        });
    }

    toJson() {
        return {
            name: this.name,
            year: this.year,
            startDate: this.startDate,
            endDate: this.endDate,
        };
    }
}

/**
 * Subject Model
 */
export class Subject {
    constructor({
        id = null,
        subjectCode = '',
        name = '',
        credits = 0,
    } = {}) {
        this.id = id;
        this.subjectCode = subjectCode;
        this.name = name;
        this.credits = credits;
    }

    static fromApi(data) {
        return new Subject({
            id: data.id,
            subjectCode: data.subjectCode,
            name: data.name,
            credits: data.credits,
        });
    }

    toJson() {
        return {
            subjectCode: this.subjectCode,
            name: this.name,
            credits: this.credits,
        };
    }
}

// Day of week constants
export const DAYS_OF_WEEK = {
    MONDAY: 'MONDAY',
    TUESDAY: 'TUESDAY',
    WEDNESDAY: 'WEDNESDAY',
    THURSDAY: 'THURSDAY',
    FRIDAY: 'FRIDAY',
    SATURDAY: 'SATURDAY',
    SUNDAY: 'SUNDAY',
};

export default Course;