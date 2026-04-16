package com.example.qlsv.application.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class RegisterStudentRequest {

    @NotBlank // Input là Mã SV
    private String studentCode;

    @NotNull
    private Long courseId;
}