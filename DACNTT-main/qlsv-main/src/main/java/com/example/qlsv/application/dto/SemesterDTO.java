package com.example.qlsv.application.dto;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

@Data
public class SemesterDTO {

    private Long id;

    @NotBlank(message = "Tên học kỳ không được để trống")
    private String name;

    @NotNull(message = "Năm học không được để trống")
    @Min(value = 2000, message = "Năm học phải lớn hơn 2000")
    private int year;

    @NotNull(message = "Ngày bắt đầu không được để trống")
    private LocalDate startDate;

    @NotNull(message = "Ngày kết thúc không được để trống")
    private LocalDate endDate;

    /**
     * Quy tắc nghiệp vụ: Ngày kết thúc phải sau ngày bắt đầu
     */
    @AssertTrue(message = "Ngày kết thúc phải sau ngày bắt đầu")
    private boolean isEndDateAfterStartDate() {
        // Cho phép null (để @NotNull bắt lỗi)
        if (startDate == null || endDate == null) {
            return true;
        }
        return endDate.isAfter(startDate);
    }
}