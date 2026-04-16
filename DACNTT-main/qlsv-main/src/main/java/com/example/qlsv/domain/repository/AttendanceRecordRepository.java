package com.example.qlsv.domain.repository;

import com.example.qlsv.domain.model.AttendanceRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AttendanceRecordRepository extends JpaRepository<AttendanceRecord, Long> {

    boolean existsBySessionIdAndStudentStudentCode(Long sessionId, String studentCode);
    List<AttendanceRecord> findBySessionCourseIdAndStudentStudentCodeOrderByCheckInTimeDesc(Long courseId, String studentCode);
    List<AttendanceRecord> findBySessionIdOrderByCheckInTimeDesc(Long sessionId);

    // --- THÊM ĐOẠN NÀY ---
    // Đếm số buổi ĐÃ ĐI HỌC (Có mặt, Muộn hoặc Có phép) của từng sinh viên trong 1 lớp
    @Query("SELECT r.student.studentCode, COUNT(r) " +
            "FROM AttendanceRecord r " +
            "WHERE r.session.course.id = :courseId " +
            "AND r.status IN (com.example.qlsv.domain.model.enums.AttendanceStatus.PRESENT, " +
            "com.example.qlsv.domain.model.enums.AttendanceStatus.LATE, " +
            "com.example.qlsv.domain.model.enums.AttendanceStatus.EXCUSED) " +
            "GROUP BY r.student.studentCode")
    List<Object[]> countPresentSessionsByCourse(@Param("courseId") Long courseId);
}