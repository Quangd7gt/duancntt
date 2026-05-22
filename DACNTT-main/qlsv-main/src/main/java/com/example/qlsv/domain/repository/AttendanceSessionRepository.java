package com.example.qlsv.domain.repository;

import com.example.qlsv.domain.model.AttendanceSession;
import com.example.qlsv.domain.model.enums.SessionStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AttendanceSessionRepository extends JpaRepository<AttendanceSession, Long> {

    // Đây là một quy tắc nghiệp vụ quan trọng:
    // Kiểm tra xem có phiên nào ĐANG MỞ cho lớp học này không
    Optional<AttendanceSession> findByCourseIdAndStatus(Long courseId, SessionStatus status);
    List<AttendanceSession> findAllByStatus(SessionStatus status);

    @Query("SELECT s FROM AttendanceSession s JOIN FETCH s.course WHERE s.status = :status")
    List<AttendanceSession> findAllByStatusWithCourse(@Param("status") SessionStatus status);
    List<AttendanceSession> findByCourse_IdOrderByStartTimeDesc(Long courseId);

    @Query("SELECT COUNT(s) FROM AttendanceSession s WHERE s.course.id = :courseId")
    long countAllByCourseId(@Param("courseId") Long courseId);

    @Query("SELECT COUNT(s) FROM AttendanceSession s WHERE s.course.id = :courseId AND s.status = :status")
    long countByCourseIdAndStatus(@Param("courseId") Long courseId, @Param("status") SessionStatus status);
}