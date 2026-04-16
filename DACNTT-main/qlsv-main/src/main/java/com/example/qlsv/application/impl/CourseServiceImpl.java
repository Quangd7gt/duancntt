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
// Import Custom Enum
import com.example.qlsv.domain.model.enums.Role;
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

        // 2. Tính tổng số buổi lẽ ra phải học tính đến hiện tại
        long totalSessionsPassed = calculateTotalSessions(
                course.getSemester().getStartDate(),
                LocalDate.now(),
                course.getDayOfWeek()
        );

        // 3. Lấy danh sách sinh viên trong lớp
        List<User> students = courseRepository.findStudentsByCourseId(courseId);

        // 4. Lấy dữ liệu đi học từ DB
        List<Object[]> presentCounts = recordRepository.countPresentSessionsByCourse(courseId);
        java.util.Map<String, Long> attendanceMap = presentCounts.stream()
                .collect(Collectors.toMap(
                        row -> (String) row[0],
                        row -> (Long) row[1]
                ));

        // 5. Tính toán danh sách chi tiết (Lưu vào biến stats thay vì return ngay)
        List<StudentAttendanceStat> stats = students.stream().map(student -> {
            long attended = attendanceMap.getOrDefault(student.getStudentCode(), 0L);
            long absent = totalSessionsPassed - attended;
            if (absent < 0) absent = 0;

            double percent = (totalSessionsPassed > 0) ? ((double) absent / totalSessionsPassed) * 100 : 0;
            boolean isBanned = percent > 20;

            return StudentAttendanceStat.builder()
                    .studentCode(student.getStudentCode())
                    .studentName(student.getLastName() + " " + student.getFirstName())
                    .totalSessions(totalSessionsPassed)
                    .attendedSessions(attended)
                    .absentSessions(absent)
                    .absentPercentage(Math.round(percent * 10.0) / 10.0)
                    .isBanned(isBanned)
                    .build();
        }).collect(Collectors.toList());

        // 6. --- THÊM MỚI: Tính tổng số lượng bị cấm thi ---
        int bannedCount = (int) stats.stream()
                .filter(StudentAttendanceStat::isBanned) // Lọc những người bị ban
                .count(); // Đếm

        // 7. Đóng gói vào DTO mới và trả về
        return CourseDashboardResponse.builder()
                .totalBanned(bannedCount)       // Số lượng bị cấm thi
                .studentDetails(stats)          // Danh sách chi tiết
                .build();
    }
    // SỬA HÀM NÀY ĐỂ TRÁNH XUNG ĐỘT TYPE
    private long calculateTotalSessions(LocalDate start, LocalDate end, DayOfWeek dayOfWeek) {
        long count = 0;
        LocalDate date = start;
        // Chuyển DayOfWeek (Custom) sang String để so sánh
        String targetDayName = dayOfWeek.name();

        while (!date.isAfter(end)) {
            // date.getDayOfWeek() trả về java.time.DayOfWeek -> Lấy name() để so sánh
            if (date.getDayOfWeek().name().equals(targetDayName)) {
                count++;
            }
            date = date.plusDays(1);
        }
        return count;
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