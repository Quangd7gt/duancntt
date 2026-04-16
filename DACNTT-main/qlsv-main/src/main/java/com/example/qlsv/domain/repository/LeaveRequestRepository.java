package com.example.qlsv.domain.repository;

import com.example.qlsv.domain.model.LeaveRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface LeaveRequestRepository extends JpaRepository<LeaveRequest, Long> {
    // Sinh viên xem đơn của mình
    List<LeaveRequest> findByStudent_IdOrderByCreatedAtDesc(Long studentId);

    // Giảng viên xem đơn của một lớp cụ thể
    List<LeaveRequest> findByCourse_IdOrderByCreatedAtDesc(Long courseId);
}