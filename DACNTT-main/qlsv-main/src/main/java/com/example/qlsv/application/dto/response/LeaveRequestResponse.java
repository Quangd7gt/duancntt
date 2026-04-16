package com.example.qlsv.application.dto.response;

import com.example.qlsv.domain.model.enums.LeaveRequestStatus;
import com.example.qlsv.domain.model.enums.LeaveRequestType;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class LeaveRequestResponse {
    private Long id;
    private String courseName;
    private String studentName;
    private String studentCode;
    private LocalDate requestDate;
    private String reason;
    private LeaveRequestStatus status;
    private LeaveRequestType type;
    private LocalDateTime createdAt;
}
