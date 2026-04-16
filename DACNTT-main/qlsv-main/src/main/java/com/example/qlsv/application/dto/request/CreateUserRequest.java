package com.example.qlsv.application.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CreateUserRequest {

    @Size(min = 3, max = 50,message = "vui lòng điền username(3-50 kí tự)")
    private String username;

    @Size(min = 6, max = 100,message = "vui lòng điền password(6-100 kí tự)")
    private String password;

    @Email
    private String email;

    @NotBlank
    private String role; // STUDENT, LECTURER, ADMIN

    // Thông tin chung
    @Size(min = 3, max = 50,message = "vui lòng điền FirstName(3-50 kí tự)")
    private String firstName;
    @Size(min = 3, max = 50,message = "vui lòng điền LastName(3-50 kí tự)")
    private String lastName;

    // --- BẮT BUỘC NẾU LÀ STUDENT ---
    private String studentCode;

    // --- BẮT BUỘC NẾU LÀ LECTURER ---
    private String lecturerCode;
    private String department;
}