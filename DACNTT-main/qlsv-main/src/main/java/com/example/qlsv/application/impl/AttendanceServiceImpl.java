package com.example.qlsv.application.impl;

import com.example.qlsv.application.dto.mapper.AttendanceSessionMapper;
import com.example.qlsv.application.dto.request.StartSessionRequest;
import com.example.qlsv.application.dto.request.StudentCheckInRequest;
import com.example.qlsv.application.dto.response.*;
import com.example.qlsv.application.service.AttendanceService;
import com.example.qlsv.domain.exception.BusinessException;
import com.example.qlsv.domain.exception.ResourceNotFoundException;
import com.example.qlsv.domain.model.*;
import com.example.qlsv.domain.model.enums.AttendanceStatus;
import com.example.qlsv.domain.model.enums.Role;
import com.example.qlsv.domain.model.enums.SessionStatus;
import com.example.qlsv.domain.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AttendanceServiceImpl implements AttendanceService {

    private final AttendanceSessionRepository sessionRepository;
    private final AttendanceRecordRepository recordRepository;
    private final CourseRepository courseRepository;
    private final UserRepository userRepository;
    private final AttendanceSessionMapper sessionMapper;

    @Override
    @Transactional
    public AttendanceSessionResponse startSession(StartSessionRequest request, Long userId) {
        User lecturer = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        if (lecturer.getRole() != Role.ROLE_LECTURER) {
            throw new BusinessException("Người dùng không phải là giảng viên");
        }

        Course course = courseRepository.findById(request.getCourseId())
                .orElseThrow(() -> new ResourceNotFoundException("Course", "id", request.getCourseId()));

        boolean isAssigned = course.getLecturers().stream()
                .anyMatch(l -> l.getId().equals(lecturer.getId()));

        if (!isAssigned) {
            throw new BusinessException("Giảng viên không phụ trách lớp học này.");
        }

        LocalDateTime now = LocalDateTime.now();

        // Logic đóng session cũ
        sessionRepository.findByCourseIdAndStatus(course.getId(), SessionStatus.OPEN)
                .ifPresent(session -> {
                    session.setStatus(SessionStatus.CLOSED);
                    sessionRepository.save(session);
                });

        AttendanceSession session = AttendanceSession.builder()
                .course(course)
                .lecturer(lecturer)
                .startTime(now)
                .status(SessionStatus.OPEN)
                .qrCodeData(UUID.randomUUID().toString())
                .build();

        return sessionMapper.toResponse(sessionRepository.save(session));
    }

    @Override
    @Transactional
    public CheckInResponse studentCheckIn(StudentCheckInRequest request, Long userId) {
        User student = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        if (student.getRole() != Role.ROLE_STUDENT) {
            throw new BusinessException("Người dùng không phải là sinh viên");
        }

        AttendanceSession session = sessionRepository.findByCourseIdAndStatus(request.getCourseId(), SessionStatus.OPEN)
                .orElseThrow(() -> new BusinessException("Giảng viên chưa mở điểm danh hoặc phiên đã đóng."));

        boolean isInClass = session.getCourse().getStudents().stream()
                .anyMatch(s -> s.getId().equals(student.getId()));

        if (!isInClass) {
            throw new BusinessException("Sinh viên không thuộc danh sách lớp học phần này.");
        }

        // Kiểm tra QR Code (đảm bảo request có getter)
        if (request.getQrCodeData() != null && !request.getQrCodeData().equals(session.getQrCodeData())) {
            throw new BusinessException("Mã QR không hợp lệ.");
        }

        if (recordRepository.existsBySessionIdAndStudentStudentCode(session.getId(), student.getStudentCode())) {
            throw new BusinessException("Sinh viên đã điểm danh rồi.");
        }

        AttendanceRecord record = AttendanceRecord.builder()
                .session(session)
                .student(student)
                .checkInTime(LocalDateTime.now())
                .status(AttendanceStatus.PRESENT)
                .build();

        recordRepository.save(record);

        return CheckInResponse.builder()
                .status("SUCCESS")
                .message("Điểm danh thành công!")
                .attendanceStatus(AttendanceStatus.PRESENT)
                .build();
    }

    @Override
    @Transactional
    public AttendanceSessionResponse closeSession(Long courseId, Long userId) {
        User lecturer = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException("Không tìm thấy user."));

        AttendanceSession session = sessionRepository.findByCourseIdAndStatus(courseId, SessionStatus.OPEN)
                .orElseThrow(() -> new BusinessException("Không có phiên điểm danh nào đang mở."));

        if (!session.getLecturer().getId().equals(lecturer.getId())) {
            throw new BusinessException("Bạn không có quyền đóng phiên của người khác.");
        }

        session.setStatus(SessionStatus.CLOSED);
        return sessionMapper.toResponse(sessionRepository.save(session));
    }

    @Override
    public List<AttendanceSessionResponse> getSessionsByCourse(Long courseId) {
        if (!courseRepository.existsById(courseId)) {
            throw new ResourceNotFoundException("Course", "id", courseId);
        }
        return sessionRepository.findByCourseIdOrderByStartTimeDesc(courseId).stream()
                .map(sessionMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<StudentHistoryResponse> getStudentHistory(Long courseId, String studentCode) {
        List<AttendanceRecord> records = recordRepository.findBySessionCourseIdAndStudentStudentCodeOrderByCheckInTimeDesc(courseId, studentCode);

        return records.stream().map(r -> StudentHistoryResponse.builder()
                .sessionId(r.getSession().getId())
                .sessionDate(r.getSession().getStartTime())
                .checkInTime(r.getCheckInTime())
                .status(r.getStatus())
                .build()).collect(Collectors.toList());
    }

    @Override
    public void updateRecordStatus(Long recordId, AttendanceStatus status) {
        AttendanceRecord record = recordRepository.findById(recordId)
                .orElseThrow(() -> new ResourceNotFoundException("AttendanceRecord", "id", recordId));
        record.setStatus(status);
        recordRepository.save(record);
    }

    @Override
    public List<AttendanceRecordResponse> getRecordsBySession(Long sessionId) {
        if (!sessionRepository.existsById(sessionId)) {
            throw new ResourceNotFoundException("AttendanceSession", "id", sessionId);
        }
        return recordRepository.findBySessionIdOrderByCheckInTimeDesc(sessionId).stream()
                .map(record -> AttendanceRecordResponse.builder()
                        .id(record.getId())
                        .studentCode(record.getStudent().getStudentCode())
                        .studentName(record.getStudent().getLastName() + " " + record.getStudent().getFirstName())
                        .checkInTime(record.getCheckInTime())
                        .status(record.getStatus())
                        .build())
                .collect(Collectors.toList());
    }
}