package com.example.qlsv.application.dto.request;

import com.example.qlsv.domain.model.enums.LeaveRequestType;
import lombok.Data;

import java.time.LocalDate;

@Data
public class CreateLeaveRequest {
    private Long courseId;
    private String reason;
    private LocalDate requestDate;
    private LeaveRequestType type; // ABSENCE hoặc LATE
}
