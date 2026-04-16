package com.example.qlsv.application.dto.request;

import com.example.qlsv.domain.model.enums.LeaveRequestStatus;
import lombok.Data;

@Data
public class UpdateLeaveStatusRequest {
    private LeaveRequestStatus status; // APPROVED hoặc REJECTED
}
