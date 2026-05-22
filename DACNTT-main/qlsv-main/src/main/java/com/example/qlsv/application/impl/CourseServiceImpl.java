package com.example.qlsv.application.impl;

import com.example.qlsv.application.dto.mapper.CourseMapper;
import com.example.qlsv.application.dto.mapper.UserMapper;
import com.example.qlsv.application.dto.request.CreateCourseRequest;
import com.example.qlsv.application.dto.response.CourseDashboardResponse;
import com.example.qlsv.application.dto.response.CourseResponse;
import com.example.qlsv.application.dto.response.SimpleStudentResponse;
import com.example.qlsv.application.dto.response.StudentAttendanceStat;
import com.example.qlsv.application.service.CourseService;
import com.example.qlsv.domain.exception.BusinessException;
import com.example.qlsv.domain.exception.ResourceNotFoundException;
import com.example.qlsv.domain.model.*;
import com.example.qlsv.domain.model.enums.AttendanceStatus;
import com.example.qlsv.domain.model.enums.Role;
import com.example.qlsv.domain.model.enums.SessionStatus;
import com.example.qlsv.domain.repository.*;
import com.example.qlsv.infrastructure.service.EmailService;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CourseServiceImpl implements CourseService {

    private final CourseRepository courseRepository;
    private final SubjectRepository subjectRepository;
    private final SemesterRepository semesterRepository;
    private final UserRepository userRepository;
    private final AttendanceRecordRepository recordRepository;
    private final AttendanceSessionRepository sessionRepository;
    private final EmailService emailService;
    private final CourseMapper courseMapper;
    private final UserMapper userMapper;

    @Override
    @Transactional
    public CourseResponse createCourse(CreateCourseRequest request) {
        if (courseRepository.existsByCourseCode(request.getCourseCode())) {
            throw new BusinessException("Mã lớp học phần đã tồn tại: " + request.getCourseCode());
        }

        Subject subject = subjectRepository.findById(request.getSubjectId())
                .orElseThrow(() -> new ResourceNotFoundException("Subject", "id", request.getSubjectId()));

        Semester semester = semesterRepository.findById(request.getSemesterId())
                .orElseThrow(() -> new ResourceNotFoundException("Semester", "id", request.getSemesterId()));

        // --- XỬ LÝ NHIỀU GIẢNG VIÊN (MANY-TO-MANY) ---

        // Parse ngày giờ trước để dùng check trùng lịch
        DayOfWeek dow;
        try {
            dow = DayOfWeek.valueOf(request.getDayOfWeek().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new BusinessException("Ngày trong tuần không hợp lệ");
        }
        LocalTime start = LocalTime.parse(request.getStartTime());
        LocalTime end = LocalTime.parse(request.getEndTime());

        Set<User> lecturers = new HashSet<>();

        // Duyệt qua từng mã giảng viên trong request
        if (request.getLecturerCodes() == null || request.getLecturerCodes().isEmpty()) {
            throw new BusinessException("Lớp học phần phải có ít nhất một giảng viên");
        }

        for (String code : request.getLecturerCodes()) {
            // Tìm giảng viên
            User lecturer = userRepository.findByLecturerCode(code)
                    .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy giảng viên có mã: " + code));

            // Validate Role
            if (lecturer.getRole() != Role.ROLE_LECTURER) {
                throw new BusinessException("Mã " + code + " không phải là tài khoản giảng viên");
            }

            // Check trùng lịch cho TỪNG giảng viên
            List<Course> conflicting = courseRepository.findConflictingCoursesForLecturer(
                    lecturer.getId(),
                    semester.getId(),
                    dow,
                    start,
                    end
            );

            if (!conflicting.isEmpty()) {
                throw new BusinessException("Giảng viên " + lecturer.getFirstName() +
                        " (" + code + ") bị trùng lịch dạy với lớp: " +
                        conflicting.get(0).getCourseCode());
            }

            lecturers.add(lecturer);
        }

        Course course = Course.builder()
                .courseCode(request.getCourseCode())
                .subject(subject)
                .semester(semester)
                .lecturers(lecturers)
                .dayOfWeek(dow)
                .startTime(start)
                .endTime(end)
                .build();

        return courseMapper.toResponse(courseRepository.save(course));
    }

    @Override
    @Transactional
    public void registerStudentToCourse(String studentCode, Long courseId) {
        User student = userRepository.findByStudentCode(studentCode)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy sinh viên có mã: " + studentCode));

        if (student.getRole() != Role.ROLE_STUDENT) {
            throw new BusinessException("Mã này không thuộc về sinh viên");
        }

        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course", "id", courseId));

        List<Course> conflicting = courseRepository.findConflictingCoursesForStudent(
                student.getId(),
                course.getSemester().getId(),
                course.getDayOfWeek(),
                course.getStartTime(),
                course.getEndTime()
        );
        if (!conflicting.isEmpty()) {
            throw new BusinessException("Sinh viên bị trùng lịch học với lớp: " + conflicting.get(0).getCourseCode());
        }

        course.getStudents().add(student);
        courseRepository.save(course);
    }

    @Override
    public List<CourseResponse> getCoursesByLecturer(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        return courseRepository.findByLecturers_Id(user.getId()).stream()
                .map(courseMapper::toResponse)
                .collect(Collectors.toList());
    }
    @Override
    public List<SimpleStudentResponse> getStudentsByCourse(Long courseId) {
        if (!courseRepository.existsById(courseId)) {
            throw new ResourceNotFoundException("Course", "id", courseId);
        }
        List<User> students = courseRepository.findStudentsByCourseId(courseId);
        return students.stream()
                .map(userMapper::userToSimpleStudentResponse)
                .collect(Collectors.toList());
    }

    // Sửa kiểu trả về từ List<...> thành CourseDashboardResponse
    @Override
    public CourseDashboardResponse getCourseStatistics(Long courseId) {
        // 1. Lấy thông tin môn học
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course", "id", courseId));

        // 2. Đếm phiên điểm danh thực tế (JPQL rõ ràng + fallback theo bản ghi)
        long totalSessions = sessionRepository.countByCourseIdAndStatus(courseId, SessionStatus.CLOSED);
        if (totalSessions == 0) {
            totalSessions = sessionRepository.countAllByCourseId(courseId);
        }
        long sessionsWithRecords = recordRepository.countDistinctSessionsByCourseId(courseId);
        if (totalSessions < sessionsWithRecords) {
            totalSessions = sessionsWithRecords;
        }

        // 3. Lấy danh sách sinh viên trong lớp
        List<User> students = courseRepository.findStudentsByCourseId(courseId);

        // 4. Lấy dữ liệu có mặt / vắng từ DB
        List<Object[]> presentCounts = recordRepository.countPresentSessionsByCourse(courseId);
        java.util.Map<String, Long> attendanceMap = presentCounts.stream()
                .collect(Collectors.toMap(
                        row -> (String) row[0],
                        row -> (Long) row[1]
                ));

        List<Object[]> absentCounts = recordRepository.countAbsentSessionsByCourse(courseId);
        java.util.Map<String, Long> absentMap = absentCounts.stream()
                .collect(Collectors.toMap(
                        row -> (String) row[0],
                        row -> (Long) row[1]
                ));

        final long totalSessionsFinal = totalSessions;

        // 5. Tính toán danh sách chi tiết
        List<StudentAttendanceStat> stats = students.stream().map(student -> {
            String code = student.getStudentCode();
            long attended = attendanceMap.getOrDefault(code, 0L);
            long absent = 0;
            double percent = 0;
            boolean isBanned = false;
            if (totalSessionsFinal > 0) {
                long absentFromRecords = absentMap.getOrDefault(code, 0L);
                absent = Math.max(absentFromRecords, totalSessionsFinal - attended);
                percent = ((double) absent / totalSessionsFinal) * 100;
                isBanned = percent > 20;
            }

            return StudentAttendanceStat.builder()
                    .studentCode(student.getStudentCode())
                    .studentName(student.getLastName() + " " + student.getFirstName())
                    .totalSessions(totalSessionsFinal)
                    .attendedSessions(attended)
                    .absentSessions(absent)
                    .absentPercentage(Math.round(percent * 10.0) / 10.0)
                    .isBanned(isBanned)
                    .build();
        }).collect(Collectors.toList());

        int bannedCount = (int) stats.stream()
                .filter(StudentAttendanceStat::isBanned)
                .count();

        return CourseDashboardResponse.builder()
                .totalBanned(bannedCount)
                .totalSessions(totalSessionsFinal)
                .totalStudents(students.size())
                .studentDetails(stats)
                .build();
    }

    @Override
    public void sendBanNotifications(Long courseId) {
        // 1. Lấy dữ liệu tổng hợp (Wrapper Object)
        CourseDashboardResponse dashboardData = getCourseStatistics(courseId);

        // 2. Trích xuất danh sách sinh viên từ Object đó ra
        List<StudentAttendanceStat> stats = dashboardData.getStudentDetails();

        Course course = courseRepository.findById(courseId).orElseThrow();

        for (StudentAttendanceStat stat : stats) {
            if (stat.isBanned()) {
                User student = userRepository.findByStudentCode(stat.getStudentCode()).orElse(null);
                if (student != null) {
                    emailService.sendBanWarning(
                            student.getEmail(),
                            stat.getStudentName(),
                            course.getCourseCode(),
                            stat.getAbsentPercentage()
                    );
                }
            }
        }
    }

    @Override
    public ByteArrayInputStream exportCourseStatsToExcel(Long courseId) {
        // 1. Lấy dữ liệu tổng hợp
        CourseDashboardResponse dashboardData = getCourseStatistics(courseId);

        // 2. Trích xuất danh sách sinh viên để duyệt và ghi vào Excel
        List<StudentAttendanceStat> stats = dashboardData.getStudentDetails();

        String[] columns = {"Mã SV", "Họ Tên", "Tổng buổi", "Đã học", "Vắng", "% Vắng", "Cấm thi"};

        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Thống Kê");
            Row headerRow = sheet.createRow(0);
            for (int i = 0; i < columns.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(columns[i]);
                CellStyle style = workbook.createCellStyle();
                Font font = workbook.createFont();
                font.setBold(true);
                style.setFont(font);
                cell.setCellStyle(style);
            }

            int rowIdx = 1;
            for (StudentAttendanceStat stat : stats) {
                Row row = sheet.createRow(rowIdx++);
                row.createCell(0).setCellValue(stat.getStudentCode());
                row.createCell(1).setCellValue(stat.getStudentName());
                row.createCell(2).setCellValue(stat.getTotalSessions());
                row.createCell(3).setCellValue(stat.getAttendedSessions());
                row.createCell(4).setCellValue(stat.getAbsentSessions());
                row.createCell(5).setCellValue(stat.getAbsentPercentage() + "%");
                row.createCell(6).setCellValue(stat.isBanned() ? "CẤM THI" : "");
            }
            workbook.write(out);
            return new ByteArrayInputStream(out.toByteArray());
        } catch (Exception e) {
            throw new BusinessException("Lỗi khi xuất file Excel: " + e.getMessage());
        }
    }
    @Override
    public List<CourseResponse> getAllCourses() {
        return courseRepository.findAll().stream().map(courseMapper::toResponse).collect(Collectors.toList());
    }
    @Override
    public CourseResponse getCourseById(Long id) {
        return courseRepository.findById(id).map(courseMapper::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Course", "id", id));
    }
    @Override
    public void deleteCourse(Long id) {
        if (!courseRepository.existsById(id)) {
            throw new ResourceNotFoundException("Course", "id", id);
        }
        courseRepository.deleteById(id);
    }
}