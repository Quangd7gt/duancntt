package com.example.qlsv.application.dto.response;

import com.example.qlsv.domain.model.enums.AttendanceStatus;
import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class StudentHistoryResponse {
    private Long sessionId;
    private LocalDateTime sessionDate; // Ngày giờ buổi học
    private LocalDateTime checkInTime; // Giờ sinh viên quét (có thể null nếu vắng)
    private AttendanceStatus status;   // PRESENT, LATE, ABSENT, EXCUSED
}