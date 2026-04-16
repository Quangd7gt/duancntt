package com.example.qlsv.application.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class StudentCheckInRequest {
    @NotNull(message = "Course ID cannot be null")
    private Long courseId;

    private String qrCodeData; // Trường này phải có để service gọi getQrCodeData()
}