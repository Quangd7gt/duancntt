package com.example.qlsv.application.service;

import com.example.qlsv.domain.model.AttendanceRecord;
import com.example.qlsv.domain.model.AttendanceSession;
import com.example.qlsv.domain.model.User;
import com.example.qlsv.domain.model.enums.AttendanceStatus;
import com.example.qlsv.domain.model.enums.Role;
import com.example.qlsv.domain.repository.AttendanceRecordRepository;
import com.example.qlsv.domain.repository.CourseRepository;
import com.example.qlsv.infrastructure.service.EmailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Ghi nhận vắng mặt cho sinh viên chưa điểm danh khi phiên kết thúc.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AttendanceAbsenceMarkingService {

    private final AttendanceRecordRepository recordRepository;
    private final CourseRepository courseRepository;
    private final EmailService emailService;

    @Transactional
    public void markAbsentForSession(AttendanceSession session, Long courseId) {
        List<User> studentsInCourse = courseRepository.findStudentsByCourseId(courseId);
        String courseCode = courseRepository.findById(courseId)
                .map(c -> c.getCourseCode())
                .orElse("");

        for (User student : studentsInCourse) {
            if (student.getRole() != Role.ROLE_STUDENT) {
                continue;
            }

            boolean hasRecord = recordRepository.existsBySessionIdAndStudentStudentCode(
                    session.getId(),
                    student.getStudentCode()
            );

            if (!hasRecord) {
                AttendanceRecord absentRecord = AttendanceRecord.builder()
                        .session(session)
                        .student(student)
                        .checkInTime(null)
                        .status(AttendanceStatus.ABSENT)
                        .build();

                recordRepository.save(absentRecord);
                log.info("Ghi vắng: session={}, student={}", session.getId(), student.getStudentCode());

                try {
                    emailService.sendAttendanceWarning(
                            student.getEmail(),
                            student.getLastName() + " " + student.getFirstName(),
                            courseCode,
                            session.getStartTime().toString()
                    );
                } catch (Exception e) {
                    log.error("Lỗi gửi mail cảnh báo vắng mặt: {}", e.getMessage());
                }
            }
        }
    }
}
