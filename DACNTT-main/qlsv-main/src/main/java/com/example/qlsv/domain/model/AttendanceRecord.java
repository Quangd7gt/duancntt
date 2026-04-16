package com.example.qlsv.domain.model;

import com.example.qlsv.domain.model.enums.AttendanceStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "attendance_records", indexes = {
        // Tạo index kép để tìm nhanh cặp (Session + Student)
        @Index(name = "idx_att_record_session_student", columnList = "session_id, student_user_id")
})
public class AttendanceRecord {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "session_id")
    private AttendanceSession session;

    // --- THAY ĐỔI: Trỏ tới User ---
    @ManyToOne
    @JoinColumn(name = "student_user_id")
    private User student;

    private LocalDateTime checkInTime;

    @Enumerated(EnumType.STRING)
    private AttendanceStatus status;
}