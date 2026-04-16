package com.example.qlsv.application.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class StartSessionRequest {
    @NotNull(message = "Course ID không được để trống")
    private Long courseId;
}