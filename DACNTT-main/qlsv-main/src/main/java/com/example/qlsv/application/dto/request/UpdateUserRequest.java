package com.example.qlsv.application.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;
import lombok.Data;

/**
 * DTO để cập nhật thông tin người dùng.
 * Không cho phép cập nhật username, password, hoặc role qua DTO này
 * (việc đó nên có API riêng).
 */
@Data
public class UpdateUserRequest {

    @Email(message = "Email không đúng định dạng")
    private String email;

    @Size(min = 1, max = 50, message = "Tên không hợp lệ")
    private String firstName;

    @Size(min = 1, max = 50, message = "Họ không hợp lệ")
    private String lastName;

    // Thông tin riêng
    private String studentCode;
    private String lecturerCode;
    private String department;
}