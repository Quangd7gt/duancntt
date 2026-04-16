/**
 * Repository Factory
 * Central export point for all repository implementations
 * * This follows the Repository pattern from Clean Architecture.
 * The domain layer defines what methods are needed (contracts),
 * and the infrastructure layer provides the implementations.
 */

import authRepositoryImpl from '../../infrastructure/repositories/authRepositoryImpl';
import userRepositoryImpl from '../../infrastructure/repositories/userRepositoryImpl';
import courseRepositoryImpl, {
    semesterRepositoryImpl,
    subjectRepositoryImpl
} from '../../infrastructure/repositories/courseRepositoryImpl';
import attendanceRepositoryImpl from '../../infrastructure/repositories/attendanceRepositoryImpl';
import leaveRequestRepositoryImpl from '../../infrastructure/repositories/leaveRequestRepositoryImpl'; // [NEW]

/**
 * Get authentication repository
 * @returns {Object} Auth repository implementation
 */
export const getAuthRepository = () => authRepositoryImpl;

/**
 * Get user repository
 * @returns {Object} User repository implementation
 */
export const getUserRepository = () => userRepositoryImpl;

/**
 * Get course repository
 * @returns {Object} Course repository implementation
 */
export const getCourseRepository = () => courseRepositoryImpl;

/**
 * Get semester repository
 * @returns {Object} Semester repository implementation
 */
export const getSemesterRepository = () => semesterRepositoryImpl;

/**
 * Get subject repository
 * @returns {Object} Subject repository implementation
 */
export const getSubjectRepository = () => subjectRepositoryImpl;

/**
 * Get attendance repository
 * @returns {Object} Attendance repository implementation
 */
export const getAttendanceRepository = () => attendanceRepositoryImpl;

/**
 * Get leave request repository
 * @returns {Object} Leave request repository implementation
 */
export const getLeaveRequestRepository = () => leaveRequestRepositoryImpl; // [NEW]

// Default export with all repositories
const RepositoryFactory = {
    getAuthRepository,
    getUserRepository,
    getCourseRepository,
    getSemesterRepository,
    getSubjectRepository,
    getAttendanceRepository,
    getLeaveRequestRepository, // [NEW]
};

export default RepositoryFactory;