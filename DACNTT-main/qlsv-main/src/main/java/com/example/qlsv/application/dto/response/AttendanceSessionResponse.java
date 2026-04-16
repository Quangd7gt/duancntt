package com.example.qlsv.application.dto.response;

import com.example.qlsv.domain.model.enums.SessionStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AttendanceSessionResponse {
    private Long sessionId;
    private Long courseId;
    private String courseName;
    private LocalDateTime startTime;
    private SessionStatus status;
    private String qrCodeData; // Client sẽ dùng cái này để render mã QR
}