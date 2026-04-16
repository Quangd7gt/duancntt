package com.example.qlsv.application.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class SubjectDTO {

    private Long id; // Chỉ dùng cho Response

    @NotBlank(message = "Mã môn học không được để trống")
    @Size(max = 20, message = "Mã môn học không quá 20 ký tự")
    private String subjectCode;

    @NotBlank(message = "Tên môn học không được để trống")
    @Size(max = 200, message = "Tên môn học không quá 200 ký tự")
    private String name;

    @Min(value = 0, message = "Số tín chỉ phải lớn hơn hoặc bằng 0")
    private int credits;
}