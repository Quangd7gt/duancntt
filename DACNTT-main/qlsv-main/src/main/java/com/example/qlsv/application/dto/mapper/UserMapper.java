package com.example.qlsv.application.dto.mapper;

import com.example.qlsv.application.dto.response.SimpleStudentResponse;
import com.example.qlsv.application.dto.response.SimpleLecturerResponse; // Import thêm nếu chưa có
import com.example.qlsv.application.dto.response.UserResponse;
import com.example.qlsv.domain.model.User;
import com.example.qlsv.domain.model.enums.Role;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface UserMapper {

    // 1. Map chi tiết User (Dùng cho /me và /users/{id})
    @Mapping(target = "role", expression = "java(roleToString(user.getRole()))")
    // Các trường firstName, lastName, studentCode... cùng tên nên MapStruct tự map
    UserResponse toResponse(User user);

    default String roleToString(Role role) {
        return role != null ? role.name() : null;
    }

    // 2. Map cho danh sách SV trong lớp (Giữ nguyên logic cũ của bạn)
    @Mapping(source = "id", target = "id")
    @Mapping(source = "studentCode", target = "studentCode")
    @Mapping(source = "firstName", target = "firstName")
    @Mapping(source = "lastName", target = "lastName")
    @Mapping(source = "email", target = "email")
    SimpleStudentResponse userToSimpleStudentResponse(User user);

    // 3. Map cho thông tin giảng viên (Giữ nguyên logic cũ)
    @Mapping(source = "id", target = "id")
    @Mapping(source = "lecturerCode", target = "lecturerCode")
    @Mapping(source = "firstName", target = "firstName")
    @Mapping(source = "lastName", target = "lastName")
    @Mapping(source = "department", target = "department")
    SimpleLecturerResponse userToSimpleLecturerResponse(User user);
}