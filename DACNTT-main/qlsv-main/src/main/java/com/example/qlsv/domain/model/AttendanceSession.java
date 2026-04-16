package com.example.qlsv.domain.model;

import com.example.qlsv.domain.model.enums.SessionStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "attendance_sessions")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AttendanceSession {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "course_id")
    private Course course;

    // --- SỬA ĐOẠN NÀY: Trỏ tới User thay vì Lecturer ---
    @ManyToOne
    @JoinColumn(name = "lecturer_user_id") // Đổi tên cột cho khớp logic mới
    private User lecturer;
    // --------------------------------------------------

    private LocalDateTime startTime;

    private String qrCodeData;

    @Enumerated(EnumType.STRING)
    private SessionStatus status;
}