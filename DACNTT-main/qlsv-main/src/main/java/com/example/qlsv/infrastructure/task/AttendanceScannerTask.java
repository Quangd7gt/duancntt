package com.example.qlsv.infrastructure.task;

import com.example.qlsv.domain.model.AttendanceSession;
import com.example.qlsv.domain.model.AttendanceRecord;
import com.example.qlsv.domain.model.User;
import com.example.qlsv.domain.model.enums.AttendanceStatus;
import com.example.qlsv.domain.model.enums.Role;
import com.example.qlsv.domain.model.enums.SessionStatus;
import com.example.qlsv.domain.repository.AttendanceRecordRepository;
import com.example.qlsv.domain.repository.AttendanceSessionRepository;
import com.example.qlsv.domain.repository.UserRepository;
import com.example.qlsv.infrastructure.service.EmailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Component
@Slf4j
@RequiredArgsConstructor
public class AttendanceScannerTask {

    private final AttendanceSessionRepository sessionRepository;
    private final AttendanceRecordRepository recordRepository;
    private final UserRepository userRepository; // Dùng UserRepository thay vì StudentRepository
    private final EmailService emailService;

    // Chạy định kỳ mỗi phút (để test) hoặc mỗi 30p
    @Scheduled(cron = "0 */1 * * * *")
    @Transactional
    public void autoCloseSessionsAndMarkAbsent() {
        log.info("Bắt đầu quét các phiên điểm danh quá hạn...");

        // 1. Tìm các phiên đang OPEN mà đã quá giờ kết thúc
        List<AttendanceSession> openSessions = sessionRepository.findAllByStatus(SessionStatus.OPEN);
        LocalDateTime now = LocalDateTime.now();

        for (AttendanceSession session : openSessions) {
            // Nếu thời gian hiện tại > thời gian kết thúc của lớp học
            if (now.toLocalTime().isAfter(session.getCourse().getEndTime())) {
                log.info("Đóng phiên: {}", session.getId());

                // Đóng phiên
                session.setStatus(SessionStatus.CLOSED);
                sessionRepository.save(session);

                // Quét vắng mặt cho phiên này
                markAbsentForSession(session);
            }
        }
    }

    private void markAbsentForSession(AttendanceSession session) {
        // Lấy danh sách tất cả sinh viên (User có Role Student) trong lớp đó
        // Lưu ý: Course.getStudents() trả về Set<User>
        var studentsInCourse = session.getCourse().getStudents();

        for (User student : studentsInCourse) {
            // Bỏ qua nếu không phải Role Student (đề phòng dữ liệu rác)
            if (student.getRole() != Role.ROLE_STUDENT) continue;

            // Kiểm tra xem sinh viên này đã có bản ghi điểm danh trong phiên này chưa
            boolean hasRecord = recordRepository.existsBySessionIdAndStudentStudentCode(
                    session.getId(),
                    student.getStudentCode()
            );

            // Nếu chưa có record => Đánh dấu là ABSENT
            if (!hasRecord) {
                AttendanceRecord absentRecord = AttendanceRecord.builder()
                        .session(session)
                        .student(student) // Link với User
                        .checkInTime(null)
                        .status(AttendanceStatus.ABSENT)
                        .build();

                recordRepository.save(absentRecord);

                // Gửi mail cảnh báo (Optional)
                try {
                    emailService.sendAttendanceWarning(
                            student.getEmail(),
                            student.getLastName() + " " + student.getFirstName(),
                            session.getCourse().getCourseCode(),
                            session.getStartTime().toString()
                    );
                } catch (Exception e) {
                    log.error("Lỗi gửi mail: {}", e.getMessage());
                }
            }
        }
    }
}