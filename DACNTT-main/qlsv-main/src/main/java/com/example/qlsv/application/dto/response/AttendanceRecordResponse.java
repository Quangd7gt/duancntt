package com.example.qlsv.application.dto.response;

import com.example.qlsv.domain.model.enums.AttendanceStatus;
import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class AttendanceRecordResponse {
    private Long id;              // ID của bản ghi (để dùng cho việc sửa trạng thái)
    private String studentCode;
    private String studentName;   // Họ tên sinh viên
    private LocalDateTime checkInTime;
    private AttendanceStatus status; // PRESENT, LATE, EXCUSED
}