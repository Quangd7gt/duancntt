package com.example.qlsv.application.service;

import com.example.qlsv.application.dto.request.CreateUserRequest;
import com.example.qlsv.application.dto.request.UpdateUserRequest; // <-- IMPORT MỚI
import com.example.qlsv.application.dto.response.UserResponse;
import org.springframework.data.domain.Page; // <-- IMPORT MỚI
import org.springframework.data.domain.Pageable; // <-- IMPORT MỚI

public interface UserService {

    // (Đã có)
    UserResponse createUser(CreateUserRequest request);

    // --- [MỚI] BỔ SUNG CÁC HÀM CRUD CÒN LẠI ---

    /**
     * Lấy thông tin người dùng bằng ID.
     */
    UserResponse getUserById(Long id);

    /**
     * Lấy tất cả người dùng (có phân trang).
     */
    Page<UserResponse> getAllUsers(Pageable pageable);

    /**
     * Cập nhật thông tin người dùng.
     */
    UserResponse updateUser(Long id, UpdateUserRequest request);

    /**
     * Xóa một người dùng.
     */
    void deleteUser(Long id);
    void resetPassword(String username);
}