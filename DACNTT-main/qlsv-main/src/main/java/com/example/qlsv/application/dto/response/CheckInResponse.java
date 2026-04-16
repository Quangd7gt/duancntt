package com.example.qlsv.application.dto.response;

import com.example.qlsv.domain.model.enums.AttendanceStatus;
import lombok.AllArgsConstructor;
import lombok.Builder; // Thêm Builder
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder // <--- QUAN TRỌNG
@NoArgsConstructor
@AllArgsConstructor
public class CheckInResponse {
    private String status;
    private String message;
    private AttendanceStatus attendanceStatus;
}