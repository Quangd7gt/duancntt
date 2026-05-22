package com.example.qlsv.infrastructure.task;

import com.example.qlsv.application.service.AttendanceAbsenceMarkingService;
import com.example.qlsv.domain.model.AttendanceSession;
import com.example.qlsv.domain.model.enums.SessionStatus;
import com.example.qlsv.domain.repository.AttendanceSessionRepository;
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
    private final AttendanceAbsenceMarkingService absenceMarkingService;

    @Scheduled(cron = "0 */1 * * * *")
    @Transactional
    public void autoCloseSessionsAndMarkAbsent() {
        log.info("Bắt đầu quét các phiên điểm danh quá hạn...");

        List<AttendanceSession> openSessions = sessionRepository.findAllByStatusWithCourse(SessionStatus.OPEN);
        LocalDateTime now = LocalDateTime.now();

        for (AttendanceSession session : openSessions) {
            if (session.getCourse().getEndTime() != null
                    && now.toLocalTime().isAfter(session.getCourse().getEndTime())) {
                log.info("Đóng phiên: {}", session.getId());

                absenceMarkingService.markAbsentForSession(session, session.getCourse().getId());
                session.setStatus(SessionStatus.CLOSED);
                sessionRepository.save(session);
            }
        }
    }
}
