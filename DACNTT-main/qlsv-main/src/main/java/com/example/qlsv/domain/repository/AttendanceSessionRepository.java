package com.example.qlsv.domain.repository;

import com.example.qlsv.domain.model.AttendanceSession;
import com.example.qlsv.domain.model.enums.SessionStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AttendanceSessionRepository extends JpaRepository<AttendanceSession, Long> {

    // Đây là một quy tắc nghiệp vụ quan trọng:
    // Kiểm tra xem có phiên nào ĐANG MỞ cho lớp học này không
    Optional<AttendanceSession> findByCourseIdAndStatus(Long courseId, SessionStatus status);
    List<AttendanceSession> findAllByStatus(SessionStatus status);
    List<AttendanceSession> findByCourseIdOrderByStartTimeDesc(Long courseId);
}