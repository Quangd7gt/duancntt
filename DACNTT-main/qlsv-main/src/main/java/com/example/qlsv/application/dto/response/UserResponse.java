package com.example.qlsv.application.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL) // Ẩn các trường null (Ví dụ: GV sẽ không hiện studentCode)
public class UserResponse {
    private Long id;
    private String username;
    private String email;
    private String role;

    // --- CÁC TRƯỜNG BỔ SUNG ---
    private String firstName;
    private String lastName;
    private String studentCode;  // Chỉ hiện nếu là SV
    private String lecturerCode; // Chỉ hiện nếu là GV
    private String department;   // Chỉ hiện nếu là GV
    private boolean enabled;
}